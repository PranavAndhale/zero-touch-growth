// ─── Festival ────────────────────────────────────────────────────────────────

export interface Festival {
  name: string;
  date: string;
  daysAway: number;
  type: string;
  description: string;
  marketingRelevance: "high" | "medium" | "low";
  region?: string;
}

// ─── Trending Topics ──────────────────────────────────────────────────────────

export interface TrendingTopic {
  title: string;
  trafficVolume: string;
  newsUrl?: string;
  relatedQueries: string[];
}

// ─── News ─────────────────────────────────────────────────────────────────────

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
}

// ─── Weekly Plan ──────────────────────────────────────────────────────────────

export type PostType = "post" | "carousel" | "festival" | "banner" | "story";
export type PostCategory = "educational" | "promotional" | "engagement" | "festival";

export interface PlannedPost {
  id: string;
  time: string;
  platform: string[];
  type: PostType;
  category: PostCategory;
  theme: string;
  suggestedHeadline: string;
  captionHook: string;
  hashtags: string[];
  cta: string;
  estimatedReach: string;
  notes: string;
  status?: "draft" | "scheduled" | "published" | "skipped";
}

export interface DayPlan {
  date: string;
  dayName: string;
  isFestival: boolean;
  festivalName: string | null;
  posts: PlannedPost[];
}

export interface WeeklyPlan {
  weekSummary: string;
  totalPosts: number;
  days: DayPlan[];
  weeklyTips: string[];
}

// ─── Planner Request / Response ───────────────────────────────────────────────

export interface PlannerRequest {
  businessId: string;
  weekStartDate: string;
  weeklyGoals?: string;
  excludeTypes?: string[];
  platforms?: string[];
}

export interface PlannerResponse {
  success: boolean;
  planId: string;
  plan: WeeklyPlan;
  contextUsed: {
    festivals: Festival[];
    trends: TrendingTopic[];
    news: NewsArticle[];
  };
  generationTime: number;
}

// ─── Firestore Plan Document ──────────────────────────────────────────────────

export interface PlanDocument {
  id: string;
  businessId: string;
  createdAt: string;
  weekStartDate: string;
  weekEndDate: string;
  plan: WeeklyPlan;
  userGoals?: string;
  regenerationCount: number;
  status: "draft" | "active" | "completed";
  contextUsed: {
    festivalsInWeek: string[];
    trendsUsed: string[];
    newsUsed: string[];
  };
}
