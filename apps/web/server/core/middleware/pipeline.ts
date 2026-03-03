/**
 * Middleware Pipeline Composer
 *
 * Provides a clean API for composing middleware into a Next.js route handler.
 * Handles the common pattern of: logging → error → rate limit → auth → rbac → validation → handler.
 *
 * Usage:
 *
 *   // Full protected route with all middleware:
 *   export const POST = createHandler({
 *     rateLimit: 'progress',
 *     auth: true,
 *     permission: { resource: 'progress', action: 'create', scope: 'own' },
 *     schema: completeLessonSchema,
 *     handler: async (req, ctx) => {
 *       const body = ctx.body as CompleteLessonInput;
 *       // ... business logic
 *       return NextResponse.json({ data: result });
 *     },
 *   });
 *
 *   // Public route with rate limiting only:
 *   export const GET = createHandler({
 *     rateLimit: 'search',
 *     handler: async (req, ctx) => {
 *       return NextResponse.json({ data: results });
 *     },
 *   });
 *
 *   // Manual composition for complex cases:
 *   export const POST = compose(
 *     withLogging,
 *     withErrorHandler,
 *     withRateLimit.bind(null, 'progress'),
 *     withAuth,
 *   )(handler);
 */

import { NextRequest } from "next/server";
import { ZodType } from "zod";
import { withLogging } from "./logging.middleware";
import { withErrorHandler } from "./error.middleware";
import { withRateLimit } from "./rate-limit.middleware";
import { withAuth, withOptionalAuth } from "./auth.middleware";
import { withRbac } from "./rbac.middleware";
import { withValidation, withQueryValidation } from "./validation.middleware";
import { withIdempotency } from "./idempotency.middleware";
import type {
  RouteHandler,
  RequestContext,
  RateLimitTier,
  RbacConfig,
} from "./types";

// ---------------------------------------------------------------------------
// Handler configuration
// ---------------------------------------------------------------------------

export interface HandlerConfig {
  /** The actual request handler */
  handler: RouteHandler;

  /** Rate limit tier (or false to disable) */
  rateLimit?: RateLimitTier | false;

  /** Require authentication (default: false) */
  auth?: boolean | "optional";

  /** RBAC permission check (requires auth: true) */
  permission?: RbacConfig;

  /** Zod schema for request body validation */
  schema?: ZodType;

  /** Zod schema for query parameter validation */
  querySchema?: ZodType;

  /** Enable idempotency key support */
  idempotent?: boolean;
}

// ---------------------------------------------------------------------------
// Handler factory
// ---------------------------------------------------------------------------

/**
 * Create a Next.js route handler with the standard middleware pipeline.
 *
 * Pipeline order (outermost first):
 * 1. Logging (request/response logging, request ID)
 * 2. Error handler (catch all errors, format response)
 * 3. Rate limiting (if configured)
 * 4. Authentication (if configured)
 * 5. RBAC (if configured, requires auth)
 * 6. Idempotency (if configured)
 * 7. Validation (if schema provided)
 * 8. Handler (business logic)
 */
export function createHandler(config: HandlerConfig) {
  let handler: RouteHandler = config.handler;

  // Apply middleware from innermost to outermost

  // 7. Validation (innermost — runs right before handler)
  if (config.schema) {
    handler = withValidation(config.schema, handler);
  }

  if (config.querySchema) {
    handler = withQueryValidation(config.querySchema, handler);
  }

  // 6. Idempotency
  if (config.idempotent) {
    handler = withIdempotency(handler);
  }

  // 5. RBAC
  if (config.permission) {
    handler = withRbac(config.permission, handler);
  }

  // 4. Authentication
  if (config.auth === true) {
    handler = withAuth(handler);
  } else if (config.auth === "optional") {
    handler = withOptionalAuth(handler);
  }

  // 3. Rate limiting
  if (config.rateLimit !== false && config.rateLimit) {
    handler = withRateLimit(config.rateLimit, handler);
  }

  // 2. Error handler
  handler = withErrorHandler(handler);

  // 1. Logging (outermost)
  handler = withLogging(handler);

  // Wrap in a Next.js-compatible function signature.
  // Next.js API routes receive (req, { params }) — we initialize our
  // own RequestContext to pass through the pipeline.
  return async (
    req: NextRequest,
    routeContext?: { params?: Promise<Record<string, string>> }
  ): Promise<Response> => {
    const ctx: RequestContext = {
      requestId: "",
      startTime: 0,
    };

    // Resolve route params (Next.js 15 makes params async)
    if (routeContext?.params) {
      const params = await routeContext.params;
      (ctx as unknown as Record<string, unknown>).params = params;
    }

    return handler(req, ctx);
  };
}

/**
 * Access route params from the context.
 */
export function getParams(ctx: RequestContext): Record<string, string> {
  return ((ctx as unknown as Record<string, unknown>).params as Record<string, string>) || {};
}

// ---------------------------------------------------------------------------
// Re-exports for manual composition
// ---------------------------------------------------------------------------

export { withLogging } from "./logging.middleware";
export { withErrorHandler } from "./error.middleware";
export { withRateLimit } from "./rate-limit.middleware";
export { withAuth, withOptionalAuth, invalidateProfileCache } from "./auth.middleware";
export { withRbac, withRbacAll, withRbacAny } from "./rbac.middleware";
export { withValidation, withQueryValidation } from "./validation.middleware";
export { withIdempotency } from "./idempotency.middleware";

export type {
  RouteHandler,
  RequestContext,
  AuthenticatedUser,
  RateLimitTier,
  RbacConfig,
  ProtectedRouteConfig,
  Middleware,
} from "./types";
