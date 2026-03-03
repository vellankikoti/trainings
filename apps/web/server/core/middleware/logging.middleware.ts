/**
 * Request Logging Middleware
 *
 * Logs every request with structured fields:
 * - Assigns a unique request ID (X-Request-Id header)
 * - Records method, path, status, duration
 * - Initializes the RequestContext with timing data
 */

import { NextRequest } from "next/server";
import { logger } from "../observability/logger";
import type { RouteHandler, RequestContext } from "./types";

const log = logger.child({ module: "http" });

let requestCounter = 0;

function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const counter = (requestCounter++).toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `req_${timestamp}_${counter}_${random}`;
}

export function withLogging(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, ctx: RequestContext): Promise<Response> => {
    // Initialize context if not set
    if (!ctx.requestId) {
      ctx.requestId = req.headers.get("x-request-id") || generateRequestId();
    }
    if (!ctx.startTime) {
      ctx.startTime = performance.now();
    }

    const method = req.method;
    const path = new URL(req.url).pathname;

    log.debug("Request started", {
      requestId: ctx.requestId,
      method,
      path,
    });

    const response = await handler(req, ctx);

    const durationMs = Math.round(performance.now() - ctx.startTime);
    const status = response.status;

    // Log at appropriate level based on status code
    const logData = {
      requestId: ctx.requestId,
      method,
      path,
      status,
      durationMs,
      userId: ctx.user?.clerkId,
    };

    if (status >= 500) {
      log.error("Request completed with server error", undefined, logData);
    } else if (status >= 400) {
      log.warn("Request completed with client error", logData);
    } else {
      log.info("Request completed", logData);
    }

    // Attach request ID to response headers for traceability
    const headers = new Headers(response.headers);
    headers.set("X-Request-Id", ctx.requestId);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}
