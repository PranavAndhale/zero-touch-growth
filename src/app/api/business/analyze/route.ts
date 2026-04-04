import { NextRequest, NextResponse } from "next/server";
import { analyzeRequestSchema, validateAndParse } from "@/lib/validation";
import { scrapeWebsite } from "@/lib/scraper";
import { getUpcomingFestivals } from "@/lib/calendarific";
import { getIndustryTrends } from "@/lib/trends";
import { buildBusinessAnalysisPrompt } from "@/lib/prompts/business-analysis";
import { callGeminiJSON, GeminiRateLimitError, isGeminiAvailable } from "@/lib/gemini";
import { saveBusinessToFirestore } from "@/lib/firebase";
import { BusinessProfile, AnalyzeResponse } from "@/lib/types/business";
import { getFallbackProfile } from "@/lib/fallback";

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  // ── Parse & validate ────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateAndParse(analyzeRequestSchema, body);
  if (!validation.success) {
    return NextResponse.json({ error: "Validation failed", details: validation.errors }, { status: 400 });
  }

  const formData = validation.data;

  // ── Parallel data collection ────────────────────────────────────────────────
  const [scrapedData, trendingTopics, upcomingFestivals] = await Promise.all([
    formData.websiteUrl ? scrapeWebsite(formData.websiteUrl) : Promise.resolve(null),
    getIndustryTrends(formData.industry),
    getUpcomingFestivals("IN", 90),
  ]);

  const sources = {
    website: scrapedData !== null,
    trends: trendingTopics.length > 0,
    festivals: upcomingFestivals.length > 0,
  };

  // ── AI Analysis ─────────────────────────────────────────────────────────────
  let profile: BusinessProfile;
  let usedFallback = false;

  if (!isGeminiAvailable()) {
    profile = getFallbackProfile(formData.industry, formData);
    usedFallback = true;
  } else {
    try {
      const prompt = buildBusinessAnalysisPrompt(
        formData,
        scrapedData,
        trendingTopics,
        upcomingFestivals
      );
      profile = await callGeminiJSON<BusinessProfile>(prompt, {
        temperature: 0.7,
        maxTokens: 4096,
        jsonMode: true,
      });
    } catch (err) {
      if (err instanceof GeminiRateLimitError) {
        // Graceful degradation — return fallback with notice
        profile = getFallbackProfile(formData.industry, formData);
        usedFallback = true;
      } else {
        console.error("Gemini analysis error:", err);
        return NextResponse.json(
          { error: "AI analysis failed. Please try again." },
          { status: 500 }
        );
      }
    }
  }

  // ── Save to Firestore ───────────────────────────────────────────────────────
  let businessId = "local-" + Date.now();
  try {
    businessId = await saveBusinessToFirestore({
      input: formData,
      scrapedData: scrapedData || null,
      profile,
      analysisVersion: 1,
      lastAnalyzedAt: new Date().toISOString(),
    });
  } catch (err) {
    // Non-fatal — continue without persistence
    console.warn("Firestore save failed (non-fatal):", err);
  }

  // ── Respond ─────────────────────────────────────────────────────────────────
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
