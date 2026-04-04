import { NewsArticle } from "./types/calendar";
import { getCached, setCache, TTL } from "./cache";

const BASE_URL = "https://gnews.io/api/v4";

// Google News RSS as no-key fallback
const GOOGLE_NEWS_RSS = "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en";

const INDUSTRY_SEARCH_TERMS: Record<string, string> = {
  bakery: "bakery business india",
  restaurant: "restaurant food industry india",
  cafe: "cafe coffee shop india",
  salon: "beauty salon industry india",
  gym: "fitness gym health india",
  yoga_studio: "yoga wellness india",
  clothing: "fashion clothing retail india",
  jewelry: "gold jewelry market india",
  grocery: "grocery retail india",
  pharmacy: "pharmacy medical india",
  electronics: "electronics technology india",
  florist: "flowers events india",
  travel: "travel tourism india",
  hotel: "hospitality hotel india",
  real_estate: "real estate property india",
  general: "small business india",
};

async function fetchGNewsAPI(query: string): Promise<NewsArticle[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) return [];

  try {
    const encoded = encodeURIComponent(query);
    const url = `${BASE_URL}/search?q=${encoded}&country=in&lang=en&max=5&token=${apiKey}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];

    const data = await res.json();
    return (data.articles || []).map((a: Record<string, unknown>) => ({
      title: a.title as string,
      description: (a.description as string) || "",
      url: a.url as string,
      source: ((a.source as Record<string, unknown>)?.name as string) || "GNews",
      publishedAt: (a.publishedAt as string) || new Date().toISOString(),
    }));
  } catch (err) {
    console.warn("GNews API failed:", err);
    return [];
  }
}

async function fetchGoogleNewsRSS(): Promise<NewsArticle[]> {
  try {
    const { XMLParser } = await import("fast-xml-parser");
    const res = await fetch(GOOGLE_NEWS_RSS, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];

    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(xml);
    const items = parsed?.rss?.channel?.item || [];
    const arr = Array.isArray(items) ? items : [items];

    return arr.slice(0, 5).map((item: Record<string, unknown>) => ({
      title: (item.title as string) || "",
      description: (item.description as string) || "",
      url: (item.link as string) || "",
      source: "Google News",
      publishedAt: (item.pubDate as string) || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function getIndustryNews(
  industry: string
): Promise<NewsArticle[]> {
  const cacheKey = `news_${industry}`;
  const cached = getCached<NewsArticle[]>(cacheKey);
  if (cached) return cached;

  const query = INDUSTRY_SEARCH_TERMS[industry] || "small business india";

  // Try GNews API first, fall back to Google News RSS
  let articles = await fetchGNewsAPI(query);
  if (!articles.length) {
    articles = await fetchGoogleNewsRSS();
  }

  if (articles.length > 0) setCache(cacheKey, articles, TTL.NEWS);
  return articles;
}
