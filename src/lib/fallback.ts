import { BusinessProfile, AnalyzeRequest } from "./types/business";
import { WeeklyPlan } from "./types/calendar";
import { format, addDays, parseISO } from "date-fns";

// ─── Fallback Business Profiles ───────────────────────────────────────────────

const INDUSTRY_PROFILES: Record<string, Partial<BusinessProfile>> = {
  bakery: {
    businessSummary:
      "A local bakery offering fresh, handcrafted baked goods to the community. Positioned as a warm, welcoming destination for daily fresh bread, cakes, and pastries with a homemade touch.",
    industryAnalysis: {
      marketOverview:
        "India's bakery market is growing at 9% CAGR, driven by changing breakfast habits and rising demand for Western-style baked goods among urban millennials.",
      keyTrends: [
        "Sourdough and artisan bread gaining popularity",
        "Custom cake orders surging for celebrations",
        "Healthy and multigrain options in demand",
      ],
      competitiveAdvantages: [
        "Daily fresh produce builds customer trust",
        "Customization for events differentiates from supermarket chains",
      ],
    },
    contentPillars: [
      { name: "Behind the Oven", description: "Show the baking process, ingredients, and early morning freshness", frequency: "3x/week" },
      { name: "Daily Specials", description: "Feature today's fresh items with mouthwatering photography", frequency: "5x/week" },
      { name: "Customer Creations", description: "Share custom cake orders and customer celebration moments", frequency: "2x/week" },
      { name: "Recipe Tips", description: "Share simple baking tips to educate and build trust", frequency: "1x/week" },
    ],
  },
  restaurant: {
    businessSummary:
      "A local restaurant serving authentic cuisine to the community. Known for quality ingredients, consistent taste, and a welcoming dining experience.",
    industryAnalysis: {
      marketOverview:
        "India's restaurant industry is valued at ₹7.5 lakh crore with strong recovery post-pandemic and growing demand for dine-in experiences.",
      keyTrends: [
        "Food delivery and takeaway still growing",
        "Experiential dining and themed restaurants rising",
        "Health-conscious menu options gaining traction",
      ],
      competitiveAdvantages: [
        "Authentic local taste creates loyal regulars",
        "Dine-in experience cannot be replicated by delivery apps",
      ],
    },
    contentPillars: [
      { name: "Dish of the Day", description: "Showcase daily specials with appetizing photography", frequency: "5x/week" },
      { name: "Kitchen Stories", description: "Behind-the-scenes cooking, chef stories, ingredient sourcing", frequency: "2x/week" },
      { name: "Customer Moments", description: "Happy customers, family celebrations, group dinners", frequency: "2x/week" },
      { name: "Food Facts", description: "Nutritional tips, ingredient stories, regional cuisine education", frequency: "1x/week" },
    ],
  },
  salon: {
    businessSummary:
      "A professional beauty salon offering haircare, skincare, and beauty services. Positioned as an affordable luxury destination for self-care and confidence building.",
    industryAnalysis: {
      marketOverview:
        "India's beauty and personal care market is growing at 10% CAGR, driven by rising disposable income and growing male grooming segment.",
      keyTrends: [
        "Bridal package bookings require 3-6 months advance planning",
        "Men's grooming services growing 25% year-on-year",
        "Natural and organic treatments becoming mainstream",
      ],
      competitiveAdvantages: [
        "Personalized consultations build long-term client relationships",
        "Loyalty programs significantly reduce churn",
      ],
    },
    contentPillars: [
      { name: "Transformation Tuesday", description: "Before/after transformations with client permission", frequency: "2x/week" },
      { name: "Beauty Tips", description: "Hair care tips, skincare routines, product recommendations", frequency: "3x/week" },
      { name: "Service Showcase", description: "Highlight specific services with process photos/videos", frequency: "2x/week" },
      { name: "Client Spotlight", description: "Happy client stories and testimonials", frequency: "1x/week" },
    ],
  },
  gym: {
    businessSummary:
      "A local fitness center equipped to help members achieve their health and fitness goals through professional training and a motivating community environment.",
    industryAnalysis: {
      marketOverview:
        "India's fitness industry is growing at 24% CAGR, with post-pandemic health awareness driving gym memberships to all-time highs.",
      keyTrends: [
        "Hybrid fitness (gym + online classes) gaining popularity",
        "Functional fitness and HIIT replacing traditional weight training",
        "Corporate wellness programs creating B2B opportunities",
      ],
      competitiveAdvantages: [
        "Community and accountability keep members longer than home workouts",
        "Equipment variety justifies membership over home setup",
      ],
    },
    contentPillars: [
      { name: "Workout of the Day", description: "Daily exercise tips, form guides, and fitness challenges", frequency: "5x/week" },
      { name: "Member Transformations", description: "Success stories with consent to inspire prospects", frequency: "2x/week" },
      { name: "Nutrition Tips", description: "Diet advice, meal prep, supplement guidance", frequency: "2x/week" },
      { name: "Trainer Insights", description: "Expert tips from your trainers to build credibility", frequency: "1x/week" },
    ],
  },
  general: {
    businessSummary:
      "A local business serving the community with quality products and services. Focused on building lasting customer relationships through consistent quality and excellent service.",
    industryAnalysis: {
      marketOverview:
        "India's SMB sector is undergoing rapid digitization, with social media becoming the primary discovery channel for local businesses.",
      keyTrends: [
        "WhatsApp Business and Instagram DMs replacing phone inquiries",
        "Short-form video content (Reels) driving discovery for local businesses",
        "Google Business Profile becoming critical for local SEO",
      ],
      competitiveAdvantages: [
        "Local presence and trust factor difficult for chains to replicate",
        "Personalized service builds loyalty that apps cannot match",
      ],
    },
    contentPillars: [
      { name: "Product/Service Spotlight", description: "Showcase what you offer with clear benefits", frequency: "3x/week" },
      { name: "Customer Stories", description: "Share testimonials and success stories", frequency: "2x/week" },
      { name: "Behind the Scenes", description: "Show your process, team, and workspace", frequency: "1x/week" },
      { name: "Tips & Education", description: "Valuable content related to your industry", frequency: "1x/week" },
    ],
  },
};

function getBaseProfile(industry: string): Partial<BusinessProfile> {
  return INDUSTRY_PROFILES[industry] || INDUSTRY_PROFILES.general;
}

export function getFallbackProfile(
  industry: string,
  formData: AnalyzeRequest
): BusinessProfile {
  const base = getBaseProfile(industry);

  return {
    businessSummary:
      base.businessSummary ||
      `${formData.name} is a local ${industry} business serving ${formData.location}. Focused on quality service and building a loyal customer base through consistent excellence.`,
    industryAnalysis: base.industryAnalysis || {
      marketOverview: `The ${industry} sector in India is growing steadily, driven by increasing urbanization and consumer spending.`,
      keyTrends: ["Digital-first customer discovery", "Social proof drives purchase decisions", "Local businesses gaining advantage through community trust"],
      competitiveAdvantages: ["Personalized service", "Local community trust"],
    },
    audiencePersona: {
      primaryDemographic: `${formData.targetAudience.join(", ")} in ${formData.location} looking for quality ${industry} services`,
      painPoints: ["Finding trustworthy local businesses", "Value for money", "Consistent quality"],
      buyingBehavior: "Discovers businesses through Instagram, word-of-mouth, and Google Maps. Makes decisions based on photos, reviews, and recommendations.",
      preferredPlatforms: ["instagram", "facebook"],
    },
    competitorInsights: {
      directCompetitors: `Other local ${industry} businesses in ${formData.location}`,
      differentiators: [`${formData.name}'s personalized service`, "Local community connection"],
      marketGaps: ["Consistent online presence", "Engaging digital content"],
    },
    contentPillars: base.contentPillars || INDUSTRY_PROFILES.general.contentPillars!,
    platformStrategy: {
      primary: { platform: "instagram", reason: "Highest engagement for visual businesses", postingFrequency: "5x/week" },
      secondary: { platform: "facebook", reason: "Older demographic reach and local groups", postingFrequency: "3x/week" },
    },
    seasonalOpportunities: [
      { occasion: "Diwali", date: "2026-11-08", campaignIdea: `Special Diwali offer from ${formData.name}`, contentType: "festival creative + carousel" },
      { occasion: "New Year", date: "2027-01-01", campaignIdea: `New Year, New Beginnings with ${formData.name}`, contentType: "post + story" },
    ],
    quickWins: [
      "Post a behind-the-scenes photo or video today to humanize your brand",
      "Ask your last 5 happy customers to drop a Google review this week",
      "Create a WhatsApp Business profile with your business hours and catalog",
    ],
  };
}

// ─── Fallback Weekly Plan ─────────────────────────────────────────────────────
// Week-cycle-aware fallback — rotates growth objectives so even the fallback
// looks different week over week.

const FALLBACK_CYCLES = [
  // Cycle 0 — Discovery week
  [
    { category: "educational" as const, type: "post" as const, time: "12:30", theme: "What makes us different", suggestedHeadline: "Why {{name}} customers keep coming back (and referring their friends)", captionHook: "There are 50+ options in {{city}}. Here's the ONE reason people choose {{name}} ⬇️", cta: "Drop a ❤️ if you agree, or tag a friend who should know about us" },
    { category: "educational" as const, type: "carousel" as const, time: "18:30", theme: "Industry myth-busting carousel", suggestedHeadline: "5 things most people get wrong about {{industry}}", captionHook: "We've seen this mistake cost people time and money. Save this post before you do the same 👇", cta: "Save this & share with someone who needs to see it" },
    { category: "engagement" as const, type: "post" as const, time: "12:00", theme: "Customer discovery question", suggestedHeadline: "Quick question for you 👇", captionHook: "We want to serve you better. Answer in 3 seconds:", cta: "Comment your answer below — we read every single one" },
    { category: "educational" as const, type: "post" as const, time: "18:00", theme: "Behind the process", suggestedHeadline: "What happens BEFORE you receive your order from {{name}}", captionHook: "Most people never see this part. Today we're showing you everything ⬇️", cta: "Follow us to see more behind-the-scenes content every week" },
    { category: "promotional" as const, type: "post" as const, time: "13:00", theme: "Flagship product intro", suggestedHeadline: "Introducing our most popular product — and why it sells out every week", captionHook: "We didn't expect this to become our #1 seller. Here's the story:", cta: "DM us 'INFO' to get details, pricing, and availability" },
    { category: "engagement" as const, type: "post" as const, time: "11:00", theme: "Team & workspace reveal", suggestedHeadline: "The people behind {{name}} — meet our team", captionHook: "Businesses are built by people. Here's the team that shows up for you every day 🙌", cta: "Tag someone you'd love to experience {{name}} with" },
    { category: "educational" as const, type: "post" as const, time: "12:00", theme: "Sunday value share", suggestedHeadline: "One tip from {{name}} to make your week better", captionHook: "It's Sunday. Before the week starts, here's something worth knowing:", cta: "Save this tip & try it this week. Tell us how it goes 💬" },
  ],
  // Cycle 1 — Authority week
  [
    { category: "educational" as const, type: "post" as const, time: "12:30", theme: "Monday industry insight", suggestedHeadline: "The truth about {{industry}} that nobody talks about openly", captionHook: "After years in {{industry}}, here's the one insight that changed how we operate:", cta: "Share this if you think more people in {{city}} should know this" },
    { category: "educational" as const, type: "carousel" as const, time: "18:00", theme: "Step-by-step expertise carousel", suggestedHeadline: "How we do things differently at {{name}} (step-by-step)", captionHook: "This is our exact process. We're sharing it because we have nothing to hide 🧵", cta: "Save this carousel — it's the blueprint we follow for every customer" },
    { category: "promotional" as const, type: "post" as const, time: "12:00", theme: "Customer testimonial with outcome", suggestedHeadline: "{{name}} customer review that made our team emotional 🙏", captionHook: "We got this message last week and had to share it (with permission):", cta: "DM us 'RESULTS' to see more customer stories like this" },
    { category: "educational" as const, type: "post" as const, time: "18:30", theme: "Common industry mistake", suggestedHeadline: "Stop doing this if you want the best results from {{industry}}", captionHook: "We've seen this mistake hundreds of times. It's costing people more than they realize 👇", cta: "Comment 'GUIDE' and we'll send you our free checklist" },
    { category: "promotional" as const, type: "post" as const, time: "13:00", theme: "Process quality showcase", suggestedHeadline: "Why {{name}}'s quality standard is different from everyone else in {{city}}", captionHook: "We could cut costs by 30% if we did it the way most others do. We don't. Here's why:", cta: "Experience the difference — DM us to schedule your visit" },
    { category: "engagement" as const, type: "post" as const, time: "11:00", theme: "Saturday Q&A", suggestedHeadline: "Ask {{name}} anything — we're answering ALL questions today", captionHook: "Saturday is for you. Drop your questions below and we'll answer every single one 👇", cta: "Ask us anything in the comments — about {{industry}}, our process, pricing, anything" },
    { category: "educational" as const, type: "post" as const, time: "12:00", theme: "Sunday perspective", suggestedHeadline: "The one mindset shift that separates good {{industry}} businesses from great ones", captionHook: "Sunday thoughts from the {{name}} team 💭", cta: "Save this & share with another business owner you respect" },
  ],
  // Cycle 2 — Conversion week
  [
    { category: "promotional" as const, type: "post" as const, time: "12:30", theme: "Week-only offer launch", suggestedHeadline: "{{name}} this-week-only offer — we're doing something we've never done before", captionHook: "Monday announcement: This offer disappears on Sunday. Here's what we're doing this week only 👇", cta: "Comment 'YES' or DM us immediately — slots are limited" },
    { category: "educational" as const, type: "carousel" as const, time: "18:00", theme: "Results proof carousel", suggestedHeadline: "What {{name}} customers got in 30 days (real numbers)", captionHook: "We tracked the results. Here's what actually happened for our customers in the last 30 days 📊", cta: "Want these results? DM us 'START' right now" },
    { category: "promotional" as const, type: "post" as const, time: "12:00", theme: "Objection handling", suggestedHeadline: "\"Is {{name}} worth it?\" — Honest answer", captionHook: "You've probably asked this question. We're going to answer it completely honestly 👇", cta: "Still unsure? DM us — we'll answer your specific concern personally" },
    { category: "promotional" as const, type: "post" as const, time: "18:30", theme: "Urgency + scarcity", suggestedHeadline: "Only 3 spots left this week at {{name}} — here's what you get", captionHook: "We're almost fully booked for this week. If you've been waiting, this is the moment 🔴", cta: "WhatsApp us NOW to secure your slot — don't wait until it's gone" },
    { category: "engagement" as const, type: "post" as const, time: "13:00", theme: "Customer success story", suggestedHeadline: "Why {{name}} customer came back 4 times in one month", captionHook: "When customers keep coming back, we ask them why. Here's what one said:", cta: "Become our next success story — DM 'BOOK' to get started this week" },
    { category: "promotional" as const, type: "post" as const, time: "11:00", theme: "Weekend offer reminder", suggestedHeadline: "⏰ Last 48 hours — {{name}}'s week-only offer ends Sunday", captionHook: "Weekend reminder: This offer disappears at midnight Sunday. Don't say we didn't warn you 👀", cta: "Secure your spot NOW — DM us or call/WhatsApp immediately" },
    { category: "engagement" as const, type: "post" as const, time: "12:00", theme: "Sunday thank you", suggestedHeadline: "To everyone who chose {{name}} this week — thank you 🙏", captionHook: "Offer closes today. Before it does, we want to say something to everyone who trusted us:", cta: "Tag someone who should experience {{name}} next week" },
  ],
  // Cycle 3 — Retention week
  [
    { category: "engagement" as const, type: "post" as const, time: "12:30", theme: "Community appreciation Monday", suggestedHeadline: "{{name}}'s community made us the business we are today", captionHook: "This Monday, we're not talking about products. We're talking about YOU 🙏", cta: "Comment how long you've been with {{name}} — we want to celebrate you" },
    { category: "educational" as const, type: "carousel" as const, time: "18:00", theme: "Insider tips carousel for existing customers", suggestedHeadline: "{{name}} insider guide — tips only our regulars know", captionHook: "These tips are for our real community. If you've been with us, you deserve to know this 🫂", cta: "Share this with a friend you'd love to have join the {{name}} family" },
    { category: "engagement" as const, type: "post" as const, time: "12:00", theme: "UGC prompt", suggestedHeadline: "Share your {{name}} moment — we'll feature you on our page", captionHook: "We want to see how {{name}} fits into your life. Show us 📸", cta: "Post your photo, tag us, and we'll share your story this week" },
    { category: "promotional" as const, type: "post" as const, time: "18:30", theme: "Loyalty reward teaser", suggestedHeadline: "Something special is coming for {{name}} regulars next week", captionHook: "We've been planning something exclusively for customers who've been with us. Here's a hint 👀", cta: "Follow us so you don't miss the announcement — dropping next Monday" },
    { category: "engagement" as const, type: "post" as const, time: "13:00", theme: "Referral ask", suggestedHeadline: "Know someone who needs {{name}}? Here's how to help them (and yourself)", captionHook: "Our best customers came through referrals. If {{name}} has made a difference, share the love 💛", cta: "Tag a friend below or DM them our profile link right now" },
    { category: "educational" as const, type: "post" as const, time: "11:00", theme: "Behind the weekend prep", suggestedHeadline: "What {{name}} does on Saturdays to prepare for an amazing week ahead", captionHook: "Most people don't see this side of us. This is how we prepare to show up for you 💪", cta: "What would you love to see from us next week? Comment below 👇" },
    { category: "engagement" as const, type: "post" as const, time: "12:00", theme: "Sunday gratitude post", suggestedHeadline: "52 weeks, 52 reasons {{name}} keeps going — you're one of them", captionHook: "End of week. Time to be honest about why we do this every day ❤️", cta: "If {{name}} has ever made your day better, drop a ❤️ below" },
  ],
];

export function getFallbackWeeklyPlan(
  weekStartDate: string,
  businessName: string
): WeeklyPlan {
  const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const start = parseISO(weekStartDate);

  // Determine which growth cycle this week falls in
  const weekOfMonth = Math.floor((start.getDate() - 1) / 7);
  const cycleIndex = weekOfMonth % 4;
  const templates = FALLBACK_CYCLES[cycleIndex];

  const brandTag = `#${businessName.replace(/\s+/g, "").toLowerCase()}`;
  const CYCLE_LABELS = ["Audience Discovery", "Trust & Authority", "Conversion Drive", "Community & Retention"];
  const cycleLabel = CYCLE_LABELS[cycleIndex];

  const days = DAY_NAMES.map((dayName, i) => {
    const date = format(addDays(start, i), "yyyy-MM-dd");
    const t = templates[i];

    // Replace {{name}} and {{city}} placeholders
    const fill = (s: string) =>
      s.replace(/\{\{name\}\}/g, businessName)
       .replace(/\{\{city\}\}/g, "your city")
       .replace(/\{\{industry\}\}/g, "your industry");

    return {
      date,
      dayName,
      isFestival: false,
      festivalName: null,
      posts: [{
        id: `${dayName.toLowerCase().slice(0, 3)}-post1`,
        time: t.time,
        platform: ["instagram", "facebook"],
        type: t.type,
        category: t.category,
        theme: fill(t.theme),
        suggestedHeadline: fill(t.suggestedHeadline),
        captionHook: fill(t.captionHook),
        hashtags: [brandTag, "#smallbusiness", "#india", "#localbusiness", "#supportlocal", "#shoplocal", "#growyourbusiness"],
        cta: fill(t.cta),
        estimatedReach: "300-600",
        growthImpact: `This post supports the ${cycleLabel} objective by building the right audience relationship for this phase of growth.`,
        notes: "Customize with your specific products, customer photos, or real numbers. The more specific, the better the results.",
        status: "draft" as const,
      }],
    };
  });

  return {
    weekSummary: `${cycleLabel} week for ${businessName}. This week's 7-day plan is designed to advance a specific growth objective — each day builds on the previous to create a connected content narrative. Regenerate with AI enabled for fully personalized, business-specific content.`,
    totalPosts: 7,
    days,
    weeklyTips: [
      `${cycleLabel}: Every post this week should reinforce one message — stay focused on the week's theme, don't scatter your content`,
      "Reply to every comment within 2 hours — the algorithm rewards early engagement and your audience notices the responsiveness",
      "Repost your best-performing post from last week as a Story with a poll sticker — it extends reach with zero extra effort",
    ],
  };
}
