import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Health check endpoint for uptime monitoring and load balancers.
 * No authentication required.
 *
 * GET /api/health → 200 (healthy) or 503 (unhealthy)
 */
export async function GET() {
  const start = Date.now();

  const checks: Record<string, string> = {
    database: "unknown",
    auth: "unknown",
  };

  let healthy = true;

  // Check database connectivity
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("profiles").select("id").limit(1);

    if (error) {
      checks.database = "error";
      healthy = false;
    } else {
      checks.database = "connected";
    }
  } catch {
    checks.database = "unreachable";
    healthy = false;
  }

  // Check auth configuration
  checks.auth = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    ? "configured"
    : "missing";

  if (checks.auth !== "configured") {
    healthy = false;
  }

  const responseTime = Date.now() - start;

  const body = {
    status: healthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    responseTime: `${responseTime}ms`,
    checks,
  };

  return NextResponse.json(body, {
    status: healthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
