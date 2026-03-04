import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getProfileId } from "@/lib/progress";
import { apiErrors } from "@/lib/api-helpers";

type Params = { params: Promise<{ jobId: string }> };

/**
 * GET /api/jobs/[jobId] — Get job details (authenticated)
 */
export async function GET(_request: Request, { params }: Params) {
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
  const { data: job } = await supabase
    .from("job_postings")
    .select("*")
    .eq("id", jobId)
    .eq("is_active", true)
    .single();

  if (!job) {
    return apiErrors.notFound("Job");
  }

  // Check if user has already applied
  const { count: applicationCount } = await supabase
    .from("job_applications")
    .select("id", { count: "exact", head: true })
    .eq("job_id", jobId)
    .eq("user_id", profileId);

  return NextResponse.json({
    ...job,
    hasApplied: (applicationCount ?? 0) > 0,
  });
}
