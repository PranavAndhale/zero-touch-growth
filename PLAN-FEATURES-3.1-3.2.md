# Feature Plan: 3.1 Business Intelligence Layer + 3.2 Weekly Growth Planner

## For: Sonnet (Implementation Build)
## Project: NMIMS INNOVATHON 2026, Challenge 1 — Zero-Touch Growth OS

---

## Overview

Two interconnected modules that form the brain of the platform:
- **3.1 Business Intelligence** — Ingest a business URL + form data, analyze it with AI, produce a structured business profile with market insights
- **3.2 Weekly Growth Planner** — Use the business profile + festival calendar + trending topics to generate an intelligent 7-day content calendar

Both are Next.js API routes (serverless) powered by Google Gemini 1.5 Flash. Frontend consumes these APIs.

---

## Tech Stack

| Component | Tool | Free Tier | Key? |
|-----------|------|-----------|------|
| AI Engine | Google Gemini 2.5 Flash | 500 req/day, 15 RPM | Yes (aistudio.google.com, no card) |
| Web Scraping | cheerio (Node.js) | Unlimited (library) | No |
| Festival Calendar | Calendarific API | 500 req/month | Yes (calendarific.com, no card) |
| Trending Topics | Google Trends RSS | Unlimited | No |
| News Headlines | GNews API | 100 req/day | Yes (gnews.io, no card) |
| Database | Firebase Firestore | 50K reads/day | Yes (firebase.google.com, no card) |
| File Storage | Firebase Storage | 5 GB free | Same Firebase project |
| Hosting | Vercel | Free tier | No card needed |

**Total keys needed:** 4 (Gemini, Calendarific, GNews, Firebase) — all free, no credit card.

---

## API Keys Setup (.env.local)

```env
# Google Gemini (AI Engine) — aistudio.google.com → Get API Key
GEMINI_API_KEY=your_key_here

# Calendarific (Festival Calendar) — calendarific.com → Sign Up → API Key
CALENDARIFIC_API_KEY=your_key_here

# GNews (News Headlines) — gnews.io → Sign Up → Get API Key  
GNEWS_API_KEY=your_key_here

# Firebase — firebase.google.com → New Project → Project Settings → Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

# FEATURE 3.1 — Business Intelligence Layer

## What It Does

User provides:
1. Business name
2. Website URL (optional)
3. Industry category
4. Target audience
5. Location/city
6. Products/services
7. Business tone (professional/casual/playful/luxurious)
8. Brand colors + logo (optional)

System produces (within 30 seconds):
1. AI-generated business summary (2-3 sentences)
2. Industry analysis (market size, growth, key trends in India)
3. Target audience persona (demographics, pain points, buying behavior)
4. Competitor positioning insights
5. Recommended content pillars (3-5 topics the business should post about)
6. Best platforms ranked (Instagram vs Facebook vs LinkedIn vs Twitter)
7. Recommended posting frequency
8. Seasonal opportunity calendar (next 3 months of relevant occasions)

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Frontend                        │
│  /onboard page — Multi-step wizard form          │
│  Collects: name, URL, industry, audience, etc.   │
└──────────────────────┬──────────────────────────┘
                       │ POST /api/business/analyze
                       ▼
┌─────────────────────────────────────────────────┐
│           API Route: /api/business/analyze        │
│                                                   │
│  Step 1: Validate inputs                         │
│  Step 2: Scrape website (if URL provided)        │
│  Step 3: Fetch industry trends (Google Trends)   │
│  Step 4: Fetch upcoming festivals (Calendarific) │
│  Step 5: Build mega-prompt with all context      │
│  Step 6: Call Gemini → structured JSON response  │
│  Step 7: Save to Firebase Firestore              │
│  Step 8: Return business profile to frontend     │
└─────────────────────────────────────────────────┘
```

---

## File Structure

```
src/
  app/
    api/
      business/
        analyze/
          route.ts              # POST — main business analysis endpoint
        [id]/
          route.ts              # GET — fetch saved business profile
      festivals/
        route.ts                # GET — upcoming festivals (cached)
      trends/
        route.ts                # GET — trending topics for industry
    onboard/
      page.tsx                  # Onboarding wizard UI
      components/
        StepBusinessInfo.tsx    # Step 1: Name, URL, industry
        StepAudience.tsx        # Step 2: Audience, location, tone
        StepBranding.tsx        # Step 3: Colors, logo, products
        StepAnalyzing.tsx       # Step 4: Loading / analysis in progress
        StepResults.tsx         # Step 5: Show generated profile
  lib/
    gemini.ts                   # Gemini API client wrapper
    scraper.ts                  # Website scraping utilities
    calendarific.ts             # Festival calendar API client
    trends.ts                   # Google Trends RSS parser
    gnews.ts                    # GNews API client
    firebase.ts                 # Firebase config + Firestore helpers
    prompts/
      business-analysis.ts      # Prompt templates for business profiling
      weekly-planner.ts         # Prompt templates for content calendar
    types/
      business.ts               # TypeScript interfaces
      calendar.ts               # Calendar/planner types
    cache.ts                    # In-memory + Firestore caching
```

---

## Detailed Implementation

### Step 1: Input Validation (route.ts)

```typescript
// POST /api/business/analyze
// Request body:
interface AnalyzeRequest {
  name: string;                          // required, 2-100 chars
  websiteUrl?: string;                   // optional, valid URL
  industry: string;                      // required, from predefined list
  targetAudience: string[];              // required, 1-5 selections
  location: string;                      // required, city/region
  products: string[];                    // required, 1-20 items
  tone: "professional" | "casual" | "playful" | "luxurious" | "friendly";
  brandColors?: string[];                // optional, hex codes
  logoUrl?: string;                      // optional, uploaded to Firebase Storage
}
```

Validation rules:
- `name`: trim, 2-100 chars, no HTML/script tags
- `websiteUrl`: valid URL format, must start with http:// or https://
- `industry`: must be from the predefined INDUSTRY_LIST (see below)
- `targetAudience`: array of 1-5 strings from predefined AUDIENCE_LIST
- `location`: non-empty string
- `products`: array of 1-20 non-empty strings
- `tone`: one of the 5 allowed values
- `brandColors`: if provided, each must be valid hex (#RRGGBB)

### Industry List (30 categories — Indian SMB focused)

```typescript
const INDUSTRY_LIST = [
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
] as const;
```

### Audience List

```typescript
const AUDIENCE_LIST = [
  "families", "young_adults_18_25", "professionals_25_40",
  "students", "seniors", "women", "men",
  "parents", "couples", "health_conscious",
  "budget_shoppers", "premium_buyers", "local_community",
  "tourists", "businesses_b2b",
] as const;
```

---

### Step 2: Website Scraping (scraper.ts)

Use `cheerio` (Node.js) — it's fast, lightweight, no browser needed.

```typescript
// lib/scraper.ts

interface ScrapedData {
  title: string;
  description: string;
  ogImage?: string;
  headings: string[];           // all h1, h2, h3 text
  bodyText: string;             // first 2000 chars of visible text
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
  techStack: string[];          // detected from meta tags/scripts (e.g. "Shopify", "WordPress")
}

async function scrapeWebsite(url: string): Promise<ScrapedData | null>
```

Implementation details:
1. `fetch(url)` with 10-second timeout, User-Agent: "Mozilla/5.0 (compatible; ZeroTouchGrowth/1.0)"
2. Parse HTML with `cheerio.load(html)`
3. Extract:
   - `<title>`, `<meta name="description">`, `<meta property="og:image">`
   - All `h1, h2, h3` text content (first 20)
   - Visible body text (strip tags, first 2000 chars)
   - Social links: find all `<a href>` matching instagram.com, facebook.com, linkedin.com, twitter.com, youtube.com
   - Contact: find mailto: links, tel: links, text matching phone/address patterns
   - Tech: check for Shopify (`<meta name="shopify-..."`), WordPress (`wp-content`), Wix, etc.
4. Return `null` if fetch fails (don't break the flow — website is optional)
5. Timeout: 10s total. If the site is slow, skip scraping and proceed with form data only.

**Package:** `npm install cheerio` (already a common Next.js dependency)

---

### Step 3: Fetch Industry Trends (trends.ts)

Use Google Trends RSS feed — no API key, no rate limit, reliable.

```typescript
// lib/trends.ts

interface TrendingTopic {
  title: string;
  trafficVolume: string;       // e.g. "200K+"
  newsUrl?: string;
  relatedQueries: string[];
}

async function getTrendingInIndia(): Promise<TrendingTopic[]>
async function getIndustryTrends(industry: string): Promise<TrendingTopic[]>
```

Implementation:
1. **Daily trending:** Fetch `https://trends.google.com/trends/trendingsearches/daily/rss?geo=IN`
   - Parse with a simple XML parser (use `fast-xml-parser` npm package)
   - Extract `<title>`, `<ht:approx_traffic>`, `<ht:news_item_url>`
   - Return top 10 trending topics in India today

2. **Industry-specific:** Fetch `https://trends.google.com/trends/trendingsearches/daily/rss?geo=IN&q={industry_keyword}`
   - Map industry to search keyword: bakery → "bakery", restaurant → "restaurant food", gym → "fitness"
   - Return top 5 related trending topics

3. **Cache:** Cache RSS results for 6 hours (in-memory Map with TTL). These are daily trends, no need to refresh more often.

4. **Fallback:** If RSS fetch fails, return an empty array. The system works without trends — they're supplementary.

---

### Step 4: Fetch Upcoming Festivals (calendarific.ts)

```typescript
// lib/calendarific.ts

interface Festival {
  name: string;
  date: string;                // ISO date: "2026-10-20"
  daysAway: number;
  type: string;                // "national", "religious", "observance"
  description: string;
  marketingRelevance: "high" | "medium" | "low";
  region?: string;
}

async function getUpcomingFestivals(
  country: string = "IN",
  daysAhead: number = 90
): Promise<Festival[]>
```

Implementation:
1. Call `GET https://calendarific.com/api/v2/holidays?api_key={KEY}&country=IN&year=2026`
2. Filter to holidays with dates in the next `daysAhead` days
3. Sort by date ascending
4. Map marketing relevance:
   - **High:** Diwali, Holi, Christmas, Eid, New Year, Valentine's Day, Independence Day, Republic Day, Navratri, Durga Puja, Ganesh Chaturthi, Raksha Bandhan, Mother's Day, Father's Day, Women's Day, Black Friday
   - **Medium:** Pongal, Onam, Baisakhi, Makar Sankranti, Easter, Janmashtami, Thanksgiving, Halloween
   - **Low:** Everything else (observances, minor holidays)
5. **Cache:** Cache the entire year's response in Firestore. Calendarific data doesn't change within a year.
   - Key: `festivals_IN_2026`
   - TTL: 30 days (refresh monthly to be safe)
   - This means 12-13 API calls per year, well within the 500/month limit

6. **Fallback:** Bundle a static JSON file `data/festivals-2026.json` with the 50 most important Indian + global festivals. If API is down, use this.

---

### Step 5: Build Mega-Prompt (prompts/business-analysis.ts)

This is the critical piece. Everything collected feeds into ONE Gemini call.

```typescript
// lib/prompts/business-analysis.ts

function buildBusinessAnalysisPrompt(
  formData: AnalyzeRequest,
  scrapedData: ScrapedData | null,
  trendingTopics: TrendingTopic[],
  upcomingFestivals: Festival[],
): string
```

The prompt structure:

```
You are an expert Indian digital marketing strategist who specializes in
helping small and medium businesses grow their online presence. You understand
Indian market dynamics, festival seasons, regional preferences, and social
media trends across Instagram, Facebook, LinkedIn, and Twitter/X.

BUSINESS INFORMATION:
- Name: {name}
- Industry: {industry}
- Location: {location}
- Products/Services: {products.join(", ")}
- Target Audience: {targetAudience.join(", ")}
- Brand Tone: {tone}

{IF scrapedData:}
WEBSITE ANALYSIS:
- Website Title: {scrapedData.title}
- Meta Description: {scrapedData.description}
- Key Headings: {scrapedData.headings.slice(0,10).join(", ")}
- Body Content Summary: {scrapedData.bodyText.slice(0, 1000)}
- Social Presence: Instagram: {yes/no}, Facebook: {yes/no}, LinkedIn: {yes/no}
- Technologies: {scrapedData.techStack.join(", ")}
{END IF}

CURRENT MARKET CONTEXT:
- Trending in India today: {trendingTopics.slice(0,5).map(t => t.title).join(", ")}
- Upcoming festivals (next 90 days): {upcomingFestivals.filter(f => f.marketingRelevance !== "low").map(f => `${f.name} (${f.date})`).join(", ")}

Based on all this information, generate a comprehensive business profile.
Respond in JSON format with this exact structure:

{
  "businessSummary": "2-3 sentence summary of the business, its unique positioning, and market opportunity",
  "industryAnalysis": {
    "marketOverview": "1-2 sentences about the industry in India",
    "keyTrends": ["trend1", "trend2", "trend3"],
    "competitiveAdvantages": ["advantage1", "advantage2"]
  },
  "audiencePersona": {
    "primaryDemographic": "description of ideal customer",
    "painPoints": ["pain1", "pain2", "pain3"],
    "buyingBehavior": "how they discover and purchase",
    "preferredPlatforms": ["instagram", "facebook"]  // ranked
  },
  "competitorInsights": {
    "directCompetitors": "type of businesses competing for same customers",
    "differentiators": ["what makes this business unique 1", "2"],
    "marketGaps": ["opportunity 1", "opportunity 2"]
  },
  "contentPillars": [
    {"name": "pillar name", "description": "what to post about", "frequency": "3x/week"},
    // 3-5 pillars
  ],
  "platformStrategy": {
    "primary": {"platform": "instagram", "reason": "why", "postingFrequency": "5x/week"},
    "secondary": {"platform": "facebook", "reason": "why", "postingFrequency": "3x/week"},
    "optional": {"platform": "linkedin", "reason": "why", "postingFrequency": "2x/week"}
  },
  "seasonalOpportunities": [
    {"occasion": "Diwali", "date": "2026-10-20", "campaignIdea": "Sweet box pre-orders with early bird discount", "contentType": "carousel + festival creative"},
    // next 3-5 relevant occasions
  ],
  "quickWins": [
    "Actionable recommendation 1 the business can implement this week",
    "Recommendation 2",
    "Recommendation 3"
  ]
}

IMPORTANT:
- All insights must be specific to THIS business, not generic advice.
- Festival suggestions must be relevant to the business industry.
- Platform recommendations must match the target audience demographics.
- Content pillars should be actionable and specific (not "post good content").
- Keep language professional but accessible for non-marketing SMB owners.
- Think like an Indian marketing expert who understands local buying patterns.
```

---

### Step 6: Call Gemini (lib/gemini.ts)

```typescript
// lib/gemini.ts

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface GeminiOptions {
  temperature?: number;        // 0.0-1.0, default 0.7
  maxTokens?: number;          // default 4096
  jsonMode?: boolean;          // default false
}

async function callGemini(
  prompt: string,
  options: GeminiOptions = {}
): Promise<string>

async function callGeminiJSON<T>(
  prompt: string,
  options?: GeminiOptions
): Promise<T>
```

Implementation:
1. Use `@google/generative-ai` npm package (official SDK)
2. Model: `gemini-2.5-flash` (latest, fastest)
3. For JSON responses: set `generationConfig.responseMimeType: "application/json"`
4. Timeout: 30 seconds
5. Error handling:
   - 429 (rate limit): Return cached response if available, otherwise show "Rate limit reached" message
   - 500/503: Retry once after 2 seconds, then return fallback
   - Parse error: If JSON response is malformed, try to extract JSON from the text response
6. **Fallback:** If Gemini is completely unavailable, return a pre-built template response based on the industry. Bundle 5-6 template responses for common industries (bakery, restaurant, salon, gym, clothing, general).

Rate limit strategy:
- 15 RPM means max 15 businesses can be analyzed per minute
- For the hackathon demo this is plenty (we'll demo 3 businesses)
- Add a simple in-memory queue if needed: `const queue = new Map<string, Promise<any>>()`

---

### Step 7: Save to Firebase Firestore

```typescript
// lib/firebase.ts

// Collection: businesses
// Document ID: auto-generated
interface BusinessDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Input data
  input: {
    name: string;
    websiteUrl?: string;
    industry: string;
    targetAudience: string[];
    location: string;
    products: string[];
    tone: string;
    brandColors: string[];
    logoUrl?: string;
  };
  
  // Scraped data (if URL provided)
  scrapedData?: ScrapedData;
  
  // AI-generated profile
  profile: BusinessProfile;      // The Gemini response
  
  // Metadata
  analysisVersion: number;       // increment on re-analysis
  lastAnalyzedAt: Timestamp;
}
```

Save the full analysis to Firestore so:
- User can come back later and see their profile
- Weekly planner can reference it without re-analyzing
- Multiple team members can access the same business data

---

### Step 8: API Response

```typescript
// POST /api/business/analyze response:
interface AnalyzeResponse {
  success: boolean;
  businessId: string;            // Firestore document ID
  profile: BusinessProfile;      // The full AI-generated profile
  scrapedData?: ScrapedData;     // Website data (if URL was provided)
  analysisTime: number;          // milliseconds taken
  sources: {
    website: boolean;            // was website scraped successfully?
    trends: boolean;             // were trends fetched?
    festivals: boolean;          // were festivals fetched?
  };
}
```

---

# FEATURE 3.2 — Weekly Growth Planner

## What It Does

Takes the business profile from 3.1 and generates a complete 7-day content calendar.

Input:
1. Business profile (from Firestore, generated in 3.1)
2. Week start date (default: next Monday)
3. Focus/goals for the week (optional — user can specify "push Diwali sale" or "new product launch")
4. Past performance data (optional — which post types performed best)

Output:
1. 7-day calendar with 1-3 posts per day
2. Each post has: type, platform(s), theme, suggested headline, suggested caption hook, hashtags, best time to post
3. Festival/occasion posts auto-included when relevant
4. Mix of content types (posts, carousels, festival creatives, stories)
5. Engagement predictions (estimated reach based on post type + timing)

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Frontend                        │
│  /planner page — 7-day calendar view             │
│  User selects week, can set focus/goals          │
└──────────────────────┬──────────────────────────┘
                       │ POST /api/planner/generate
                       ▼
┌─────────────────────────────────────────────────┐
│        API Route: /api/planner/generate          │
│                                                   │
│  Step 1: Load business profile from Firestore    │
│  Step 2: Get festivals for the target week       │
│  Step 3: Get trending topics for the industry    │
│  Step 4: Get news headlines (GNews)              │
│  Step 5: Build planner prompt with all context   │
│  Step 6: Call Gemini → 7-day calendar JSON       │
│  Step 7: Post-process (validate times, types)    │
│  Step 8: Save plan to Firestore                  │
│  Step 9: Return to frontend                      │
└─────────────────────────────────────────────────┘
```

---

## File Structure (additions to 3.1)

```
src/
  app/
    api/
      planner/
        generate/
          route.ts              # POST — generate weekly plan
        [businessId]/
          route.ts              # GET — fetch saved plans for a business
          [planId]/
            route.ts            # GET/PUT — fetch or update specific plan
    planner/
      page.tsx                  # Weekly calendar UI
      components/
        WeekSelector.tsx        # Pick which week to plan
        CalendarGrid.tsx        # 7-column day grid
        DayColumn.tsx           # Single day with post cards
        PostCard.tsx            # Individual post preview
        PostDetailSheet.tsx     # Slide-out detail panel
        PlannerToolbar.tsx      # Regenerate, export, settings
  lib/
    prompts/
      weekly-planner.ts         # Planner prompt templates
    gnews.ts                    # GNews API client (news headlines)
    types/
      calendar.ts               # Planner TypeScript interfaces
```

---

## Detailed Implementation

### API Endpoint: POST /api/planner/generate

```typescript
// Request body:
interface PlannerRequest {
  businessId: string;            // required — from 3.1
  weekStartDate: string;         // ISO date, default next Monday
  weeklyGoals?: string;          // optional user focus
  excludeTypes?: string[];       // e.g. ["carousel"] if user doesn't want carousels
  platforms?: string[];          // limit to specific platforms
}
```

---

### Step 1: Load Business Profile

```typescript
const business = await getBusinessFromFirestore(businessId);
if (!business) return { error: "Business not found", status: 404 };
```

---

### Step 2: Get Festivals for Target Week

```typescript
const weekEnd = addDays(weekStartDate, 6);
const festivals = await getUpcomingFestivals("IN", 90);
const weekFestivals = festivals.filter(f => 
  f.date >= weekStartDate && f.date <= weekEnd
);
const nearbyFestivals = festivals.filter(f =>
  f.daysAway <= 14 && f.marketingRelevance !== "low"
);
```

Why `nearbyFestivals`? If Diwali is 5 days away, this week's content should build anticipation even if Diwali falls next week.

---

### Step 3: Get Industry Trends

```typescript
const trends = await getIndustryTrends(business.input.industry);
const topTrends = trends.slice(0, 5);
```

---

### Step 4: Get News Headlines (gnews.ts)

```typescript
// lib/gnews.ts

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
}

async function getIndustryNews(
  industry: string,
  country: string = "in"
): Promise<NewsArticle[]>
```

Implementation:
1. Call `GET https://gnews.io/api/v4/search?q={industry}&country=in&lang=en&max=5&token={KEY}`
2. Map industry to better search terms:
   - bakery → "bakery OR baking business"
   - restaurant → "restaurant food industry India"
   - gym → "fitness gym health India"
3. Cache results for 12 hours (news doesn't need real-time refresh for weekly planning)
4. Fallback: If API fails, return empty array. News is supplementary.

---

### Step 5: Build Planner Prompt (prompts/weekly-planner.ts)

```typescript
function buildWeeklyPlannerPrompt(
  business: BusinessDocument,
  weekStartDate: string,
  weekFestivals: Festival[],
  nearbyFestivals: Festival[],
  trends: TrendingTopic[],
  news: NewsArticle[],
  userGoals?: string,
): string
```

The prompt:

```
You are an expert Indian social media strategist creating a weekly content
calendar for a small business. You understand Indian market dynamics, festival
marketing, and social media algorithms.

BUSINESS CONTEXT:
- Name: {business.input.name}
- Industry: {business.input.industry}
- Location: {business.input.location}
- Products: {business.input.products.join(", ")}
- Target Audience: {business.profile.audiencePersona.primaryDemographic}
- Brand Tone: {business.input.tone}
- Primary Platform: {business.profile.platformStrategy.primary.platform}
- Content Pillars: {business.profile.contentPillars.map(p => p.name).join(", ")}

WEEK: {weekStartDate} to {weekEndDate} ({getDayName(weekStartDate)} to {getDayName(weekEndDate)})

{IF userGoals:}
WEEKLY FOCUS/GOALS: {userGoals}
{END IF}

FESTIVALS THIS WEEK:
{weekFestivals.map(f => `- ${f.name} on ${f.date} (${f.type})`).join("\n")}

UPCOMING FESTIVALS (build anticipation):
{nearbyFestivals.map(f => `- ${f.name} in ${f.daysAway} days`).join("\n")}

TRENDING IN INDIA:
{trends.map(t => `- ${t.title} (${t.trafficVolume} searches)`).join("\n")}

INDUSTRY NEWS:
{news.map(n => `- ${n.title}`).join("\n")}

POSTING GUIDELINES:
- Instagram: Best times 12-1 PM and 6-8 PM IST. Mix reels, carousels, single posts.
- Facebook: Best times 1-3 PM IST. Longer captions work better.
- LinkedIn: Best times 8-10 AM IST (weekdays only). Professional tone, industry insights.
- Twitter: Best times 9-11 AM IST. Short, punchy, trending hashtags.

CONTENT MIX RULES:
- 40% value/educational content (tips, how-tos, industry insights)
- 30% promotional (products, offers, services)
- 20% engagement (polls, questions, behind-the-scenes)
- 10% festival/seasonal (festival greetings, seasonal offers)
- Never post more than 2 promotional posts in a row
- Include at least 1 carousel per week
- Include festival content if any festival falls this week or within 3 days

Generate a 7-day content calendar. Each day should have 1-2 posts (maximum 3 on
festival days). Respond in JSON:

{
  "weekSummary": "1-2 sentence overview of this week's strategy",
  "totalPosts": number,
  "days": [
    {
      "date": "2026-10-14",
      "dayName": "Monday",
      "isFestival": false,
      "festivalName": null,
      "posts": [
        {
          "id": "mon-1",
          "time": "12:30",
          "platform": ["instagram", "facebook"],
          "type": "post",                   // "post" | "carousel" | "festival" | "banner" | "story"
          "category": "educational",        // "educational" | "promotional" | "engagement" | "festival"
          "theme": "short description of post theme",
          "suggestedHeadline": "Main text/hook for the post",
          "captionHook": "First line of caption (the hook that makes people stop scrolling)",
          "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
          "cta": "Call to action text",
          "estimatedReach": "500-800",      // rough estimate
          "notes": "Any special instructions for creative generation"
        }
      ]
    }
    // ... 7 days total
  ],
  "weeklyTips": [
    "Tip for maximizing engagement this week",
    "Tip 2"
  ]
}

IMPORTANT:
- Times must be in 24-hour format HH:MM (IST)
- All content must be specific to {business.input.name}, not generic
- Festival posts should be scheduled 1 day before AND on the festival day
- If a trending topic is relevant to the business, incorporate it
- Hashtags should mix popular (1M+ posts) with niche (10K-100K posts)
- Each post should be different — no repetitive themes
- Weekend posts can be more casual/behind-the-scenes
- Monday posts should be motivational/fresh-start themed
```

---

### Step 6: Call Gemini

Same as 3.1 — use `callGeminiJSON()` with structured output.

Temperature: 0.8 (slightly creative for content variety)
Max tokens: 4096 (weekly plan can be verbose)

---

### Step 7: Post-Process

After receiving Gemini's response, validate and clean up:

```typescript
function postProcessPlan(plan: WeeklyPlan): WeeklyPlan {
  // 1. Validate all dates fall within the target week
  // 2. Validate times are valid HH:MM format
  // 3. Validate post types are from allowed list
  // 4. Validate platforms are from allowed list
  // 5. Ensure no duplicate post IDs
  // 6. Sort posts within each day by time
  // 7. Add unique IDs if missing
  // 8. Truncate hashtags to max 10 per post
  // 9. Validate estimatedReach is a reasonable range string
  return cleanedPlan;
}
```

---

### Step 8: Save to Firestore

```typescript
// Collection: plans
// Document structure:
interface PlanDocument {
  id: string;
  businessId: string;            // references businesses collection
  createdAt: Timestamp;
  weekStartDate: string;         // ISO date
  weekEndDate: string;
  
  plan: WeeklyPlan;              // The generated calendar
  
  // Tracking
  userGoals?: string;
  regenerationCount: number;     // how many times user regenerated
  status: "draft" | "active" | "completed";
  
  // Context used for generation (for debugging/improvement)
  contextUsed: {
    festivalsInWeek: string[];
    trendsUsed: string[];
    newsUsed: string[];
  };
}
```

---

### Step 9: API Response

```typescript
interface PlannerResponse {
  success: boolean;
  planId: string;
  plan: WeeklyPlan;
  contextUsed: {
    festivals: Festival[];
    trends: TrendingTopic[];
    news: NewsArticle[];
  };
  generationTime: number;        // ms
}
```

---

## Additional API Endpoints

### GET /api/planner/{businessId}
Returns all saved plans for a business (paginated, latest first).

### PUT /api/planner/{businessId}/{planId}
Update a specific plan — user can:
- Edit individual posts (change time, platform, type)
- Move posts between days
- Delete posts
- Mark posts as "published" or "skipped"

### POST /api/planner/regenerate
Regenerate a single day or the entire week:
```typescript
interface RegenerateRequest {
  planId: string;
  scope: "full_week" | "single_day";
  targetDate?: string;           // required if scope is single_day
  feedback?: string;             // "more promotional" / "more educational"
}
```

---

## Caching Strategy

| Data | Cache Location | TTL | Refresh Trigger |
|------|---------------|-----|-----------------|
| Business profile | Firestore | Forever (until re-analyzed) | User clicks "Re-analyze" |
| Festival calendar | Firestore | 30 days | Automatic monthly refresh |
| Google Trends | In-memory Map | 6 hours | Automatic |
| GNews headlines | In-memory Map | 12 hours | Automatic |
| Generated plans | Firestore | Forever | User regenerates |

In-memory cache implementation (simple, no Redis needed):

```typescript
// lib/cache.ts
const cache = new Map<string, { data: any; expiresAt: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: any, ttlMs: number): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}
```

---

## Fallback Strategy (Mandatory per Hackathon Rules)

Every external dependency must have a fallback:

| Service | Fallback |
|---------|----------|
| Gemini API down | Return pre-built template responses from `data/fallback-profiles/` (5 industry templates) |
| Gemini rate limit (429) | Show "Rate limit reached. Using cached suggestion." + return last cached response |
| Website scraping fails | Skip scraping, proceed with form data only |
| Calendarific API down | Use bundled `data/festivals-2026.json` static file |
| Google Trends RSS fails | Return empty trends array (planner works without trends) |
| GNews API fails | Return empty news array (planner works without news) |
| Firebase down | Return response directly without saving (user loses persistence) |

Pre-built fallback templates (bundle in `data/fallback-profiles/`):
```
data/
  fallback-profiles/
    bakery.json
    restaurant.json
    salon.json
    gym.json
    general.json
  festivals-2026.json           # 50 major Indian + global festivals
  sample-weekly-plan.json       # Sample plan for demo
```

---

## Build Order (for Sonnet implementation)

### Phase 1: Foundation (do first, everything depends on these)
1. **Firebase setup** — `lib/firebase.ts` — config, Firestore helpers (getDoc, setDoc, updateDoc)
2. **Gemini client** — `lib/gemini.ts` — callGemini, callGeminiJSON, error handling, fallback
3. **TypeScript types** — `lib/types/business.ts`, `lib/types/calendar.ts` — all interfaces

### Phase 2: Data Collection (parallel, independent)
4. **Website scraper** — `lib/scraper.ts` — cheerio-based, returns ScrapedData
5. **Calendarific client** — `lib/calendarific.ts` — festival calendar with caching
6. **Trends parser** — `lib/trends.ts` — Google Trends RSS feed parser
7. **GNews client** — `lib/gnews.ts` — news headlines for industry
8. **Cache utility** — `lib/cache.ts` — in-memory TTL cache

### Phase 3: AI Prompts (depends on types)
9. **Business analysis prompt** — `lib/prompts/business-analysis.ts`
10. **Weekly planner prompt** — `lib/prompts/weekly-planner.ts`

### Phase 4: API Routes (depends on everything above)
11. **POST /api/business/analyze** — main business intelligence endpoint
12. **GET /api/business/[id]** — fetch saved business profile
13. **GET /api/festivals** — upcoming festivals endpoint
14. **GET /api/trends** — trending topics endpoint
15. **POST /api/planner/generate** — weekly plan generation
16. **GET /api/planner/[businessId]** — fetch saved plans

### Phase 5: Frontend (depends on API routes)
17. **Onboarding wizard** — `/onboard` page with 5-step form
18. **Business profile display** — show AI-generated profile with edit capability
19. **Weekly planner UI** — 7-day calendar grid with post cards
20. **Planner interactions** — drag/drop, edit posts, regenerate

### Phase 6: Fallbacks + Polish
21. **Fallback templates** — pre-built responses for 5 industries
22. **Static festival data** — bundled JSON backup
23. **Error handling** — graceful degradation, user-friendly messages
24. **Loading states** — skeleton screens, progress indicators

---

## Verification Checklist

### 3.1 Business Intelligence
- [ ] Onboarding form collects all required fields with validation
- [ ] Website URL scraping extracts title, description, social links, body text
- [ ] Calendarific returns Indian + global festivals correctly
- [ ] Google Trends RSS returns daily trending topics for India
- [ ] Gemini generates a structured business profile in JSON
- [ ] Profile is saved to Firebase Firestore
- [ ] User can view their saved profile on the dashboard
- [ ] Fallback works when Gemini is rate-limited (pre-built template shown)
- [ ] Fallback works when website scraping fails (continues without it)
- [ ] Analysis completes in under 30 seconds
- [ ] Test with 3 different businesses: bakery, gym, clothing store

### 3.2 Weekly Growth Planner
- [ ] Can generate a 7-day plan for any business profile
- [ ] Festival days are detected and festival content is auto-included
- [ ] Posts have valid times, platforms, types, hashtags
- [ ] Content mix follows 40/30/20/10 rule approximately
- [ ] No more than 2 promotional posts in a row
- [ ] At least 1 carousel per week
- [ ] User can set weekly goals that influence the plan
- [ ] Plan is saved to Firestore
- [ ] User can view and edit individual posts
- [ ] Regenerate button creates a new plan
- [ ] Fallback works when Gemini is unavailable
- [ ] Test with Diwali week, normal week, and a week with no festivals

### Integration Test
- [ ] Full flow: Onboard business → Generate profile → Generate weekly plan → View calendar
- [ ] Test with 3 demo businesses end to end
- [ ] API response times all under 30 seconds
- [ ] All fallbacks trigger correctly when APIs are mocked as unavailable

---

## NPM Packages Needed

```bash
npm install @google/generative-ai    # Gemini SDK
npm install cheerio                   # HTML parsing for scraping
npm install fast-xml-parser           # RSS feed parsing
npm install firebase                  # Firebase SDK
npm install firebase-admin            # Firebase Admin (server-side)
npm install date-fns                  # Date manipulation
npm install zod                       # Input validation
```

All free, open-source, no licensing issues.
