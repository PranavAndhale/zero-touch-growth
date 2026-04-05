import { XMLParser } from "fast-xml-parser";
import { TrendingTopic } from "./types/calendar";
import { getCached, setCache, TTL } from "./cache";

// Google Trends daily India RSS — no q= filter (it doesn't work on daily endpoint)
const TRENDS_RSS_IN = "https://trends.google.com/trends/trendingsearches/daily/rss?geo=IN";

async function fetchTrendsRSS(): Promise<TrendingTopic[]> {
  try {
    const res = await fetch(TRENDS_RSS_IN, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Accept": "application/rss+xml, application/xml, text/xml",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    const parsed = parser.parse(xml);

    const items = parsed?.rss?.channel?.item;
    if (!items) return [];

    const itemArray = Array.isArray(items) ? items : [items];

    return itemArray.slice(0, 15).map((item: Record<string, unknown>) => ({
      title: (item.title as string) || "",
      trafficVolume:
        (item["ht:approx_traffic"] as string) ||
        (item["approx_traffic"] as string) ||
        "N/A",
      newsUrl: (item["ht:news_item_url"] as string) || (item.link as string) || undefined,
      relatedQueries: [],
    })).filter(t => t.title);
  } catch (err) {
    console.warn("Trends RSS fetch failed:", err);
    return [];
  }
}

export async function getTrendingInIndia(): Promise<TrendingTopic[]> {
  const cached = getCached<TrendingTopic[]>("trends_india");
  if (cached) return cached;

  const trends = await fetchTrendsRSS();
  if (trends.length > 0) setCache("trends_india", trends, TTL.TRENDS);
  return trends;
}

// All industries now share the general India trending feed.
// Industry-specific context is handled by GNews (getIndustryNews).
export async function getIndustryTrends(industry: string): Promise<TrendingTopic[]> {
  const cacheKey = `trends_industry_${industry}`;
  const cached = getCached<TrendingTopic[]>(cacheKey);
  if (cached) return cached;

  const trends = await fetchTrendsRSS();
  if (trends.length > 0) setCache(cacheKey, trends, TTL.TRENDS);
  return trends;
}
