/**
 * Error Handler Middleware
 *
 * Catches all errors from downstream handlers and converts them to
 * consistent JSON error responses. This is the outermost middleware
 * in the pipeline — it must catch everything.
 *
 * - AppError (operational): return typed error response
 * - ZodError: return 400 with field-level details
 * - Unknown error: log full details, return generic 500
 *
 * NEVER exposes stack traces, SQL queries, or internal details to the client.
 */

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError, type ErrorResponse } from "../errors/app-error";
import { ErrorCode } from "../errors/error-codes";
import { logger } from "../observability/logger";
import type { Middleware, RouteHandler, RequestContext } from "./types";
import { NextRequest } from "next/server";

const log = logger.child({ module: "error-handler" });

export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, ctx: RequestContext): Promise<Response> => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      return handleError(error, ctx);
    }
  };
}

function handleError(error: unknown, ctx: RequestContext): Response {
  // -- AppError: known operational/programmer error --
  if (error instanceof AppError) {
    if (error.isOperational) {
      log.warn(error.message, {
        code: error.code,
        statusCode: error.statusCode,
        requestId: ctx.requestId,
        details: error.details,
      });
    } else {
      log.error("Non-operational error", error, {
        code: error.code,
        requestId: ctx.requestId,
      });
    }

    const response = error.toJSON();
    response.error.requestId = ctx.requestId;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Request-Id": ctx.requestId,
    };

    // Add Retry-After header for rate limit errors
    if (
      error.code === ErrorCode.RATE_LIMITED &&
      error.details &&
      typeof error.details === "object" &&
      "retryAfter" in error.details
    ) {
      headers["Retry-After"] = String(
        (error.details as { retryAfter: number }).retryAfter
      );
    }

    return NextResponse.json(response, {
      status: error.statusCode,
      headers,
    });
  }

  // -- ZodError: validation failure --
  if (error instanceof ZodError) {
    const details = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    }));

    log.warn("Validation error", {
      requestId: ctx.requestId,
      issues: details,
    });

    const response: ErrorResponse = {
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: "Validation failed",
        details,
        requestId: ctx.requestId,
      },
    };

    return NextResponse.json(response, {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": ctx.requestId,
      },
    });
  }

  // -- Unknown error: log everything, return nothing sensitive --
  log.error("Unhandled error", error, {
    requestId: ctx.requestId,
    type: error?.constructor?.name,
  });

  const response: ErrorResponse = {
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: "Internal server error",
      requestId: ctx.requestId,
    },
  };

  return NextResponse.json(response, {
    status: 500,
    headers: {
      "Content-Type": "application/json",
      "X-Request-Id": ctx.requestId,
    },
  });
}

export const withErrorHandlerMiddleware: Middleware = withErrorHandler;
