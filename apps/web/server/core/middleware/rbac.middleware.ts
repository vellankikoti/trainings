/**
 * RBAC Middleware
 *
 * Enforces role-based access control on API endpoints.
 * Must be applied AFTER auth middleware (requires ctx.user to be populated).
 *
 * Uses the existing RBAC system from lib/auth/rbac.ts which provides:
 * - Role hierarchy with inheritance
 * - Resource-Action-Scope permission model
 * - Scope hierarchy (own < batch < institute/org < platform)
 *
 * Usage:
 *   export const POST = withAuth(
 *     withRbac({ resource: 'progress', action: 'create', scope: 'own' },
 *       handler
 *     )
 *   );
 */

import { NextRequest } from "next/server";
import { hasPermission } from "@/lib/auth/rbac";
import type { Resource, Action, Scope } from "@/lib/auth/rbac";
import { ForbiddenError, UnauthorizedError } from "../errors";
import { logger } from "../observability/logger";
import type { RouteHandler, RequestContext, RbacConfig } from "./types";

const log = logger.child({ module: "rbac" });

export function withRbac(
  config: RbacConfig,
  handler: RouteHandler
): RouteHandler {
  return async (req: NextRequest, ctx: RequestContext): Promise<Response> => {
    if (!ctx.user) {
      throw new UnauthorizedError("Authentication required for this resource");
    }

    const { resource, action, scope = "own" } = config;
    const { role } = ctx.user;

    if (!hasPermission(role, resource, action, scope)) {
      log.warn("RBAC check failed", {
        requestId: ctx.requestId,
        userId: ctx.user.clerkId,
        role,
        resource,
        action,
        scope,
      });

      throw new ForbiddenError(
        `Insufficient permissions: role '${role}' cannot ${action} ${resource} at scope '${scope}'`
      );
    }

    return handler(req, ctx);
  };
}

/**
 * Check multiple permissions — user must have ALL of them.
 */
export function withRbacAll(
  configs: RbacConfig[],
  handler: RouteHandler
): RouteHandler {
  return async (req: NextRequest, ctx: RequestContext): Promise<Response> => {
    if (!ctx.user) {
      throw new UnauthorizedError("Authentication required for this resource");
    }

    const { role } = ctx.user;

    for (const config of configs) {
      const { resource, action, scope = "own" } = config;

      if (!hasPermission(role, resource, action, scope)) {
        log.warn("RBAC check failed (multi-permission)", {
          requestId: ctx.requestId,
          userId: ctx.user.clerkId,
          role,
          failedOn: { resource, action, scope },
        });

        throw new ForbiddenError(
          `Insufficient permissions: role '${role}' cannot ${action} ${resource} at scope '${scope}'`
        );
      }
    }

    return handler(req, ctx);
  };
}

/**
 * Check multiple permissions — user must have ANY of them.
 */
export function withRbacAny(
  configs: RbacConfig[],
  handler: RouteHandler
): RouteHandler {
  return async (req: NextRequest, ctx: RequestContext): Promise<Response> => {
    if (!ctx.user) {
      throw new UnauthorizedError("Authentication required for this resource");
    }

    const { role } = ctx.user;

    const hasAny = configs.some((config) => {
      const { resource, action, scope = "own" } = config;
      return hasPermission(role, resource, action, scope);
    });

    if (!hasAny) {
      log.warn("RBAC check failed (any-permission)", {
        requestId: ctx.requestId,
        userId: ctx.user.clerkId,
        role,
        requiredAny: configs,
      });

      throw new ForbiddenError("Insufficient permissions for this operation");
    }

    return handler(req, ctx);
  };
}
