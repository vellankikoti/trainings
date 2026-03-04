/**
 * Standardized API Response & Logging Helpers
 *
 * Bridges the existing API routes to the enterprise error format defined in
 * `server/core/errors/app-error.ts`. Routes can adopt these helpers incrementally
 * without a full migration to `createHandler()`.
 *
 * Error format:  { error: { code, message, details?, requestId? } }
 * Success format: data as-is (unchanged from current behavior)
 */

import { NextResponse } from "next/server";
import { type ErrorCode } from "@/server/core/errors/error-codes";

// ---------------------------------------------------------------------------
// Request ID
// ---------------------------------------------------------------------------

/** Generate a lightweight request ID for tracing. */
export function requestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Standardized error responses
// ---------------------------------------------------------------------------

interface ApiErrorOptions {
  code?: ErrorCode | string;
  message: string;
  status: number;
  details?: unknown;
  reqId?: string;
}

/**
 * Return a standardized JSON error response.
 *
 * ```ts
 * return apiError({ code: "UNAUTHORIZED", message: "Authentication required", status: 401 });
 * ```
 */
export function apiError(opts: ApiErrorOptions): NextResponse {
  const body: Record<string, unknown> = {
    error: {
      code: opts.code ?? httpStatusToCode(opts.status),
      message: opts.message,
      ...(opts.details !== undefined ? { details: opts.details } : {}),
      ...(opts.reqId ? { requestId: opts.reqId } : {}),
    },
  };

  const headers: Record<string, string> = {};
  if (opts.reqId) headers["X-Request-Id"] = opts.reqId;

  return NextResponse.json(body, { status: opts.status, headers });
}

/** Convenience shortcuts */
export const apiErrors = {
  unauthorized: (reqId?: string) =>
    apiError({ code: "UNAUTHORIZED", message: "Authentication required", status: 401, reqId }),
  forbidden: (reqId?: string) =>
    apiError({ code: "FORBIDDEN", message: "Insufficient permissions", status: 403, reqId }),
  notFound: (resource: string, reqId?: string) =>
    apiError({ code: "NOT_FOUND", message: `${resource} not found`, status: 404, reqId }),
  badRequest: (message: string, details?: unknown, reqId?: string) =>
    apiError({ code: "BAD_REQUEST", message, status: 400, details, reqId }),
  validation: (details: Array<{ field: string; message: string }>, reqId?: string) =>
    apiError({ code: "VALIDATION_ERROR", message: "Validation failed", status: 400, details, reqId }),
  internal: (reqId?: string) =>
    apiError({ code: "INTERNAL_ERROR", message: "Internal server error", status: 500, reqId }),
};

// ---------------------------------------------------------------------------
// Request logging wrapper
// ---------------------------------------------------------------------------

type RouteHandlerFn = (
  request: Request,
  context?: unknown,
) => Promise<NextResponse | Response>;

/**
 * Wraps an API route handler with:
 * - Request ID generation
 * - Start/end timing log
 * - Uncaught error → standard 500 response (never exposes stack traces)
 *
 * ```ts
 * export const GET = withLogging(async (request) => {
 *   // ... handler code
 * });
 * ```
 */
export function withLogging(handler: RouteHandlerFn): RouteHandlerFn {
  return async (request: Request, context?: unknown) => {
    const reqId = requestId();
    const start = Date.now();
    const method = request.method;
    const url = new URL(request.url).pathname;

    try {
      const response = await handler(request, context);
      const duration = Date.now() - start;

      // Clone headers and inject requestId
      const res = response instanceof NextResponse ? response : NextResponse.json(null, { status: response.status });
      res.headers.set("X-Request-Id", reqId);

      // Log at info level — keep it compact for serverless
      console.info(
        JSON.stringify({
          level: "info",
          msg: "api_request",
          method,
          path: url,
          status: response.status,
          duration_ms: duration,
          requestId: reqId,
        }),
      );

      return res;
    } catch (error) {
      const duration = Date.now() - start;

      console.error(
        JSON.stringify({
          level: "error",
          msg: "api_unhandled_error",
          method,
          path: url,
          duration_ms: duration,
          requestId: reqId,
          error: error instanceof Error ? error.message : "Unknown error",
        }),
      );

      return apiError({
        code: "INTERNAL_ERROR",
        message: "Internal server error",
        status: 500,
        reqId,
      });
    }
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function httpStatusToCode(status: number): string {
  switch (status) {
    case 400: return "BAD_REQUEST";
    case 401: return "UNAUTHORIZED";
    case 403: return "FORBIDDEN";
    case 404: return "NOT_FOUND";
    case 409: return "CONFLICT";
    case 422: return "UNPROCESSABLE";
    case 429: return "RATE_LIMITED";
    default: return status >= 500 ? "INTERNAL_ERROR" : "BAD_REQUEST";
  }
}
