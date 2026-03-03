import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireRole, AuthError } from "@/lib/auth";
import { jobPostingUpdateSchema, validateBody } from "@/lib/validations";

type Params = { params: Promise<{ orgId: string; jobId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { orgId, jobId } = await params;
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
    const { data } = await supabase
      .from("job_postings")
      .select("*, job_applications(count)")
      .eq("id", jobId)
      .eq("org_id", orgId)
      .single();

    if (!data) {
      return NextResponse.json(
        { error: "Job not found" },
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

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { orgId, jobId } = await params;
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
    const validated = validateBody(jobPostingUpdateSchema, body);
    if (validated.error) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("job_postings")
      .update(validated.data)
      .eq("id", jobId)
      .eq("org_id", orgId)
      .select("id, title")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
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

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { orgId, jobId } = await params;
    const ctx = await requireRole("org_admin", "admin", "super_admin");

    if (
      ctx.role !== "admin" &&
      ctx.role !== "super_admin" &&
      ctx.orgId !== orgId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createAdminClient();
    // Soft delete — set is_active to false
    await supabase
      .from("job_postings")
      .update({ is_active: false })
      .eq("id", jobId)
      .eq("org_id", orgId);

    return NextResponse.json({ message: "Job deactivated" });
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
