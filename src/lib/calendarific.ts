import { Festival } from "./types/calendar";
import { getCached, setCache, TTL } from "./cache";
import { getFestivalsFromCache, saveFestivalsToCache } from "./firebase";
import fallbackFestivals from "../../data/festivals-2026.json";

const BASE_URL = "https://calendarific.com/api/v2/holidays";

// Festivals with high marketing relevance for Indian SMBs
const HIGH_RELEVANCE = new Set([
  "diwali", "holi", "christmas", "eid", "eid al-fitr", "eid al-adha",
  "new year", "new year's day", "valentine", "independence day",
  "republic day", "navratri", "durga puja", "ganesh chaturthi",
  "raksha bandhan", "janmashtami", "onam", "pongal", "baisakhi",
  "mother's day", "father's day", "women's day", "black friday",
  "dussehra", "ram navami", "gurupurab",
]);

const MEDIUM_RELEVANCE = new Set([
  "makar sankranti", "lohri", "easter", "halloween", "thanksgiving",
  "good friday", "christmas eve", "new year's eve", "guru purnima",
  "hanuman jayanti", "buddha purnima", "mahashivratri",
]);

function getRelevance(name: string): Festival["marketingRelevance"] {
  const lower = name.toLowerCase();
  for (const h of HIGH_RELEVANCE) {
    if (lower.includes(h)) return "high";
  }
  for (const m of MEDIUM_RELEVANCE) {
    if (lower.includes(m)) return "medium";
  }
  return "low";
}

function daysFromNow(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export async function getUpcomingFestivals(
  country: string = "IN",
  daysAhead: number = 90
): Promise<Festival[]> {
  const year = new Date().getFullYear();
  const cacheKey = `festivals_${country}_${year}`;

  // 1. Check in-memory cache first
  const memCached = getCached<Festival[]>(cacheKey);
  if (memCached) return filterUpcoming(memCached, daysAhead);

  // 2. Check Firestore cache
  try {
    const fsCached = await getFestivalsFromCache(cacheKey);
    if (fsCached) {
      const festivals = fsCached as Festival[];
      setCache(cacheKey, festivals, TTL.FESTIVALS);
      return filterUpcoming(festivals, daysAhead);
    }
  } catch {
    // Firestore unavailable — continue
  }

  // 3. Fetch from Calendarific API
  const apiKey = process.env.CALENDARIFIC_API_KEY;
  if (apiKey) {
    try {
      const url = `${BASE_URL}?api_key=${apiKey}&country=${country}&year=${year}`;
      const res = await fetch(url, { next: { revalidate: 86400 } });
      if (res.ok) {
        const data = await res.json();
        const holidays = data?.response?.holidays || [];

        const festivals: Festival[] = holidays.map((h: Record<string, unknown>) => {
          const dateObj = h.date as Record<string, unknown>;
          const iso = (dateObj?.iso as string) || "";
          return {
            name: h.name as string,
            date: iso,
            daysAway: daysFromNow(iso),
            type: ((h.type as string[])?.[0]) || "observance",
            description: (h.description as string) || "",
            marketingRelevance: getRelevance(h.name as string),
            region: country,
          };
        });

        // Save to caches
        setCache(cacheKey, festivals, TTL.FESTIVALS);
        saveFestivalsToCache(cacheKey, festivals).catch(() => {});

        return filterUpcoming(festivals, daysAhead);
      }
    } catch (err) {
      console.warn("Calendarific API failed:", err);
    }
  }

  // 4. Fallback to bundled static data
  console.warn("Using fallback festival data");
  const festivals = (fallbackFestivals as Festival[]).map((f) => ({
    ...f,
    daysAway: daysFromNow(f.date),
  }));
  return filterUpcoming(festivals, daysAhead);
}

function filterUpcoming(festivals: Festival[], daysAhead: number): Festival[] {
  return festivals
    .map((f) => ({ ...f, daysAway: daysFromNow(f.date) }))
    .filter((f) => f.daysAway >= 0 && f.daysAway <= daysAhead)
    .sort((a, b) => a.daysAway - b.daysAway);
}
