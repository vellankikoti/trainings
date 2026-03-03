import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireRole, AuthError } from "@/lib/auth";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum([
    "applied",
    "viewed",
    "shortlisted",
    "contacted",
    "rejected",
    "hired",
  ]),
});

type Params = {
  params: Promise<{ orgId: string; jobId: string; applicationId: string }>;
};

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { orgId, jobId, applicationId } = await params;
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

    const body = await request.json();
    const parsed = statusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid status" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    // Verify the job belongs to the org
    const { data: job } = await supabase
      .from("job_postings")
      .select("id")
      .eq("id", jobId)
      .eq("org_id", orgId)
      .single();

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("job_applications")
      .update({
        status: parsed.data.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId)
      .eq("job_id", jobId)
      .select("id, status")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(data);
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
