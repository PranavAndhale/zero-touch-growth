import { BusinessDocument } from "../types/business";
import { Festival, TrendingTopic, NewsArticle } from "../types/calendar";
import { addDays, format } from "date-fns";

export function buildWeeklyPlannerPrompt(
  business: BusinessDocument,
  weekStartDate: string,
  weekFestivals: Festival[],
  nearbyFestivals: Festival[],
  trends: TrendingTopic[],
  news: NewsArticle[],
  userGoals?: string
): string {
  const weekEnd = format(addDays(new Date(weekStartDate), 6), "yyyy-MM-dd");

  const goalsSection = userGoals
    ? `\nWEEKLY FOCUS/GOALS: ${userGoals}`
    : "";

  const weekFestivalsSection =
    weekFestivals.length > 0
      ? `\nFESTIVALS THIS WEEK:\n${weekFestivals.map((f) => `- ${f.name} on ${f.date} (${f.type})`).join("\n")}`
      : "\nFESTIVALS THIS WEEK: None";

  const nearbySection =
    nearbyFestivals.length > 0
      ? `\nUPCOMING FESTIVALS (build anticipation):\n${nearbyFestivals
          .filter((f) => f.marketingRelevance !== "low")
          .slice(0, 5)
          .map((f) => `- ${f.name} in ${f.daysAway} days`)
          .join("\n")}`
      : "";

  const trendsSection =
    trends.length > 0
      ? `\nTRENDING IN INDIA:\n${trends
          .slice(0, 5)
          .map((t) => `- ${t.title} (${t.trafficVolume} searches)`)
          .join("\n")}`
      : "";

  const newsSection =
    news.length > 0
      ? `\nINDUSTRY NEWS:\n${news.map((n) => `- ${n.title}`).join("\n")}`
      : "";

  const contentPillarNames = business.profile.contentPillars
    .map((p) => p.name)
    .join(", ");

  const primaryPlatform = business.profile.platformStrategy.primary.platform;

  return `You are an expert Indian social media strategist creating a weekly content calendar for a small business. You understand Indian market dynamics, festival marketing, audience psychology, and social media algorithms.

BUSINESS CONTEXT:
- Name: ${business.input.name}
- Industry: ${business.input.industry}
- Location: ${business.input.location}
- Products/Services: ${business.input.products.slice(0, 5).join(", ")}
- Target Audience: ${business.profile.audiencePersona.primaryDemographic}
- Brand Tone: ${business.input.tone}
- Primary Platform: ${primaryPlatform}
- Content Pillars: ${contentPillarNames}
${goalsSection}

WEEK: ${weekStartDate} to ${weekEnd}
${weekFestivalsSection}
${nearbySection}
${trendsSection}
${newsSection}

POSTING GUIDELINES:
- Instagram: Best times 12:00-13:00 and 18:00-20:00 IST. Mix carousels, single posts, stories.
- Facebook: Best times 13:00-15:00 IST. Longer captions work well.
- LinkedIn: Best times 08:00-10:00 IST (weekdays only). Professional, insightful tone.
- Twitter: Best times 09:00-11:00 IST. Short and punchy.

CONTENT MIX RULES (strictly follow):
- 40% educational/value content (tips, how-tos, behind the scenes, industry insights)
- 30% promotional (products, offers, testimonials, services)
- 20% engagement (questions, polls, relatable content, community)
- 10% festival/seasonal (greetings, seasonal offers)
- Never schedule more than 2 promotional posts in a row
- Include at least 1 carousel in the week
- If a festival falls this week OR within 3 days, include a festival post

Generate a 7-day content calendar for ${business.input.name}. Each day should have 1-2 posts (up to 3 on festival days). Respond ONLY with valid JSON:

{
  "weekSummary": "1-2 sentence overview of this week's content strategy and why it will work for ${business.input.name}",
  "totalPosts": <number>,
  "days": [
    {
      "date": "${weekStartDate}",
      "dayName": "<Monday/Tuesday/etc>",
      "isFestival": <true/false>,
      "festivalName": <"Festival Name" or null>,
      "posts": [
        {
          "id": "day1-post1",
          "time": "12:30",
          "platform": ["instagram", "facebook"],
          "type": "post",
          "category": "educational",
          "theme": "brief theme description specific to ${business.input.name}",
          "suggestedHeadline": "The actual headline/main text for the post",
          "captionHook": "First line that stops the scroll — make it compelling and specific",
          "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
          "cta": "Call to action text",
          "estimatedReach": "400-700",
          "notes": "Any special instructions for creative generation or format"
        }
      ]
    }
  ],
  "weeklyTips": [
    "Specific tip for ${business.input.name} to maximize engagement this week",
    "Another specific tip"
  ]
}

IMPORTANT:
- Generate all 7 days (${weekStartDate} through ${weekEnd})
- Times must be HH:MM in 24-hour format (IST)
- All content must be specific to ${business.input.name} — no generic placeholders
- Festival posts should appear 1 day before AND on the festival day
- If trending topics are relevant to ${business.input.industry}, incorporate them naturally
- Hashtags: mix 2-3 popular (#food, #india) with 2-3 niche (#${business.input.industry}, #${business.input.location.toLowerCase().replace(/\s/g, "")})
- Every day must have at least 1 post
- Weekend (Sat/Sun) can be more casual, behind-the-scenes, engagement-focused
- Monday posts should be fresh-start, motivational, or week-ahead themed`;
}
