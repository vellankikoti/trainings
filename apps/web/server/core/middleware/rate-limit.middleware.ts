/**
 * Rate Limiting Middleware
 *
 * Production-grade sliding window rate limiter using Upstash Redis.
 * Falls back to in-memory limiter when Redis is unavailable.
 *
 * Features:
 * - Per-user rate limiting (authenticated requests)
 * - Per-IP rate limiting (unauthenticated requests)
 * - Configurable tiers per endpoint group
 * - Standard rate limit response headers
 * - Fail-open on Redis failure (allows traffic, logs warning)
 *
 * Usage:
 *   export const POST = withRateLimit('progress', handler);
 */

import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { RateLimitError } from "../errors";
import { logger } from "../observability/logger";
import type { RouteHandler, RequestContext, RateLimitTier } from "./types";

const log = logger.child({ module: "rate-limit" });

// ---------------------------------------------------------------------------
// Tier configuration
// ---------------------------------------------------------------------------

const TIER_CONFIG: Record<RateLimitTier, { limit: number; windowSeconds: number }> = {
  auth:     { limit: 10,  windowSeconds: 60 },
  progress: { limit: 60,  windowSeconds: 60 },
  events:   { limit: 120, windowSeconds: 60 },
  labs:     { limit: 10,  windowSeconds: 60 },
  search:   { limit: 30,  windowSeconds: 60 },
  reports:  { limit: 5,   windowSeconds: 600 }, // 10 minutes
  global:   { limit: 100, windowSeconds: 60 },
};

// ---------------------------------------------------------------------------
// Upstash rate limiter instances (one per tier)
// ---------------------------------------------------------------------------

const limiters = new Map<string, Ratelimit>();

function getLimiter(tier: RateLimitTier): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  const key = tier;
  if (limiters.has(key)) return limiters.get(key)!;

  const config = TIER_CONFIG[tier];
  const redis = new Redis({ url, token });

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.limit, `${config.windowSeconds} s`),
    analytics: true,
    prefix: `ratelimit:${tier}`,
  });

  limiters.set(key, limiter);
  return limiter;
}

// ---------------------------------------------------------------------------
// In-memory fallback (when Redis is unavailable)
// ---------------------------------------------------------------------------

const inMemoryCounters = new Map<string, { count: number; resetAt: number }>();

// Cleanup stale entries every 60 seconds
if (typeof setInterval !== "undefined") {
  const interval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of inMemoryCounters) {
      if (entry.resetAt <= now) {
        inMemoryCounters.delete(key);
      }
    }
  }, 60_000);
  // Don't prevent process exit
  if (interval && typeof interval === "object" && "unref" in interval) {
    interval.unref();
  }
}

function inMemoryRateLimit(
  identifier: string,
  tier: RateLimitTier
): { success: boolean; limit: number; remaining: number; reset: number } {
  const config = TIER_CONFIG[tier];
  const now = Date.now();
  const key = `${tier}:${identifier}`;

  let entry = inMemoryCounters.get(key);

  if (!entry || entry.resetAt <= now) {
    entry = {
      count: 0,
      resetAt: now + config.windowSeconds * 1000,
    };
    inMemoryCounters.set(key, entry);
  }

  entry.count++;

  return {
    success: entry.count <= config.limit,
    limit: config.limit,
    remaining: Math.max(0, config.limit - entry.count),
    reset: Math.ceil(entry.resetAt / 1000),
  };
}

// ---------------------------------------------------------------------------
// Extract identifier from request
// ---------------------------------------------------------------------------

function getIdentifier(req: NextRequest, ctx: RequestContext): string {
  // Prefer user ID (authenticated requests)
  if (ctx.user?.clerkId) {
    return `user:${ctx.user.clerkId}`;
  }

  // Fall back to IP address
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  return `ip:${ip}`;
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export function withRateLimit(
  tier: RateLimitTier,
  handler: RouteHandler
): RouteHandler {
  return async (req: NextRequest, ctx: RequestContext): Promise<Response> => {
    const identifier = getIdentifier(req, ctx);
    const config = TIER_CONFIG[tier];

    let success: boolean;
    let limit: number;
    let remaining: number;
    let reset: number;

    const limiter = getLimiter(tier);

    if (limiter) {
      // Use Upstash Redis rate limiter
      try {
        const result = await limiter.limit(identifier);
        success = result.success;
        limit = result.limit;
        remaining = result.remaining;
        reset = Math.ceil(result.reset / 1000);
      } catch (error) {
        // Redis failure — fail open (allow the request)
        log.warn("Rate limiter failed — allowing request", {
          tier,
          identifier,
          error: error instanceof Error ? error.message : String(error),
        });
        success = true;
        limit = config.limit;
        remaining = config.limit;
        reset = Math.ceil((Date.now() + config.windowSeconds * 1000) / 1000);
      }
    } else {
      // Use in-memory fallback
      const result = inMemoryRateLimit(identifier, tier);
      success = result.success;
      limit = result.limit;
      remaining = result.remaining;
      reset = result.reset;
    }

    // Set rate limit headers on all responses
    const rateLimitHeaders = {
      "X-RateLimit-Limit": String(limit),
      "X-RateLimit-Remaining": String(remaining),
      "X-RateLimit-Reset": String(reset),
    };

    if (!success) {
      const retryAfter = Math.max(1, reset - Math.ceil(Date.now() / 1000));

      log.warn("Rate limit exceeded", {
        tier,
        identifier,
        limit,
        requestId: ctx.requestId,
      });

      throw new RateLimitError(retryAfter, limit);
    }

    // Execute handler and attach rate limit headers
    const response = await handler(req, ctx);
    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(rateLimitHeaders)) {
      headers.set(key, value);
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}
