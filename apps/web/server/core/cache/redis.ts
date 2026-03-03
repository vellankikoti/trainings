/**
 * Redis Integration (Upstash)
 *
 * Provides a production-grade Redis client using Upstash (serverless Redis):
 * - HTTP-based (works in serverless/edge environments)
 * - Automatic connection management (no pool to maintain)
 * - Typed cache operations with TTL
 * - Graceful degradation when Redis is unavailable
 *
 * Usage:
 *   import { redis, cache } from '@/server/core/cache/redis';
 *
 *   // Direct Redis operations
 *   await redis.set('key', 'value', { ex: 300 });
 *   const val = await redis.get('key');
 *
 *   // Type-safe cache operations with automatic serialization
 *   await cache.set('user:123:profile', profileData, 300);
 *   const profile = await cache.get<Profile>('user:123:profile');
 */

import { Redis } from "@upstash/redis";
import { logger } from "../observability/logger";

const log = logger.child({ module: "cache" });

// ---------------------------------------------------------------------------
// Redis client singleton
// ---------------------------------------------------------------------------

let redisInstance: Redis | null = null;
let redisAvailable = true;

function getRedisClient(): Redis | null {
  if (redisInstance) return redisInstance;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    log.warn("Redis not configured — caching disabled", {
      hint: "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN",
    });
    redisAvailable = false;
    return null;
  }

  try {
    redisInstance = new Redis({
      url,
      token,
      automaticDeserialization: true,
    });

    log.info("Redis client initialized");
    return redisInstance;
  } catch (error) {
    log.error("Redis client initialization failed", error);
    redisAvailable = false;
    return null;
  }
}

// ---------------------------------------------------------------------------
// Resilient Redis wrapper — fails open (never blocks on cache failure)
// ---------------------------------------------------------------------------

/**
 * Wraps Redis operations with error handling.
 * On failure, returns null/undefined instead of throwing.
 * This ensures cache failures never cascade to the application.
 */
async function resilientOp<T>(
  operation: string,
  fn: (client: Redis) => Promise<T>,
  fallback: T
): Promise<T> {
  const client = getRedisClient();
  if (!client) return fallback;

  try {
    return await fn(client);
  } catch (error) {
    log.warn(`Redis ${operation} failed — falling back`, {
      operation,
      error: error instanceof Error ? error.message : String(error),
    });
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Typed cache layer
// ---------------------------------------------------------------------------

export const cache = {
  /**
   * Get a cached value. Returns null on miss or failure.
   */
  async get<T>(key: string): Promise<T | null> {
    return resilientOp("get", (r) => r.get<T>(key), null);
  },

  /**
   * Set a cached value with TTL in seconds.
   */
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await resilientOp(
      "set",
      (r) => r.set(key, value, { ex: ttlSeconds }),
      null
    );
  },

  /**
   * Delete a cached key.
   */
  async del(key: string): Promise<void> {
    await resilientOp("del", (r) => r.del(key), 0);
  },

  /**
   * Delete multiple keys matching a pattern.
   * Uses SCAN internally — safe for production (no KEYS command).
   */
  async delPattern(pattern: string): Promise<number> {
    return resilientOp(
      "delPattern",
      async (r) => {
        let cursor = 0;
        let deleted = 0;

        do {
          const [nextCursor, keys] = await r.scan(cursor, { match: pattern, count: 100 });
          cursor = Number(nextCursor);

          if (keys.length > 0) {
            await r.del(...keys);
            deleted += keys.length;
          }
        } while (cursor !== 0);

        return deleted;
      },
      0
    );
  },

  /**
   * Get or set: return cached value if exists, otherwise compute and cache.
   */
  async getOrSet<T>(
    key: string,
    ttlSeconds: number,
    computeFn: () => Promise<T>
  ): Promise<T> {
    const cached = await cache.get<T>(key);
    if (cached !== null) return cached;

    const value = await computeFn();
    await cache.set(key, value, ttlSeconds);
    return value;
  },

  /**
   * Increment a counter. Returns the new value.
   * Used for rate limiting counters and metrics.
   */
  async incr(key: string, ttlSeconds?: number): Promise<number> {
    return resilientOp(
      "incr",
      async (r) => {
        const val = await r.incr(key);
        if (ttlSeconds && val === 1) {
          // Set TTL only on first increment (when counter is created)
          await r.expire(key, ttlSeconds);
        }
        return val;
      },
      0
    );
  },

  /**
   * Check if Redis is available and responding.
   */
  async ping(): Promise<boolean> {
    if (!redisAvailable) return false;
    return resilientOp(
      "ping",
      async (r) => {
        const result = await r.ping();
        return result === "PONG";
      },
      false
    );
  },

  /**
   * Whether Redis is configured (env vars present).
   */
  isConfigured(): boolean {
    return !!(
      process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
    );
  },
};

// ---------------------------------------------------------------------------
// Raw Redis client — for advanced operations (sorted sets, pub/sub, etc.)
// ---------------------------------------------------------------------------

/**
 * Raw Upstash Redis client.
 * Returns null if Redis is not configured.
 * Use cache.* methods for standard operations.
 * Use this directly only for sorted sets, lists, and other advanced data structures.
 */
export function getRedis(): Redis | null {
  return getRedisClient();
}
