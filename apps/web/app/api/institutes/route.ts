import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireRole, AuthError } from "@/lib/auth";
import { instituteCreateSchema, validateBody } from "@/lib/validations";

/**
 * GET /api/institutes — list institutes the user belongs to.
 */
export async function GET() {
  try {
    const ctx = await requireRole(
      "trainer",
      "institute_admin",
      "admin",
      "super_admin",
    );
    const supabase = createAdminClient();

    // Admin/super_admin see all institutes
    if (ctx.role === "admin" || ctx.role === "super_admin") {
      const { data, error } = await supabase
        .from("institutes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return NextResponse.json({ institutes: data ?? [] });
    }

    // Trainers/institute_admins see their own institute
    if (!ctx.instituteId) {
      return NextResponse.json({ institutes: [] });
    }

    const { data, error } = await supabase
      .from("institutes")
      .select("*")
      .eq("id", ctx.instituteId)
      .single();

    if (error) throw error;
    return NextResponse.json({ institutes: data ? [data] : [] });
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

/**
 * POST /api/institutes — create a new institute.
 * Only admin/super_admin can create institutes.
 */
export async function POST(request: Request) {
  try {
    const ctx = await requireRole("admin", "super_admin");
    const body = await request.json();
    const validated = validateBody(instituteCreateSchema, body);
    if (validated.error) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from("institutes")
      .select("id")
      .eq("slug", validated.data.slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "An institute with this slug already exists" },
        { status: 409 },
      );
    }

    const { data, error } = await supabase
      .from("institutes")
      .insert({
        name: validated.data.name,
        slug: validated.data.slug,
        description: validated.data.description || null,
        website: validated.data.website || null,
        location_city: validated.data.location_city || null,
        location_country: validated.data.location_country || null,
        billing_email: validated.data.billing_email || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ institute: data }, { status: 201 });
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
