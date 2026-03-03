import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireRole, AuthError } from "@/lib/auth";
import { jobPostingCreateSchema, validateBody } from "@/lib/validations";

type Params = { params: Promise<{ orgId: string }> };

/**
 * GET /api/organizations/[orgId]/jobs — List org's job postings
 * POST /api/organizations/[orgId]/jobs — Create a job posting
 */
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
    const { data } = await supabase
      .from("job_postings")
      .select("*, job_applications(count)")
      .eq("org_id", orgId)
      .order("posted_at", { ascending: false });

    return NextResponse.json(data ?? []);
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

export async function POST(request: NextRequest, { params }: Params) {
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

    const body = await request.json();
    const validated = validateBody(jobPostingCreateSchema, body);
    if (validated.error) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("job_postings")
      .insert({
        org_id: orgId,
        source: "platform",
        title: validated.data.title,
        description: validated.data.description,
        company_name: validated.data.company_name,
        location_city: validated.data.location_city,
        location_country: validated.data.location_country,
        is_remote: validated.data.is_remote ?? false,
        salary_min: validated.data.salary_min,
        salary_max: validated.data.salary_max,
        salary_currency: validated.data.salary_currency ?? "USD",
        required_skills: validated.data.required_skills ?? [],
        experience_years_min: validated.data.experience_years_min,
        experience_years_max: validated.data.experience_years_max,
        employment_type: validated.data.employment_type,
        expires_at: validated.data.expires_at,
      })
      .select("id, title")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
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
