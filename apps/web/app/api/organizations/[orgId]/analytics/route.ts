import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireRole, AuthError } from "@/lib/auth";

type Params = { params: Promise<{ orgId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { orgId } = await params;
    const ctx = await requireRole(
      "recruiter",
      "org_admin",
      "admin",
      "super_admin",
    );

    if (
      ctx.role !== "admin" &&
      ctx.role !== "super_admin" &&
      ctx.orgId !== orgId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createAdminClient();

    // Run analytics queries in parallel
    const [
      { data: jobs },
      { data: applicationsByStatus },
      { data: interactionsByType },
      { data: recentApplications },
    ] = await Promise.all([
      // Job posting stats
      supabase
        .from("job_postings")
        .select("id, title, is_active, posted_at, job_applications(count)")
        .eq("org_id", orgId)
        .order("posted_at", { ascending: false }),

      // Application status breakdown
      supabase
        .from("job_applications")
        .select("status, job_postings!inner(org_id)")
        .eq("job_postings.org_id", orgId),

      // Interaction type breakdown
      supabase
        .from("candidate_interactions")
        .select("interaction_type, created_at")
        .eq("org_id", orgId),

      // Recent applications (last 30 days)
      supabase
        .from("job_applications")
        .select(
          "id, status, applied_at, job_postings!inner(org_id, title), profiles!job_applications_user_id_fkey(display_name, username)",
        )
        .eq("job_postings.org_id", orgId)
        .order("applied_at", { ascending: false })
        .limit(20),
    ]);

    // Calculate hiring funnel
    const statusCounts: Record<string, number> = {};
    for (const app of applicationsByStatus ?? []) {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    }

    const funnel = {
      applied: statusCounts["applied"] || 0,
      viewed: statusCounts["viewed"] || 0,
      shortlisted: statusCounts["shortlisted"] || 0,
      contacted: statusCounts["contacted"] || 0,
      hired: statusCounts["hired"] || 0,
      rejected: statusCounts["rejected"] || 0,
      total: (applicationsByStatus ?? []).length,
    };

    // Calculate interaction breakdown
    const interactionCounts: Record<string, number> = {};
    for (const i of interactionsByType ?? []) {
      interactionCounts[i.interaction_type] =
        (interactionCounts[i.interaction_type] || 0) + 1;
    }

    // Job performance
    const jobPerformance = (jobs ?? []).map((j) => ({
      id: j.id,
      title: j.title,
      isActive: j.is_active,
      postedAt: j.posted_at,
      applicationCount:
        (j.job_applications as unknown as { count: number }[])?.[0]?.count ?? 0,
    }));

    // Recent applications formatted
    const recent = (recentApplications ?? []).map((a) => {
      const job = a.job_postings as unknown as {
        org_id: string;
        title: string;
      };
      const profile = a.profiles as unknown as {
        display_name: string | null;
        username: string | null;
      } | null;
      return {
        id: a.id,
        status: a.status,
        appliedAt: a.applied_at,
        jobTitle: job?.title ?? "Unknown",
        candidateName: profile?.display_name ?? "Unknown",
        candidateUsername: profile?.username,
      };
    });

    return NextResponse.json({
      funnel,
      interactions: interactionCounts,
      jobPerformance,
      recentApplications: recent,
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
