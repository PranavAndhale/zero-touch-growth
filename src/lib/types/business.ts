export const INDUSTRY_LIST = [
  "bakery", "restaurant", "cafe", "street_food",
  "salon", "spa", "gym", "yoga_studio",
  "clothing", "jewelry", "footwear", "boutique",
  "grocery", "pharmacy", "electronics", "mobile_store",
  "florist", "photography", "event_planning", "catering",
  "tutor", "coaching", "school", "daycare",
  "dentist", "clinic", "hospital", "veterinary",
  "real_estate", "interior_design", "construction",
  "travel", "hotel", "homestay",
  "auto_repair", "car_wash",
  "finance", "insurance", "legal",
  "printing", "laundry", "courier",
  "general",
] as const;

export type Industry = typeof INDUSTRY_LIST[number];

export const AUDIENCE_LIST = [
  "families", "young_adults_18_25", "professionals_25_40",
  "students", "seniors", "women", "men",
  "parents", "couples", "health_conscious",
  "budget_shoppers", "premium_buyers", "local_community",
  "tourists", "businesses_b2b",
] as const;

export type Audience = typeof AUDIENCE_LIST[number];

export type Tone = "professional" | "casual" | "playful" | "luxurious" | "friendly";

// ─── Request / Input ─────────────────────────────────────────────────────────

export interface AnalyzeRequest {
  name: string;
  websiteUrl?: string;
  industry: string;
  targetAudience: string[];
  location: string;
  products: string[];
  tone: Tone;
  brandColors?: string[];
  logoUrl?: string;
}

// ─── Scraped Data ─────────────────────────────────────────────────────────────

export interface ScrapedData {
  title: string;
  description: string;
  ogImage?: string;
  headings: string[];
  bodyText: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
  };
  techStack: string[];
}

// ─── AI-Generated Business Profile ────────────────────────────────────────────

export interface ContentPillar {
  name: string;
  description: string;
  frequency: string;
}

export interface PlatformStrategy {
  platform: string;
  reason: string;
  postingFrequency: string;
}

export interface SeasonalOpportunity {
  occasion: string;
  date: string;
  campaignIdea: string;
  contentType: string;
}

export interface BusinessProfile {
  businessSummary: string;
  industryAnalysis: {
    marketOverview: string;
    keyTrends: string[];
    competitiveAdvantages: string[];
  };
  audiencePersona: {
    primaryDemographic: string;
    painPoints: string[];
    buyingBehavior: string;
    preferredPlatforms: string[];
  };
  competitorInsights: {
    directCompetitors: string;
    differentiators: string[];
    marketGaps: string[];
  };
  contentPillars: ContentPillar[];
  platformStrategy: {
    primary: PlatformStrategy;
    secondary: PlatformStrategy;
    optional?: PlatformStrategy;
  };
  seasonalOpportunities: SeasonalOpportunity[];
  quickWins: string[];
}

// ─── Firestore Document ───────────────────────────────────────────────────────

export interface BusinessDocument {
  id: string;
  createdAt: string;
  updatedAt: string;
  input: AnalyzeRequest;
  scrapedData?: ScrapedData;
  profile: BusinessProfile;
  analysisVersion: number;
  lastAnalyzedAt: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface AnalyzeResponse {
  success: boolean;
  businessId: string;
  profile: BusinessProfile;
  scrapedData?: ScrapedData;
  analysisTime: number;
  sources: {
    website: boolean;
    trends: boolean;
    festivals: boolean;
  };
}
