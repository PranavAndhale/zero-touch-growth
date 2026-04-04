// Simple in-memory TTL cache for server-side use (trends, news, etc.)
// Resets on server restart — that's fine for daily-updated data.

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache<T>(key: string, data: T, ttlMs: number): void {
  store.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export function invalidateCache(key: string): void {
  store.delete(key);
}

// TTL constants
export const TTL = {
  TRENDS: 6 * 60 * 60 * 1000,        // 6 hours
  NEWS: 12 * 60 * 60 * 1000,          // 12 hours
  FESTIVALS: 24 * 60 * 60 * 1000,     // 24 hours (Firestore handles longer TTL)
  SCRAPE: 60 * 60 * 1000,             // 1 hour
} as const;
