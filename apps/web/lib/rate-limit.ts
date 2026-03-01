/**
 * In-memory rate limiter for API routes.
 *
 * For production at scale, replace with Upstash Redis (@upstash/ratelimit)
 * which works at the edge and persists across serverless invocations.
 *
 * This in-memory implementation is suitable for single-server deployments
 * and development. Entries are automatically cleaned up to prevent memory leaks.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 60 seconds
const CLEANUP_INTERVAL = 60_000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
    // Stop cleanup timer if store is empty
    if (store.size === 0 && cleanupTimer) {
      clearInterval(cleanupTimer);
      cleanupTimer = null;
    }
  }, CLEANUP_INTERVAL);
  // Allow process to exit even if timer is active
  if (cleanupTimer && typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    cleanupTimer.unref();
  }
}

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

/**
 * Check and consume a rate limit token for the given identifier.
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig,
): RateLimitResult {
  ensureCleanup();

  const now = Date.now();
  const key = identifier;
  const entry = store.get(key);

  // If no entry or window expired, start fresh
  if (!entry || now > entry.resetAt) {
    const resetAt = now + config.windowSeconds * 1000;
    store.set(key, { count: 1, resetAt });
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetAt,
    };
  }

  // Within window — check limit
  if (entry.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  // Increment
  entry.count++;
  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Pre-configured rate limits per endpoint category.
 */
export const RATE_LIMITS = {
  quizSubmit: { limit: 10, windowSeconds: 60 },         // 10 req/min
  progress: { limit: 30, windowSeconds: 60 },            // 30 req/min
  labSession: { limit: 5, windowSeconds: 3600 },         // 5 req/hr
  certificateGenerate: { limit: 3, windowSeconds: 3600 }, // 3 req/hr
  checkout: { limit: 5, windowSeconds: 3600 },            // 5 req/hr
  general: { limit: 60, windowSeconds: 60 },              // 60 req/min
} as const;

/**
 * Helper to create a 429 response with appropriate headers.
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: "Too Many Requests",
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(result.resetAt),
      },
    },
  );
}
