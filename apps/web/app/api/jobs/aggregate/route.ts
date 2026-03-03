import { NextResponse, type NextRequest } from "next/server";
import { requireRole, AuthError } from "@/lib/auth";
import { aggregateJobs } from "@/lib/jobs/aggregation";

/**
 * POST /api/jobs/aggregate
 * Triggers job aggregation from external APIs.
 * Admin-only. Can also be called by Vercel Cron with CRON_SECRET.
 */
export async function POST(request: NextRequest) {
  try {
    // Allow cron jobs with secret
    const cronSecret = request.headers.get("authorization");
    if (
      cronSecret &&
      process.env.CRON_SECRET &&
      cronSecret === `Bearer ${process.env.CRON_SECRET}`
    ) {
      const result = await aggregateJobs();
      return NextResponse.json(result);
    }

    // Otherwise require admin role
    await requireRole("admin", "super_admin");

    const body = await request.json().catch(() => ({}));
    const queries = Array.isArray(body.queries)
      ? body.queries.filter((q: unknown) => typeof q === "string")
      : undefined;

    const result = await aggregateJobs(queries);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.statusCode },
      );
    }
    console.error("Aggregation error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
