/**
 * Readiness Probe — GET /api/health/ready
 *
 * Returns 200 if the service can handle requests (all critical dependencies reachable).
 * Returns 503 if any critical dependency is unavailable.
 * No authentication required.
 */

import { NextResponse } from "next/server";
import { checkReadiness } from "@/server/core/observability/health";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const result = await checkReadiness();

  const statusCode = result.status === "unhealthy" ? 503 : 200;

  return NextResponse.json(result, {
    status: statusCode,
    headers: { "Cache-Control": "no-store" },
  });
}
