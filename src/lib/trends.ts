import { XMLParser } from "fast-xml-parser";
import { TrendingTopic } from "./types/calendar";
import { getCached, setCache, TTL } from "./cache";

const TRENDS_RSS = "https://trends.google.com/trends/trendingsearches/daily/rss?geo=IN";

const INDUSTRY_KEYWORDS: Record<string, string> = {
  bakery: "bakery baking",
  restaurant: "restaurant food",
  cafe: "cafe coffee",
  salon: "beauty salon hair",
  gym: "fitness gym",
  yoga_studio: "yoga wellness",
  clothing: "fashion clothing",
  jewelry: "gold jewelry",
  grocery: "grocery market",
  pharmacy: "medicine health",
  electronics: "electronics gadgets",
  florist: "flowers bouquet",
  travel: "travel tourism",
  hotel: "hotel stay",
  real_estate: "property real estate",
  dentist: "dental health",
  school: "education learning",
  event_planning: "event wedding",
  catering: "catering food",
  general: "small business india",
};

async function fetchTrendsRSS(url: string): Promise<TrendingTopic[]> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    const parsed = parser.parse(xml);

    const items = parsed?.rss?.channel?.item;
    if (!items) return [];

    const itemArray = Array.isArray(items) ? items : [items];

    return itemArray.slice(0, 10).map((item: Record<string, unknown>) => ({
      title: (item.title as string) || "",
      trafficVolume:
        (item["ht:approx_traffic"] as string) ||
        (item["approx_traffic"] as string) ||
        "N/A",
      newsUrl: (item["ht:news_item_url"] as string) || (item.link as string) || undefined,
      relatedQueries: [],
    }));
  } catch (err) {
    console.warn("Trends RSS fetch failed:", err);
    return [];
  }
}

export async function getTrendingInIndia(): Promise<TrendingTopic[]> {
  const cached = getCached<TrendingTopic[]>("trends_india");
  if (cached) return cached;

  const trends = await fetchTrendsRSS(TRENDS_RSS);
  if (trends.length > 0) setCache("trends_india", trends, TTL.TRENDS);
  return trends;
}

export async function getIndustryTrends(industry: string): Promise<TrendingTopic[]> {
  const cacheKey = `trends_industry_${industry}`;
  const cached = getCached<TrendingTopic[]>(cacheKey);
  if (cached) return cached;

  const keyword = INDUSTRY_KEYWORDS[industry] || "small business";
  const encoded = encodeURIComponent(keyword);
  const url = `https://trends.google.com/trends/trendingsearches/daily/rss?geo=IN&q=${encoded}`;

  const trends = await fetchTrendsRSS(url);
  if (trends.length > 0) setCache(cacheKey, trends, TTL.TRENDS);
  return trends;
}
