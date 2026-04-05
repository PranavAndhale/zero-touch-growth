import { NextRequest, NextResponse } from "next/server";
import { plannerRequestSchema, validateAndParse } from "@/lib/validation";
import { getBusinessFromFirestore, savePlanToFirestore } from "@/lib/firebase";
import { getUpcomingFestivals } from "@/lib/calendarific";
import { getIndustryTrends } from "@/lib/trends";
import { getIndustryNews } from "@/lib/gnews";
import { buildWeeklyPlannerPrompt } from "@/lib/prompts/weekly-planner";
import { callGeminiJSON, GeminiRateLimitError, isGeminiAvailable } from "@/lib/gemini";
import { BusinessDocument, BusinessProfile, AnalyzeRequest } from "@/lib/types/business";
import { WeeklyPlan, Festival, PlannerResponse } from "@/lib/types/calendar";
import { addDays, format, parseISO } from "date-fns";
import { getFallbackWeeklyPlan } from "@/lib/fallback";

export const maxDuration = 25;

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
    return NextResponse.json({ error: "Validation failed", details: validation.errors }, { status: 400 });
  }

  const { businessId, weekStartDate, weeklyGoals, businessData } = validation.data;

  // ── Load business profile ───────────────────────────────────────────────────
  // Try Firestore first; fall back to client-supplied businessData
  let business: BusinessDocument | null = null;

  try {
    const doc = await getBusinessFromFirestore(businessId);
    if (doc) business = doc as unknown as BusinessDocument;
  } catch {
    // Firestore unavailable — continue to fallback
  }

  // Use client-supplied businessData if Firestore returned nothing
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

  // ── Gather context data (all in parallel, all non-fatal) ───────────────────
  const [allFestivals, trends, news] = await Promise.all([
    getUpcomingFestivals("IN", 90).catch(() => []),
    getIndustryTrends(industry).catch(() => []),
    getIndustryNews(industry).catch(() => []),
  ]);

  const weekEnd = format(addDays(parseISO(weekStartDate), 6), "yyyy-MM-dd");

  const weekFestivals = (allFestivals as Festival[]).filter(
    (f) => f.date >= weekStartDate && f.date <= weekEnd
  );
  const nearbyFestivals = (allFestivals as Festival[]).filter(
    (f) => f.daysAway >= 0 && f.daysAway <= 14 && f.marketingRelevance !== "low"
  );

  // ── Generate plan ───────────────────────────────────────────────────────────
  let plan: WeeklyPlan;
  let usedFallback = false;

  if (!isGeminiAvailable()) {
    plan = getFallbackWeeklyPlan(weekStartDate, business.input.name);
    usedFallback = true;
  } else {
    try {
      const prompt = buildWeeklyPlannerPrompt(
        business,
        weekStartDate,
        weekFestivals,
        nearbyFestivals,
        trends,
        news,
        weeklyGoals
      );

      plan = await callGeminiJSON<WeeklyPlan>(prompt, {
        temperature: 0.8,
        maxTokens: 4096,
        jsonMode: true,
      });
      plan = postProcessPlan(plan, weekStartDate);
    } catch (err) {
      if (err instanceof GeminiRateLimitError) {
        plan = getFallbackWeeklyPlan(weekStartDate, business.input.name);
        usedFallback = true;
      } else {
        console.error("Planner generation error:", err);
        // Return fallback instead of error — always give the client something useful
        plan = getFallbackWeeklyPlan(weekStartDate, business.input.name);
        usedFallback = true;
      }
    }
  }

  // ── Save to Firestore (non-fatal) ───────────────────────────────────────────
  let planId = "local-" + Date.now();
  try {
    planId = await savePlanToFirestore({
      businessId,
      weekStartDate,
      weekEndDate: weekEnd,
      plan,
      userGoals: weeklyGoals || null,
      regenerationCount: 0,
      status: "draft",
      contextUsed: {
        festivalsInWeek: weekFestivals.map((f: Festival) => f.name),
        trendsUsed: trends.slice(0, 5).map((t) => t.title),
        newsUsed: news.slice(0, 3).map((n) => n.title),
      },
    });
  } catch (err) {
    console.warn("Firestore plan save failed (non-fatal):", err);
  }

  const response: PlannerResponse & { fallback?: boolean } = {
    success: true,
    planId,
    plan,
    contextUsed: { festivals: weekFestivals, trends, news },
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

  // Ensure exactly 7 days, filling gaps
  if (allDays.length < 7) {
    const DAY_NAMES = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    for (let i = allDays.length; i < 7; i++) {
      const date = format(addDays(parseISO(weekStartDate), i), "yyyy-MM-dd");
      allDays.push({
        date,
        dayName: DAY_NAMES[i],
        isFestival: false,
        festivalName: null,
        posts: [],
      });
    }
  }

  return { ...plan, days: allDays };
}
