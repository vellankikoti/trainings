/**
 * Application Error Hierarchy
 *
 * All API errors extend AppError. This gives us:
 * - Typed error codes (from ErrorCode enum)
 * - Consistent HTTP status codes
 * - Structured error details
 * - Operational vs programmer error distinction
 *
 * Operational errors (isOperational=true): expected failures like
 * validation errors, not-found, rate limits. Logged at warn level.
 *
 * Programmer errors (isOperational=false): unexpected failures like
 * null pointer, DB connection lost. Logged at error level, may trigger alerts.
 */

import { ErrorCode } from "./error-codes";

// ---------------------------------------------------------------------------
// Base error class
// ---------------------------------------------------------------------------

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details: unknown;
  public readonly isOperational: boolean;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number,
    details?: unknown,
    isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;

    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serialize for API response. Never includes stack trace.
   */
  toJSON(): ErrorResponse {
    const response: ErrorResponse = {
      error: {
        code: this.code,
        message: this.message,
      },
    };

    if (this.details !== undefined) {
      response.error.details = this.details;
    }

    return response;
  }
}

export interface ErrorResponse {
  error: {
    code: ErrorCode | string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

// ---------------------------------------------------------------------------
// HTTP error classes — each maps to a specific status code
// ---------------------------------------------------------------------------

export class BadRequestError extends AppError {
  constructor(message = "Bad request", details?: unknown) {
    super(ErrorCode.BAD_REQUEST, message, 400, details);
  }
}

export class ValidationError extends AppError {
  constructor(
    details: Array<{ field: string; message: string; code?: string }>
  ) {
    super(ErrorCode.VALIDATION_ERROR, "Validation failed", 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(ErrorCode.UNAUTHORIZED, message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Insufficient permissions") {
    super(ErrorCode.FORBIDDEN, message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} '${id}' not found`
      : `${resource} not found`;
    super(ErrorCode.NOT_FOUND, message, 404, { resource, id });
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.CONFLICT) {
    super(code, message, 409);
  }
}

export class GoneError extends AppError {
  constructor(message: string) {
    super(ErrorCode.GONE, message, 410);
  }
}

export class UnprocessableError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.UNPROCESSABLE) {
    super(code, message, 422);
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfter: number;

  constructor(retryAfter: number, limit: number) {
    super(ErrorCode.RATE_LIMITED, "Too many requests", 429, {
      retryAfter,
      limit,
    });
    this.retryAfter = retryAfter;
  }
}

export class InternalError extends AppError {
  constructor(message = "Internal server error") {
    super(ErrorCode.INTERNAL_ERROR, message, 500, undefined, false);
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Database error") {
    super(ErrorCode.DATABASE_ERROR, message, 500, undefined, false);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      message ?? `External service '${service}' unavailable`,
      502,
      { service },
      false
    );
  }
}
