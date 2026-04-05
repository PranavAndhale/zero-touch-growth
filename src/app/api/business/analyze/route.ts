import { NextRequest, NextResponse } from "next/server";
import { analyzeRequestSchema, validateAndParse } from "@/lib/validation";
import { BusinessProfile, AnalyzeResponse, Tone } from "@/lib/types/business";
import { TrendingTopic, Festival } from "@/lib/types/calendar";
import { getFallbackProfile } from "@/lib/fallback";

// Tell Vercel to allow up to 25 seconds for this function (hobby plan max)
export const maxDuration = 25;

// Helper: race any async call against a timeout
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  const timer = new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms));
  return Promise.race([promise, timer]);
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  // ── 1. Parse & validate ─────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateAndParse(analyzeRequestSchema, body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.errors },
      { status: 400 }
    );
  }

  const formData = validation.data;

  // ── 2. All external calls wrapped in try/catch + timeout ────────────────────
  // Each call has its own timeout so one slow service can't block everything.
  // We degrade gracefully to empty arrays / null on any failure.

  let scrapedData = null;
  let trendingTopics: TrendingTopic[] = [];
  let upcomingFestivals: Festival[] = [];

  try {
    if (formData.websiteUrl) {
      const { scrapeWebsite } = await import("@/lib/scraper");
      scrapedData = await withTimeout(scrapeWebsite(formData.websiteUrl), 4000, null);
    }
  } catch { /* non-fatal */ }

  try {
    const { getIndustryTrends } = await import("@/lib/trends");
    trendingTopics = await withTimeout<TrendingTopic[]>(getIndustryTrends(formData.industry), 4000, []);
  } catch { /* non-fatal */ }

  try {
    const { getUpcomingFestivals } = await import("@/lib/calendarific");
    upcomingFestivals = await withTimeout<Festival[]>(getUpcomingFestivals("IN", 90), 4000, []);
  } catch { /* non-fatal */ }

  const sources = {
    website: scrapedData !== null,
    trends: trendingTopics.length > 0,
    festivals: upcomingFestivals.length > 0,
  };

  // ── 3. AI Analysis with timeout + automatic fallback ───────────────────────
  let profile: BusinessProfile;
  let usedFallback = false;

  try {
    const { isGeminiAvailable, callGeminiJSON } = await import("@/lib/gemini");
    const { buildBusinessAnalysisPrompt } = await import("@/lib/prompts/business-analysis");

    if (!isGeminiAvailable()) {
      throw new Error("Gemini not configured");
    }

    const prompt = buildBusinessAnalysisPrompt(
      formData,
      scrapedData,
      trendingTopics,
      upcomingFestivals as never
    );

    // 8-second cap so Vercel's serverless doesn't timeout ungracefully
    const aiResult = await withTimeout(
      callGeminiJSON<BusinessProfile>(prompt, {
        temperature: 0.7,
        maxTokens: 2048,
        jsonMode: true,
      }),
      8000,
      null
    );

    if (!aiResult) throw new Error("Gemini timed out");
    profile = aiResult;
  } catch (err) {
    console.warn("AI analysis unavailable, using fallback:", (err as Error).message);
    profile = getFallbackProfile(formData.industry, { ...formData, tone: formData.tone as Tone });
    usedFallback = true;
  }

  // ── 4. Save to Firestore (non-fatal, skip on error) ─────────────────────────
  let businessId = "local-" + Date.now();
  try {
    const { saveBusinessToFirestore } = await import("@/lib/firebase");
    const saved = await withTimeout(
      saveBusinessToFirestore({
        input: formData,
        scrapedData: scrapedData || null,
        profile,
        analysisVersion: 1,
        lastAnalyzedAt: new Date().toISOString(),
      }),
      3000,
      null
    );
    if (saved) businessId = saved;
  } catch { /* non-fatal */ }

  // ── 5. Always return valid JSON ─────────────────────────────────────────────
  const response: AnalyzeResponse & { fallback?: boolean } = {
    success: true,
    businessId,
    profile,
    scrapedData: scrapedData || undefined,
    analysisTime: Date.now() - startTime,
    sources,
    ...(usedFallback && { fallback: true }),
  };

  return NextResponse.json(response, { status: 200 });
}
