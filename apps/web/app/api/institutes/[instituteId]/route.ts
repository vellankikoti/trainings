import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireRole, AuthError } from "@/lib/auth";
import { instituteUpdateSchema, validateBody } from "@/lib/validations";

type Params = { params: Promise<{ instituteId: string }> };

/**
 * Verify the caller has access to this specific institute.
 */
async function verifyInstituteAccess(
  ctx: { role: string; instituteId?: string },
  instituteId: string,
) {
  if (ctx.role === "admin" || ctx.role === "super_admin") return;
  if (ctx.instituteId !== instituteId) {
    throw new AuthError("Forbidden: not a member of this institute", 403);
  }
}

/**
 * GET /api/institutes/[instituteId] — get institute details.
 */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { instituteId } = await params;
    const ctx = await requireRole(
      "trainer",
      "institute_admin",
      "admin",
      "super_admin",
    );
    await verifyInstituteAccess(ctx, instituteId);

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("institutes")
      .select("*")
      .eq("id", instituteId)
      .is("deleted_at", null)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Institute not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ institute: data });
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
 * PATCH /api/institutes/[instituteId] — update institute.
 * Only institute_admin or admin/super_admin.
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { instituteId } = await params;
    const ctx = await requireRole(
      "institute_admin",
      "admin",
      "super_admin",
    );
    await verifyInstituteAccess(ctx, instituteId);

    const body = await request.json();
    const validated = validateBody(instituteUpdateSchema, body);
    if (validated.error) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Build safe update object
    const updates: Record<string, unknown> = {};
    const allowed = [
      "name",
      "description",
      "website",
      "location_city",
      "location_country",
      "billing_email",
      "logo_url",
    ] as const;
    for (const key of allowed) {
      if (key in validated.data) {
        updates[key] = validated.data[key] || null;
      }
    }
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("institutes")
      .update(updates)
      .eq("id", instituteId)
      .is("deleted_at", null)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Institute not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ institute: data });
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
