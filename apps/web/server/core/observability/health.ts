/**
 * Health Check System
 *
 * Provides Kubernetes-compatible health probes:
 *
 * - Liveness (/api/health/live): Is the process running?
 *   Returns 200 if yes, used by K8s to decide pod restart.
 *   No dependency checks — if this fails, the process is dead.
 *
 * - Readiness (/api/health/ready): Can the service handle requests?
 *   Checks all critical dependencies (database, Redis, auth).
 *   Returns 200 only if all checks pass.
 *   Used by K8s to decide whether to route traffic.
 *
 * Usage:
 *   import { checkLiveness, checkReadiness } from '@/server/core/observability/health';
 *
 *   // In API route:
 *   export async function GET() {
 *     return NextResponse.json(await checkReadiness());
 *   }
 */

import { db } from "../database";
import { cache } from "../cache";
import { logger } from "./logger";

const log = logger.child({ module: "health" });

const startTime = Date.now();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HealthCheckResult {
  status: "ok" | "degraded" | "unhealthy";
  checks: Record<string, ComponentCheck>;
  version: string;
  uptime: number;
  timestamp: string;
}

export interface ComponentCheck {
  status: "ok" | "error";
  latencyMs?: number;
  error?: string;
}

// ---------------------------------------------------------------------------
// Liveness probe
// ---------------------------------------------------------------------------

export function checkLiveness(): { status: "ok"; timestamp: string } {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Readiness probe
// ---------------------------------------------------------------------------

export async function checkReadiness(): Promise<HealthCheckResult> {
  const checks: Record<string, ComponentCheck> = {};

  // -- Database check --
  checks.database = await checkDatabase();

  // -- Redis check --
  checks.redis = await checkRedis();

  // -- Clerk auth check --
  checks.auth = checkAuth();

  // Determine overall status
  const allOk = Object.values(checks).every((c) => c.status === "ok");
  const criticalFailed = checks.database.status === "error";

  let status: HealthCheckResult["status"];
  if (criticalFailed) {
    status = "unhealthy";
  } else if (!allOk) {
    status = "degraded";
  } else {
    status = "ok";
  }

  const result: HealthCheckResult = {
    status,
    checks,
    version: process.env.npm_package_version || "unknown",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
  };

  if (status !== "ok") {
    log.warn("Health check not fully healthy", {
      status,
      failedChecks: Object.entries(checks)
        .filter(([, c]) => c.status === "error")
        .map(([name]) => name),
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// Individual checks
// ---------------------------------------------------------------------------

async function checkDatabase(): Promise<ComponentCheck> {
  const start = performance.now();
  try {
    // Simple query to verify database connectivity
    const { error } = await db.admin
      .from("profiles")
      .select("id")
      .limit(1);

    const latencyMs = Math.round(performance.now() - start);

    if (error) {
      return { status: "error", latencyMs, error: error.message };
    }

    return { status: "ok", latencyMs };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      status: "error",
      latencyMs,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

async function checkRedis(): Promise<ComponentCheck> {
  if (!cache.isConfigured()) {
    return { status: "ok", latencyMs: 0 }; // Redis is optional
  }

  const start = performance.now();
  try {
    const pong = await cache.ping();
    const latencyMs = Math.round(performance.now() - start);

    if (!pong) {
      return { status: "error", latencyMs, error: "Ping failed" };
    }

    return { status: "ok", latencyMs };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      status: "error",
      latencyMs,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

function checkAuth(): ComponentCheck {
  const hasKey = !!process.env.CLERK_SECRET_KEY;
  const hasPublishableKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (hasKey && hasPublishableKey) {
    return { status: "ok" };
  }

  return {
    status: "error",
    error: "Clerk keys not configured",
  };
}
