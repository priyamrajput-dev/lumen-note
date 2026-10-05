import { redis, redisKey } from "./redis.js";

let lastCacheErrorLog = 0;
function logCacheError(op: string, err: unknown) {
  const now = Date.now();
  // Throttle error logging to once every 10s
  if (now - lastCacheErrorLog > 10000) {
    lastCacheErrorLog = now;
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[Redis Cache] Error during "${op}" (gracefully continuing): ${msg}`);
  }
}

/**
 * Build a structured, prefixed cache key: lumennote:${NODE_ENV}:cache:...
 */
export function buildCacheKey(...parts: (string | number)[]): string {
  return redisKey("cache", ...parts);
}

/**
 * Get item from cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (error) {
    logCacheError(`get(${key})`, error);
    return null;
  }
}

/**
 * Set item in cache with TTL in seconds
 */
export async function setCache(
  key: string,
  value: unknown,
  ttlSeconds: number,
): Promise<void> {
  try {
    const serialized = JSON.stringify(value);
    await redis.set(key, serialized, "EX", ttlSeconds);
  } catch (error) {
    logCacheError(`set(${key})`, error);
  }
}

/**
 * Delete one or more specific cache keys
 */
export async function delCache(...keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  try {
    const filtered = keys.filter(Boolean);
    if (filtered.length > 0) {
      await redis.del(...filtered);
    }
  } catch (error) {
    logCacheError(`del`, error);
  }
}

/**
 * Invalidate keys matching a pattern using non-blocking SCAN
 */
export async function delCachePattern(pattern: string): Promise<void> {
  try {
    let cursor = "0";
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100,
      );
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== "0");
  } catch (error) {
    logCacheError(`delPattern(${pattern})`, error);
  }
}

/**
 * Cache-aside helper: returns cached value if present; otherwise calls fetcher, caches, and returns.
 * If Redis is offline or fails, seamlessly runs the fetcher without throwing.
 */
export async function getOrSetCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cached = await getCache<T>(key);
  if (cached !== null && cached !== undefined) {
    return cached;
  }

  const fresh = await fetcher();

  if (fresh !== null && fresh !== undefined) {
    // Non-blocking set
    setCache(key, fresh, ttlSeconds).catch((err) =>
      logCacheError(`setCache in getOrSet(${key})`, err),
    );
  }

  return fresh;
}
