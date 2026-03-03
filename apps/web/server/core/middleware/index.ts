/**
 * Middleware — public API
 *
 * Usage:
 *   import { createHandler, getParams } from '@/server/core/middleware';
 *
 *   export const POST = createHandler({
 *     auth: true,
 *     rateLimit: 'progress',
 *     schema: mySchema,
 *     handler: async (req, ctx) => { ... },
 *   });
 */

export {
  createHandler,
  getParams,
  withLogging,
  withErrorHandler,
  withRateLimit,
  withAuth,
  withOptionalAuth,
  invalidateProfileCache,
  withRbac,
  withRbacAll,
  withRbacAny,
  withValidation,
  withQueryValidation,
  withIdempotency,
  type RouteHandler,
  type RequestContext,
  type AuthenticatedUser,
  type RateLimitTier,
  type RbacConfig,
  type HandlerConfig,
} from "./pipeline";
