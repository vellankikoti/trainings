/**
 * Liveness Probe — GET /api/health/live
 *
 * Returns 200 if the process is running.
 * No dependency checks. If this fails, the pod should be restarted.
 * No authentication required.
 */

import { NextResponse } from "next/server";
import { checkLiveness } from "@/server/core/observability/health";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(checkLiveness(), {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}
