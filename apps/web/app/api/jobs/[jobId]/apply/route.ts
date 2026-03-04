import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getProfileId } from "@/lib/progress";
import { apiErrors } from "@/lib/api-helpers";

type Params = { params: Promise<{ jobId: string }> };

/**
 * POST /api/jobs/[jobId]/apply — Apply to a job
 */
export async function POST(_request: Request, { params }: Params) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return apiErrors.unauthorized();
  }

  const { jobId } = await params;
  const profileId = await getProfileId(clerkId);
  if (!profileId) {
    return apiErrors.notFound("Profile");
  }

  const supabase = createAdminClient();

  // Verify job exists and is active
  const { data: job } = await supabase
    .from("job_postings")
    .select("id, title")
    .eq("id", jobId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .single();

  if (!job) {
    return apiErrors.notFound("Job");
  }

  // Check for duplicate application
  const { count } = await supabase
    .from("job_applications")
    .select("id", { count: "exact", head: true })
    .eq("job_id", jobId)
    .eq("user_id", profileId);

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: "Already applied to this job" },
      { status: 409 },
    );
  }

  const { data, error } = await supabase
    .from("job_applications")
    .insert({
      user_id: profileId,
      job_id: jobId,
      status: "applied",
    })
    .select("id")
    .single();

  if (error) {
    return apiErrors.internal();
  }

  return NextResponse.json(
    { id: data.id, message: "Application submitted" },
    { status: 201 },
  );
}
