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

export function getFallbackWeeklyPlan(
  weekStartDate: string,
  businessName: string
): WeeklyPlan {
  const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const start = parseISO(weekStartDate);

  const templates = [
    { category: "educational" as const, type: "post" as const, time: "12:30", theme: "Industry tip", suggestedHeadline: "Did you know? A helpful tip for you", captionHook: "Here's something most people don't know about us..." },
    { category: "promotional" as const, type: "post" as const, time: "18:00", theme: "Product/service highlight", suggestedHeadline: "Our best-selling offer this week", captionHook: "Looking for the best in town? Here's why customers choose us..." },
    { category: "engagement" as const, type: "post" as const, time: "12:00", theme: "Question/poll", suggestedHeadline: "We want to hear from you!", captionHook: "Tell us — what matters most to you?" },
    { category: "educational" as const, type: "carousel" as const, time: "18:30", theme: "How-to guide", suggestedHeadline: "5 things you need to know", captionHook: "Save this post — you'll thank us later!" },
    { category: "promotional" as const, type: "post" as const, time: "13:00", theme: "Customer testimonial", suggestedHeadline: "Our customers love us — here's why", captionHook: "Don't just take our word for it..." },
    { category: "engagement" as const, type: "post" as const, time: "11:00", theme: "Behind the scenes", suggestedHeadline: "A day in our world", captionHook: "Ever wondered what goes on behind the scenes?" },
    { category: "educational" as const, type: "post" as const, time: "12:00", theme: "Weekend tip", suggestedHeadline: "Make your weekend better with this tip", captionHook: "Weekend is here! Here's something to make it special..." },
  ];

  const days = DAY_NAMES.map((dayName, i) => {
    const date = format(addDays(start, i), "yyyy-MM-dd");
    const t = templates[i];
    return {
      date,
      dayName,
      isFestival: false,
      festivalName: null,
      posts: [{
        id: `day${i + 1}-post1`,
        time: t.time,
        platform: ["instagram", "facebook"],
        type: t.type,
        category: t.category,
        theme: t.theme,
        suggestedHeadline: t.suggestedHeadline,
        captionHook: t.captionHook,
        hashtags: [`#${businessName.replace(/\s/g, "").toLowerCase()}`, "#smallbusiness", "#india", "#localbusiness", "#shoplocal"],
        cta: "Comment below or DM us!",
        estimatedReach: "300-600",
        notes: "Customize with your specific content",
        status: "draft" as const,
      }],
    };
  });

  return {
    weekSummary: `A balanced week of content for ${businessName} — educational posts to build trust, promotional content to drive sales, and engagement posts to build community. Note: This is a template plan; regenerate when AI is available for a personalized strategy.`,
    totalPosts: 7,
    days,
    weeklyTips: [
      "Post consistently at the same times each day to train your audience",
      "Reply to all comments within 2 hours to boost engagement signals",
    ],
  };
}
