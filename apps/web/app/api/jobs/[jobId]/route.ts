import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAuth, AuthError } from "@/lib/auth";

type Params = { params: Promise<{ jobId: string }> };

/**
 * GET /api/jobs/[jobId] — Get job details (public, authenticated)
 */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { jobId } = await params;
    const ctx = await requireAuth();

    const supabase = createAdminClient();
    const { data: job } = await supabase
      .from("job_postings")
      .select("*")
      .eq("id", jobId)
      .eq("is_active", true)
      .single();

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if user has already applied
    const { count: applicationCount } = await supabase
      .from("job_applications")
      .select("id", { count: "exact", head: true })
      .eq("job_id", jobId)
      .eq("user_id", ctx.profileId);

    return NextResponse.json({
      ...job,
      hasApplied: (applicationCount ?? 0) > 0,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.statusCode },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
