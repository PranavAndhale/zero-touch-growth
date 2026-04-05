import { NextRequest, NextResponse } from "next/server";
import { plannerRequestSchema, validateAndParse } from "@/lib/validation";
import { getBusinessFromFirestore, savePlanToFirestore } from "@/lib/firebase";
import { getUpcomingFestivals } from "@/lib/calendarific";
import { getIndustryTrends } from "@/lib/trends";
import { getIndustryNews } from "@/lib/gnews";
import { buildWeeklyPlannerPrompt } from "@/lib/prompts/weekly-planner";
import { callGeminiJSON, isGeminiAvailable } from "@/lib/gemini";
import { BusinessDocument, BusinessProfile, AnalyzeRequest } from "@/lib/types/business";
import { WeeklyPlan, Festival, PlannerResponse } from "@/lib/types/calendar";
import { addDays, format, parseISO } from "date-fns";
import { getFallbackWeeklyPlan } from "@/lib/fallback";

export const maxDuration = 25;

/** Race a promise against a timeout — returns null on timeout */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateAndParse(plannerRequestSchema, body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.errors },
      { status: 400 }
    );
  }

  const { businessId, weekStartDate, weeklyGoals, businessData } = validation.data;

  // ── 1. Load business profile ────────────────────────────────────────────────
  let business: BusinessDocument | null = null;

  try {
    const doc = await withTimeout(getBusinessFromFirestore(businessId), 3000);
    if (doc) business = doc as unknown as BusinessDocument;
  } catch {
    // Firestore unavailable — fall through to client-supplied data
  }

  if (!business && businessData) {
    business = {
      id: businessId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analysisVersion: 1,
      lastAnalyzedAt: new Date().toISOString(),
      input: businessData.input as unknown as AnalyzeRequest,
      profile: businessData.profile as unknown as BusinessProfile,
    };
  }

  if (!business) {
    return NextResponse.json(
      { error: "Business not found. Please re-analyze your business first." },
      { status: 404 }
    );
  }

  const industry = business.input?.industry ?? "general";
  const businessName = business.input?.name ?? "My Business";

  // ── 2. Gather context data — all capped at 3s each ─────────────────────────
  const [allFestivals, trends, news] = await Promise.all([
    withTimeout(getUpcomingFestivals("IN", 90), 3000).catch(() => null),
    withTimeout(getIndustryTrends(industry), 3000).catch(() => null),
    withTimeout(getIndustryNews(industry), 3000).catch(() => null),
  ]);

  const festivals = (allFestivals ?? []) as Festival[];
  const weekEnd = format(addDays(parseISO(weekStartDate), 6), "yyyy-MM-dd");

  const weekFestivals = festivals.filter(
    (f) => f.date >= weekStartDate && f.date <= weekEnd
  );
  const nearbyFestivals = festivals.filter(
    (f) => f.daysAway >= 0 && f.daysAway <= 14 && f.marketingRelevance !== "low"
  );

  // ── 3. Generate plan — Gemini capped at 15s, then fallback ─────────────────
  let plan: WeeklyPlan;
  let usedFallback = false;

  if (!isGeminiAvailable()) {
    plan = getFallbackWeeklyPlan(weekStartDate, businessName);
    usedFallback = true;
  } else {
    try {
      const prompt = buildWeeklyPlannerPrompt(
        business,
        weekStartDate,
        weekFestivals,
        nearbyFestivals,
        trends ?? [],
        news ?? [],
        weeklyGoals
      );

      const aiResult = await withTimeout(
        callGeminiJSON<WeeklyPlan>(prompt, {
          temperature: 0.8,
          maxTokens: 4096,
          jsonMode: true,
        }),
        15000
      );

      if (!aiResult) {
        console.warn("Gemini planner timed out — using fallback");
        plan = getFallbackWeeklyPlan(weekStartDate, businessName);
        usedFallback = true;
      } else {
        plan = postProcessPlan(aiResult, weekStartDate);
      }
    } catch (err) {
      console.error("Planner generation error:", err);
      plan = getFallbackWeeklyPlan(weekStartDate, businessName);
      usedFallback = true;
    }
  }

  // ── 4. Save to Firestore (non-fatal, max 2s) ────────────────────────────────
  let planId = "local-" + Date.now();
  try {
    const saved = await withTimeout(
      savePlanToFirestore({
        businessId,
        weekStartDate,
        weekEndDate: weekEnd,
        plan,
        userGoals: weeklyGoals || null,
        regenerationCount: 0,
        status: "draft",
        contextUsed: {
          festivalsInWeek: weekFestivals.map((f: Festival) => f.name),
          trendsUsed: (trends ?? []).slice(0, 5).map((t) => t.title),
          newsUsed: (news ?? []).slice(0, 3).map((n) => n.title),
        },
      }),
      2000
    );
    if (saved) planId = saved;
  } catch {
    // Non-fatal
  }

  const response: PlannerResponse & { fallback?: boolean } = {
    success: true,
    planId,
    plan,
    contextUsed: { festivals: weekFestivals, trends: trends ?? [], news: news ?? [] },
    generationTime: Date.now() - startTime,
    ...(usedFallback && { fallback: true }),
  };

  return NextResponse.json(response, { status: 200 });
}

function postProcessPlan(plan: WeeklyPlan, weekStartDate: string): WeeklyPlan {
  const allDays = plan.days || [];

  for (const day of allDays) {
    if (Array.isArray(day.posts)) {
      day.posts.sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
      for (const post of day.posts) {
        if (post.hashtags?.length > 10) post.hashtags = post.hashtags.slice(0, 10);
        if (!post.id) post.id = `${day.date}-${Math.random().toString(36).slice(2, 7)}`;
        post.status = "draft";
      }
    }
  }

  // Ensure exactly 7 days
  if (allDays.length < 7) {
    const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    for (let i = allDays.length; i < 7; i++) {
      allDays.push({
        date: format(addDays(parseISO(weekStartDate), i), "yyyy-MM-dd"),
        dayName: DAY_NAMES[i],
        isFestival: false,
        festivalName: null,
        posts: [],
      });
    }
  }

  return { ...plan, days: allDays };
}
