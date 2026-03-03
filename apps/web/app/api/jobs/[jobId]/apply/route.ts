import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAuth, AuthError } from "@/lib/auth";

type Params = { params: Promise<{ jobId: string }> };

/**
 * POST /api/jobs/[jobId]/apply — Apply to a job
 */
export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { jobId } = await params;
    const ctx = await requireAuth();

    const supabase = createAdminClient();

    // Verify job exists and is active
    const { data: job } = await supabase
      .from("job_postings")
      .select("id, title")
      .eq("id", jobId)
      .eq("is_active", true)
      .single();

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check for duplicate application
    const { count } = await supabase
      .from("job_applications")
      .select("id", { count: "exact", head: true })
      .eq("job_id", jobId)
      .eq("user_id", ctx.profileId);

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        { error: "Already applied to this job" },
        { status: 409 },
      );
    }

    const { data, error } = await supabase
      .from("job_applications")
      .insert({
        user_id: ctx.profileId,
        job_id: jobId,
        status: "applied",
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { id: data.id, message: "Application submitted" },
      { status: 201 },
    );
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
