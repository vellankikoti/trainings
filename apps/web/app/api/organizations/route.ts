import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireRole, AuthError } from "@/lib/auth";
import { orgCreateSchema, validateBody } from "@/lib/validations";

/**
 * GET /api/organizations — List organizations
 * POST /api/organizations — Create organization (admin/super_admin only)
 */
export async function GET() {
  try {
    const ctx = await requireRole(
      "recruiter",
      "org_admin",
      "admin",
      "super_admin",
    );

    const supabase = createAdminClient();

    if (ctx.role === "admin" || ctx.role === "super_admin") {
      const { data } = await supabase
        .from("organizations")
        .select("*")
        .order("created_at", { ascending: false });
      return NextResponse.json(data ?? []);
    }

    if (!ctx.orgId) {
      return NextResponse.json([]);
    }

    const { data } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", ctx.orgId);
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

export async function POST(request: NextRequest) {
  try {
    await requireRole("admin", "super_admin");

    const body = await request.json();
    const validated = validateBody(orgCreateSchema, body);
    if (validated.error) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check slug uniqueness
    const { count } = await supabase
      .from("organizations")
      .select("id", { count: "exact", head: true })
      .eq("slug", validated.data.slug);

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        { error: "Organization slug already taken" },
        { status: 409 },
      );
    }

    const { data, error } = await supabase
      .from("organizations")
      .insert({
        name: validated.data.name,
        slug: validated.data.slug,
        description: validated.data.description,
        website: validated.data.website || null,
        tech_stack: validated.data.tech_stack ?? [],
        company_size: validated.data.company_size,
        location_city: validated.data.location_city,
        location_country: validated.data.location_country,
        billing_email: validated.data.billing_email,
      })
      .select("id, name, slug")
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
