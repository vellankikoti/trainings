import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getProfileId } from "@/lib/progress";
import { apiErrors } from "@/lib/api-helpers";

type Params = { params: Promise<{ jobId: string }> };

/**
 * GET /api/jobs/[jobId] — Get job details (public, no auth required)
 * If user is logged in, also includes `hasApplied` flag.
 */
export async function GET(_request: Request, { params }: Params) {
  const { jobId } = await params;

  const supabase = createAdminClient();
  const { data: job } = await supabase
    .from("job_postings")
    .select("*")
    .eq("id", jobId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .single();

  if (!job) {
    return apiErrors.notFound("Job");
  }

  // If user is logged in, check if they already applied
  let hasApplied = false;
  try {
    const { userId: clerkId } = await auth();
    if (clerkId) {
      const profileId = await getProfileId(clerkId);
      if (profileId) {
        const { count } = await supabase
          .from("job_applications")
          .select("id", { count: "exact", head: true })
          .eq("job_id", jobId)
          .eq("user_id", profileId);
        hasApplied = (count ?? 0) > 0;
      }
    }
  } catch {
    // Auth check failed — treat as unauthenticated
  }

  return NextResponse.json({
    ...job,
    hasApplied,
  });
}
