import { BusinessDocument } from "../types/business";
import { Festival, TrendingTopic, NewsArticle } from "../types/calendar";
import { addDays, format, getWeek, getMonth, parseISO } from "date-fns";

// ─── Growth Cycle ─────────────────────────────────────────────────────────────
// 4-week rotating growth objective — ensures each week builds a different
// business muscle and prevents content repetition.

interface WeekGrowthProfile {
  objective: string;
  primaryMetric: string;
  contentBias: string;
  ctaFocus: string;
  mandatoryPost: string;
  prohibit: string;
}

const GROWTH_CYCLE: WeekGrowthProfile[] = [
  {
    // Week A — Discovery: reach people who have never heard of this business
    objective: "AUDIENCE DISCOVERY — Reach NEW customers who don't know this business yet",
    primaryMetric: "Profile visits, new followers, reach to non-followers",
    contentBias: "50% educational/value posts that solve a real pain point, 30% product showcase with unique differentiators, 20% engagement hooks (questions, polls, relatable scenarios)",
    ctaFocus: "Follow for more, Save this post, Tag a friend who needs this",
    mandatoryPost: "One post must introduce the business story / founding reason / what makes it different from others in the city. This is the 'first impression' post.",
    prohibit: "Avoid hard sales pitches — people don't buy from strangers. Build familiarity first.",
  },
  {
    // Week B — Authority: make the audience trust this business over competitors
    objective: "TRUST & AUTHORITY — Position this business as the EXPERT/GO-TO option in its industry",
    primaryMetric: "Saves, shares, comment quality, DM inquiries",
    contentBias: "40% deep-value educational carousels (process, expertise, behind-the-scenes), 30% social proof (customer results, testimonials, reviews), 30% industry insight content that competitors don't share",
    ctaFocus: "Save this for reference, Comment your question, Send us a DM for consultation",
    mandatoryPost: "One carousel post that teaches something genuinely useful about the industry — '5 things to check before hiring a [industry professional]' or 'Why [common mistake] is costing you money'. Real expertise, not surface tips.",
    prohibit: "Don't make this week about selling — it's about being the undisputed authority. No discount posts.",
  },
  {
    // Week C — Conversion: turn warm followers into paying customers
    objective: "CONVERSION — Turn existing warm audience into paying customers THIS WEEK",
    primaryMetric: "DMs, calls, WhatsApp inquiries, bookings, orders placed",
    contentBias: "40% promotional with clear offers and urgency, 30% testimonials/case studies showing real outcomes, 20% objection-handling posts (addressing why people hesitate to buy), 10% engagement",
    ctaFocus: "DM us NOW, Call/WhatsApp to book, Limited spots/stock available, Link in bio to order",
    mandatoryPost: "One post must present a specific, time-limited offer tied to this week only. Not a permanent discount — a reason to act NOW. Could be a bundle, a free add-on, priority booking, or special rate.",
    prohibit: "Don't do vague CTAs like 'check our website'. Be direct: 'DM the word ORDER to get your slot this week'.",
  },
  {
    // Week D — Retention: delight existing customers, drive referrals, build community
    objective: "RETENTION & REFERRALS — Keep current customers loyal and turn them into promoters",
    primaryMetric: "Repeat purchase signals, referral DMs, UGC shares, community comments",
    contentBias: "35% customer appreciation/spotlight content, 35% loyalty/reward-style posts (exclusive tips, insider content, thank-you offers), 30% community-building (questions, share your story, user-generated prompts)",
    ctaFocus: "Tag someone who deserves this, Share with a friend, Tell us your experience, You're the reason we do this",
    mandatoryPost: "One post must celebrate a REAL customer outcome or story (with permission). Not a generic 'happy customer' — a specific transformation, milestone, or result. Metrics, before/after, or emotional journey.",
    prohibit: "Don't make this week feel transactional. This is about gratitude and community, not upselling.",
  },
];

// ─── Product Rotation ─────────────────────────────────────────────────────────
// Cycles through products/services so each week spotlights different offerings

function getProductRotation(products: string[], weekSeed: number): string[] {
  if (!products || products.length === 0) return [];
  const offset = weekSeed % products.length;
  // Feature 2-3 products, starting from a rotating offset
  const rotated = [...products.slice(offset), ...products.slice(0, offset)];
  return rotated.slice(0, Math.min(3, rotated.length));
}

// ─── Week Seed ────────────────────────────────────────────────────────────────
// Deterministic seed from date so same week always gets same plan,
// but different weeks get different plans

function getWeekSeed(weekStartDate: string): number {
  const d = parseISO(weekStartDate);
  return getWeek(d) + getMonth(d) * 53;
}

function getGrowthCycleIndex(weekStartDate: string): number {
  const d = parseISO(weekStartDate);
  // Cycle resets monthly, rotates weekly within month
  const weekOfMonth = Math.floor((d.getDate() - 1) / 7); // 0-indexed (0=first week)
  return weekOfMonth % 4;
}

// ─── Day-Specific Themes ──────────────────────────────────────────────────────
// Forces each day of the week to serve a different purpose — ensures
// the Monday plan looks nothing like the Thursday plan

const DAY_ROLES: Record<string, string> = {
  Monday: "MOMENTUM MONDAY — Start the week strong. Motivational, forward-looking content. What exciting thing is happening this week? New arrivals, week special, or an inspiring customer story. People check social media on Monday mornings to get inspired.",
  Tuesday: "TEACHING TUESDAY — Your deepest educational post of the week. A carousel or detailed post that teaches something genuinely useful. This gets the most saves and shares. Expertise-forward, zero selling.",
  Wednesday: "SOCIAL PROOF WEDNESDAY — Mid-week social proof: testimonial, transformation, customer story, or review screenshot. Wednesday is when purchase decisions often happen — reinforce trust.",
  Thursday: "OFFER THURSDAY — Your strongest commercial post. Feature a specific product/service with a clear price or offer. Best day for promotional content. Include a direct and specific CTA.",
  Friday: "FRIDAY ENGAGEMENT — Community-building post. A question, poll, challenge, or 'this or that' post. People are in a good mood on Fridays. High-engagement format. Lighthearted tone.",
  Saturday: "BEHIND THE SCENES SATURDAY — Show your process, workspace, team, or preparation. Authenticity day. Reels or Stories work best. Makes the business feel human and trustworthy.",
  Sunday: "INSPIRATION SUNDAY — Softest post of the week. Relatable content, a quote with business relevance, or a gratitude post. Many Indian families are together on Sundays — content that works for family audiences.",
};

// ─── Audience Pain Point Mapper ───────────────────────────────────────────────

function getAudiencePainPoints(business: BusinessDocument): string[] {
  const profile = business.profile;
  if (profile.audiencePersona?.painPoints?.length) {
    return profile.audiencePersona.painPoints;
  }
  // Industry-based defaults
  const industry = business.input.industry.toLowerCase();
  const painMap: Record<string, string[]> = {
    bakery: ["Can't find fresh, preservative-free bread daily", "Custom cakes that actually look like the reference photo", "Reliable pre-orders for celebrations"],
    restaurant: ["Tired of ordering the same delivery apps with average food", "Finding clean, hygienic places to eat with family", "Value for money — feeling full and satisfied"],
    salon: ["Previous salon damaged hair with cheap products", "Booking slots that aren't cancelled last-minute", "Getting results that actually match inspiration photos"],
    gym: ["Lack of motivation to stay consistent", "Personal trainers who don't give attention", "Not seeing results despite months of effort"],
    clothing: ["Can't find clothes that fit Indian body types well", "Fast fashion that falls apart after 3 washes", "Finding unique pieces that don't look mass-produced"],
  };
  return painMap[industry] || ["Finding a trustworthy local provider", "Getting consistent quality every time", "Transparent pricing with no hidden costs"];
}

// ─── Competitor Gap Framing ───────────────────────────────────────────────────

function getCompetitorAngle(business: BusinessDocument): string {
  const diff = business.profile.competitorInsights?.differentiators ?? [];
  const gaps = business.profile.competitorInsights?.marketGaps ?? [];
  if (diff.length || gaps.length) {
    return `Differentiators: ${diff.join(", ")}. Market gaps to own: ${gaps.join(", ")}`;
  }
  return `${business.input.name} should consistently highlight what makes it different from generic options in ${business.input.location}`;
}

// ─── Main Prompt Builder ──────────────────────────────────────────────────────

export function buildWeeklyPlannerPrompt(
  business: BusinessDocument,
  weekStartDate: string,
  weekFestivals: Festival[],
  nearbyFestivals: Festival[],
  trends: TrendingTopic[],
  news: NewsArticle[],
  userGoals?: string
): string {
  const weekEnd = format(addDays(parseISO(weekStartDate), 6), "yyyy-MM-dd");
  const weekSeed = getWeekSeed(weekStartDate);
  const cycleIndex = getGrowthCycleIndex(weekStartDate);
  const growthProfile = GROWTH_CYCLE[cycleIndex];
  const weekLabel = `Week of ${weekStartDate}`;
  const weekNum = getWeek(parseISO(weekStartDate));
  const monthName = format(parseISO(weekStartDate), "MMMM yyyy");

  // Rotate which products/services to feature this week
  const featuredProducts = getProductRotation(business.input.products ?? [], weekSeed);
  const audiencePainPoints = getAudiencePainPoints(business);
  const competitorAngle = getCompetitorAngle(business);

  const primaryPlatform = business.profile.platformStrategy?.primary?.platform ?? "instagram";
  const contentPillarNames = (business.profile.contentPillars ?? []).map((p) => p.name).join(", ");

  // ── Context sections ────────────────────────────────────────────────────────
  const festivalThisWeekSection =
    weekFestivals.length > 0
      ? `\nFESTIVALS THIS WEEK (mandatory to include creative posts for these):\n${weekFestivals.map((f) => `- ${f.name} on ${f.date} (${f.type})`).join("\n")}`
      : "\nFESTIVALS THIS WEEK: None";

  const upcomingFestivalsSection =
    nearbyFestivals.length > 0
      ? `\nUPCOMING FESTIVALS — Build anticipation with teaser content:\n${nearbyFestivals
          .filter((f) => f.marketingRelevance !== "low")
          .slice(0, 4)
          .map((f) => `- ${f.name} in ${f.daysAway} days — start warming up the audience`)
          .join("\n")}`
      : "";

  const trendsSection =
    trends.length > 0
      ? `\nTRENDING IN INDIA THIS WEEK (use if relevant — don't force it):\n${trends
          .slice(0, 5)
          .map((t) => `- "${t.title}" (${t.trafficVolume} searches)`)
          .join("\n")}`
      : "";

  const newsSection =
    news.length > 0
      ? `\nINDUSTRY NEWS (use to craft timely, relevant posts):\n${news.slice(0, 3).map((n) => `- ${n.title}`).join("\n")}`
      : "";

  const userGoalsSection = userGoals
    ? `\nOWNER'S SPECIFIC GOAL FOR THIS WEEK: ${userGoals}\n(This OVERRIDES default growth objective — serve the owner's intent first.)`
    : "";

  // ── Day-by-day grid ─────────────────────────────────────────────────────────
  const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const dayGrid = DAY_NAMES.map((dayName, i) => {
    const date = format(addDays(parseISO(weekStartDate), i), "yyyy-MM-dd");
    const festival = weekFestivals.find((f) => f.date === date);
    const role = DAY_ROLES[dayName];
    return `  ${date} (${dayName})${festival ? ` — 🎉 ${festival.name}` : ""}: ${role}`;
  }).join("\n");

  // ── Featured products this week ─────────────────────────────────────────────
  const featuredProductsSection =
    featuredProducts.length > 0
      ? `\nPRODUCTS/SERVICES TO SPOTLIGHT THIS WEEK (rotate these — don't mention ALL products every day):\n${featuredProducts.map((p, i) => `${i + 1}. ${p}`).join("\n")}`
      : "";

  return `You are a senior Indian social media growth strategist with 10+ years helping SMBs grow revenue through strategic content. You create REAL plans that drive REAL business results — more customers, more orders, more revenue. Not vanity metrics.

━━━ BUSINESS PROFILE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Business: ${business.input.name}
Industry: ${business.input.industry}
Location: ${business.input.location}
Brand Tone: ${business.input.tone}
Primary Platform: ${primaryPlatform}
Target Audience: ${business.profile.audiencePersona?.primaryDemographic ?? business.input.targetAudience.join(", ")}

AUDIENCE PAIN POINTS (write content that solves THESE problems):
${audiencePainPoints.map((p) => `  • ${p}`).join("\n")}

CONTENT PILLARS (align posts to these established themes):
${contentPillarNames}

COMPETITIVE POSITIONING:
${competitorAngle}

BUSINESS SUMMARY:
${business.profile.businessSummary}
${featuredProductsSection}

━━━ THIS WEEK'S GROWTH MISSION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Week: ${weekLabel} (Week ${weekNum}, ${monthName}) | Growth Cycle Position: ${cycleIndex + 1}/4

🎯 THIS WEEK'S OBJECTIVE: ${growthProfile.objective}
📊 PRIMARY SUCCESS METRIC: ${growthProfile.primaryMetric}
📝 CONTENT BIAS: ${growthProfile.contentBias}
📣 CTA FOCUS: ${growthProfile.ctaFocus}
⭐ MANDATORY POST THIS WEEK: ${growthProfile.mandatoryPost}
🚫 PROHIBIT THIS WEEK: ${growthProfile.prohibit}
${userGoalsSection}

━━━ WEEK SCHEDULE & DAY ROLES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Each day has a SPECIFIC ROLE. Content must serve that day's purpose:
${dayGrid}
${festivalThisWeekSection}
${upcomingFestivalsSection}
${trendsSection}
${newsSection}

━━━ PLATFORM TIMING (IST) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Instagram: 12:00–13:00 or 18:00–20:00 (carousels get 3× the saves — use for teaching posts)
Facebook: 13:00–15:00 (longer captions + local community groups sharing)
LinkedIn: 08:00–10:00 weekdays only (professional insight format)

━━━ CONTENT QUALITY STANDARDS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EVERY post must meet ALL of these:
✓ suggestedHeadline: The EXACT text that appears on the image/graphic. Specific, compelling, not generic.
  BAD: "A helpful tip for our customers"
  GOOD: "The ONE mistake most ${business.input.industry} customers make (and how to avoid it)"

✓ captionHook: First 1-2 lines that appear BEFORE "more" in the feed. Must create a pattern interrupt.
  BAD: "We are happy to share our latest product with you."
  GOOD: "You've been doing it wrong for years. Here's what actually works ⬇️"

✓ cta: Specific, direct action — not vague. Include WHERE/HOW to take action.
  BAD: "Contact us for more info"
  GOOD: "WhatsApp '${featuredProducts[0] ?? "BOOK"}' to +91-XXXXX to secure your slot this week"

✓ hashtags: 3 local (#${business.input.location.toLowerCase().replace(/\s+/g, "")} #${business.input.location.split(" ")[0].toLowerCase()}local) + 2 industry + 2 niche + 1 branded
✓ notes: Specific visual/format instructions (real photo vs graphic, carousel slides count, reel idea)
✓ growthImpact: Explain exactly HOW this post will drive the week's objective (1 sentence)

━━━ OUTPUT FORMAT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Respond ONLY with valid JSON matching this exact schema:

{
  "weekSummary": "2-3 sentences: This week's growth strategy for ${business.input.name}, the core narrative thread connecting all 7 days, and the specific business outcome expected if the plan is executed",
  "growthObjective": "${growthProfile.objective.split("—")[0].trim()}",
  "totalPosts": <number>,
  "days": [
    {
      "date": "YYYY-MM-DD",
      "dayName": "Monday",
      "isFestival": false,
      "festivalName": null,
      "dayTheme": "One sentence: what this day is trying to achieve for the business",
      "posts": [
        {
          "id": "mon-post1",
          "time": "12:30",
          "platform": ["instagram"],
          "type": "post",
          "category": "educational",
          "theme": "Specific topic tied to ${business.input.name}'s products/services and today's role",
          "suggestedHeadline": "Actual image headline text — specific, not generic, uses real business context",
          "captionHook": "The scroll-stopping first line. Creates curiosity or addresses a pain point directly.",
          "fullCaption": "2-4 line caption body that delivers value, builds trust, and leads into the CTA",
          "hashtags": ["#local1", "#local2", "#industry1", "#industry2", "#niche1", "#niche2", "#branded"],
          "cta": "Specific action + channel (DM, WhatsApp, call, visit, comment, tag)",
          "estimatedReach": "400-700",
          "growthImpact": "How this specific post advances the week's ${growthProfile.primaryMetric} goal",
          "notes": "Visual format, content type, specific creative direction for this post"
        }
      ]
    }
  ],
  "weeklyTips": [
    "Actionable tactic specific to ${business.input.name} to amplify results this week — not generic advice",
    "Another specific tactic tied to the week's growth objective",
    "One engagement hack specific to ${primaryPlatform} algorithm behavior this week"
  ],
  "weeklyGoalTracker": {
    "objective": "${growthProfile.primaryMetric}",
    "targetByEndOfWeek": "Specific measurable target — e.g., '15 DM inquiries', '50 profile visits per day', '3 new bookings'",
    "dailyAction": "One offline action the business owner should do every day this week alongside posting"
  }
}

━━━ CRITICAL RULES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Generate ALL 7 days (${weekStartDate} through ${weekEnd})
2. Every post must explicitly mention ${business.input.name} or its specific products — ZERO generic placeholders
3. Featured products this week: ${featuredProducts.join(", ") || "showcase the core service"} — reference by NAME
4. Festival posts: appear 1 day BEFORE the festival (teaser) AND on the festival day (celebration)
5. Include at least 1 carousel this week (Tuesday is ideal — Teaching Tuesday)
6. Weekend posts (Sat/Sun) must be lighter, more personal, and visually-driven
7. No two consecutive posts should have the same category
8. Every post must have a "growthImpact" field — this is non-negotiable
9. Times must be HH:MM 24-hour IST format
10. The week's 7 posts must tell a CONNECTED STORY that builds toward the growth objective — not 7 disconnected posts`;
}
