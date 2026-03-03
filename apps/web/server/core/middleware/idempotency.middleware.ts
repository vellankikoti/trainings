/**
 * Idempotency Middleware
 *
 * Ensures that repeated requests with the same Idempotency-Key header
 * return the same response, preventing double-processing.
 *
 * Implementation:
 * 1. Client sends `Idempotency-Key: <uuid>` header
 * 2. Server checks Redis for cached response
 * 3. If found: return cached response (200, same body)
 * 4. If not found: execute handler, cache response for 24 hours
 * 5. If no header: execute normally (endpoint has natural idempotency)
 *
 * Cache key format: `idempotency:{userId}:{key}`
 * - Scoped per user to prevent cross-user key collisions
 * - 24-hour TTL to prevent unbounded growth
 *
 * Usage:
 *   export const POST = withIdempotency(handler);
 */

import { NextRequest, NextResponse } from "next/server";
import { cache } from "../cache/redis";
import { logger } from "../observability/logger";
import { ConflictError, ErrorCode } from "../errors";
import type { RouteHandler, RequestContext } from "./types";

const log = logger.child({ module: "idempotency" });

const IDEMPOTENCY_TTL_SECONDS = 86400; // 24 hours
const IDEMPOTENCY_HEADER = "idempotency-key";

// ---------------------------------------------------------------------------
// Cached response structure
// ---------------------------------------------------------------------------

interface CachedResponse {
  status: number;
  body: unknown;
  headers: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export function withIdempotency(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, ctx: RequestContext): Promise<Response> => {
    const idempotencyKey = req.headers.get(IDEMPOTENCY_HEADER);

    // No idempotency key — pass through
    if (!idempotencyKey) {
      return handler(req, ctx);
    }

    // Validate key format (must be a reasonable string, max 255 chars)
    if (idempotencyKey.length > 255 || idempotencyKey.length < 1) {
      return NextResponse.json(
        {
          error: {
            code: ErrorCode.BAD_REQUEST,
            message: "Idempotency-Key must be between 1 and 255 characters",
          },
        },
        { status: 400 }
      );
    }

    // Scope key to user to prevent cross-user collisions
    const userId = ctx.user?.clerkId || "anonymous";
    const cacheKey = `idempotency:${userId}:${idempotencyKey}`;

    // Check for cached response
    const cached = await cache.get<CachedResponse>(cacheKey);

    if (cached) {
      log.debug("Idempotency cache hit — returning cached response", {
        requestId: ctx.requestId,
        idempotencyKey,
        cachedStatus: cached.status,
      });

      const headers = new Headers(cached.headers);
      headers.set("X-Idempotency-Replayed", "true");
      headers.set("X-Request-Id", ctx.requestId);

      return NextResponse.json(cached.body, {
        status: cached.status,
        headers,
      });
    }

    // Use a lock key to prevent concurrent processing of the same idempotency key
    const lockKey = `idempotency-lock:${userId}:${idempotencyKey}`;
    const lockAcquired = await acquireLock(lockKey, 30); // 30 second lock TTL

    if (!lockAcquired) {
      // Another request with the same key is currently processing
      throw new ConflictError(
        "A request with this Idempotency-Key is currently being processed",
        ErrorCode.IDEMPOTENCY_CONFLICT
      );
    }

    try {
      // Execute the handler
      const response = await handler(req, ctx);

      // Cache the response
      const responseBody = await response.clone().json().catch(() => null);
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        // Only cache safe headers
        if (
          !key.startsWith("set-cookie") &&
          !key.startsWith("x-idempotency")
        ) {
          responseHeaders[key] = value;
        }
      });

      const cachedResponse: CachedResponse = {
        status: response.status,
        body: responseBody,
        headers: responseHeaders,
      };

      // Only cache successful responses (2xx)
      if (response.status >= 200 && response.status < 300) {
        await cache.set(cacheKey, cachedResponse, IDEMPOTENCY_TTL_SECONDS);
      }

      return response;
    } finally {
      // Release the lock
      await releaseLock(lockKey);
    }
  };
}

// ---------------------------------------------------------------------------
// Simple lock using Redis SET NX EX
// ---------------------------------------------------------------------------

async function acquireLock(
  key: string,
  ttlSeconds: number
): Promise<boolean> {
  if (!cache.isConfigured()) {
    // Without Redis, we can't do distributed locking.
    // Allow the request — rely on database-level idempotency.
    return true;
  }

  const { getRedis } = await import("../cache/redis");
  const redis = getRedis();
  if (!redis) return true;

  try {
    const result = await redis.set(key, "locked", {
      nx: true, // Only set if not exists
      ex: ttlSeconds,
    });
    return result === "OK";
  } catch (error) {
    log.warn("Failed to acquire idempotency lock — allowing request", {
      key,
      error: error instanceof Error ? error.message : String(error),
    });
    return true; // Fail open
  }
}

async function releaseLock(key: string): Promise<void> {
  await cache.del(key);
}
