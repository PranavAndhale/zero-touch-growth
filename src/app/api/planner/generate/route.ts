import { NextRequest, NextResponse } from "next/server";
import { plannerRequestSchema, validateAndParse } from "@/lib/validation";
import { getBusinessFromFirestore, savePlanToFirestore } from "@/lib/firebase";
import { getUpcomingFestivals } from "@/lib/calendarific";
import { getIndustryTrends } from "@/lib/trends";
import { getIndustryNews } from "@/lib/gnews";
import { buildWeeklyPlannerPrompt } from "@/lib/prompts/weekly-planner";
import { callGeminiJSON, GeminiRateLimitError, isGeminiAvailable } from "@/lib/gemini";
import { BusinessDocument } from "@/lib/types/business";
import { WeeklyPlan, Festival, PlannerResponse } from "@/lib/types/calendar";
import { addDays, format, parseISO } from "date-fns";
import { getFallbackWeeklyPlan } from "@/lib/fallback";

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

  const { businessId, weekStartDate, weeklyGoals } = validation.data;

  // ── Load business profile ───────────────────────────────────────────────────
  const businessDoc = await getBusinessFromFirestore(businessId);
  if (!businessDoc) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }
  const business = businessDoc as unknown as BusinessDocument;

  // ── Gather context data ─────────────────────────────────────────────────────
  const [allFestivals, trends, news] = await Promise.all([
    getUpcomingFestivals("IN", 90),
    getIndustryTrends(business.input.industry),
    getIndustryNews(business.input.industry),
  ]);

  const weekEnd = format(addDays(parseISO(weekStartDate), 6), "yyyy-MM-dd");

  const weekFestivals = allFestivals.filter(
    (f) => f.date >= weekStartDate && f.date <= weekEnd
  );
  const nearbyFestivals = allFestivals.filter(
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
        return NextResponse.json({ error: "Plan generation failed. Please try again." }, { status: 500 });
      }
    }
  }

  // ── Save to Firestore ───────────────────────────────────────────────────────
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
  // Ensure all 7 days exist
  const allDays = plan.days || [];

  // Sort posts within each day by time
  for (const day of allDays) {
    if (Array.isArray(day.posts)) {
      day.posts.sort((a, b) => a.time.localeCompare(b.time));
      // Cap hashtags at 10
      for (const post of day.posts) {
        if (post.hashtags?.length > 10) {
          post.hashtags = post.hashtags.slice(0, 10);
        }
        // Ensure id exists
        if (!post.id) {
          post.id = `${day.date}-${Math.random().toString(36).slice(2, 7)}`;
        }
        // Set default status
        post.status = "draft";
      }
    }
  }

  return { ...plan, days: allDays };
}
