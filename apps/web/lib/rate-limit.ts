/**
 * Rate limiter for API routes — uses Upstash Redis in production,
 * falls back to in-memory for development.
 *
 * Production: Uses @upstash/ratelimit with sliding window via Upstash Redis.
 * Development: Uses in-memory Map (single process only).
 *
 * IMPORTANT: This function is ASYNC (returns a Promise).
 * All callers must use `await rateLimit(...)`.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ── Types ────────────────────────────────────────────────────────────────────

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

// ── Redis client (singleton) ─────────────────────────────────────────────────

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  redis = new Redis({ url, token });
  return redis;
}

// ── Upstash rate limiter instances (cached per config key) ───────────────────

const limiters = new Map<string, Ratelimit>();

function getOrCreateLimiter(config: RateLimitConfig): Ratelimit | null {
  const redisClient = getRedis();
  if (!redisClient) return null;

  const key = `${config.limit}:${config.windowSeconds}`;
  if (limiters.has(key)) return limiters.get(key)!;

  const limiter = new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(config.limit, `${config.windowSeconds} s`),
    analytics: true,
    prefix: "ratelimit:api",
  });

  limiters.set(key, limiter);
  return limiter;
}

// ── In-memory fallback (development only) ────────────────────────────────────

interface InMemoryEntry {
  count: number;
  resetAt: number;
}

const inMemoryStore = new Map<string, InMemoryEntry>();

// Clean up expired entries every 60 seconds
const CLEANUP_INTERVAL = 60_000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of inMemoryStore) {
      if (now > entry.resetAt) {
        inMemoryStore.delete(key);
      }
    }
    if (inMemoryStore.size === 0 && cleanupTimer) {
      clearInterval(cleanupTimer);
      cleanupTimer = null;
    }
  }, CLEANUP_INTERVAL);
  if (cleanupTimer && typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    (cleanupTimer as NodeJS.Timeout).unref();
  }
}

function inMemoryRateLimit(
  identifier: string,
  config: RateLimitConfig,
): RateLimitResult {
  ensureCleanup();

  const now = Date.now();
  const entry = inMemoryStore.get(identifier);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + config.windowSeconds * 1000;
    inMemoryStore.set(identifier, { count: 1, resetAt });
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetAt,
    };
  }

  if (entry.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  entry.count++;
  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

// ── Main rate limit function ─────────────────────────────────────────────────

/**
 * Check and consume a rate limit token for the given identifier.
 *
 * Uses Upstash Redis in production (shared across all serverless isolates).
 * Falls back to in-memory for development when Redis is not configured.
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const limiter = getOrCreateLimiter(config);

  if (limiter) {
    try {
      const result = await limiter.limit(identifier);
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        resetAt: Math.ceil(result.reset / 1000) * 1000, // normalize to ms
      };
    } catch (error) {
      // Redis failure — fail open (allow the request, log warning)
      console.warn("[rate-limit] Redis failed, allowing request:", error);
      return {
        success: true,
        limit: config.limit,
        remaining: config.limit,
        resetAt: Date.now() + config.windowSeconds * 1000,
      };
    }
  }

  // In-memory fallback (dev only)
  return inMemoryRateLimit(identifier, config);
}

// ── Pre-configured rate limits per endpoint category ─────────────────────────

export const RATE_LIMITS = {
  quizSubmit: { limit: 10, windowSeconds: 60 },         // 10 req/min
  progress: { limit: 30, windowSeconds: 60 },            // 30 req/min
  labSession: { limit: 5, windowSeconds: 3600 },         // 5 req/hr
  certificateGenerate: { limit: 3, windowSeconds: 3600 }, // 3 req/hr
  checkout: { limit: 5, windowSeconds: 3600 },            // 5 req/hr
  general: { limit: 60, windowSeconds: 60 },              // 60 req/min
  gdprExport: { limit: 5, windowSeconds: 600 },           // 5 req/10min
  invitation: { limit: 20, windowSeconds: 3600 },         // 20 invitations/hr
  registration: { limit: 3, windowSeconds: 3600 },        // 3 registrations/hr
} as const;

// ── Helper to create a 429 response ──────────────────────────────────────────

/**
 * Helper to create a 429 response with appropriate headers.
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: "Too Many Requests",
      retryAfter: Math.max(1, retryAfter),
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(Math.max(1, retryAfter)),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(result.resetAt),
      },
    },
  );
}
