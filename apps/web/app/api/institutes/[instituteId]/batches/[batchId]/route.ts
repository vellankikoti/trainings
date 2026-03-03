import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireRole, AuthError } from "@/lib/auth";
import { batchUpdateSchema, validateBody } from "@/lib/validations";

type Params = {
  params: Promise<{ instituteId: string; batchId: string }>;
};

function verifyAccess(
  ctx: { role: string; instituteId?: string },
  instituteId: string,
) {
  if (ctx.role === "admin" || ctx.role === "super_admin") return;
  if (ctx.instituteId !== instituteId) {
    throw new AuthError("Forbidden", 403);
  }
}

/**
 * GET /api/institutes/[instituteId]/batches/[batchId] — get batch details.
 */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { instituteId, batchId } = await params;
    const ctx = await requireRole(
      "trainer",
      "institute_admin",
      "admin",
      "super_admin",
    );
    verifyAccess(ctx, instituteId);

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("batches")
      .select("*")
      .eq("id", batchId)
      .eq("institute_id", instituteId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Batch not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ batch: data });
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
 * PATCH /api/institutes/[instituteId]/batches/[batchId] — update batch.
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { instituteId, batchId } = await params;
    const ctx = await requireRole(
      "trainer",
      "institute_admin",
      "admin",
      "super_admin",
    );
    verifyAccess(ctx, instituteId);

    const body = await request.json();
    const validated = validateBody(batchUpdateSchema, body);
    if (validated.error) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const supabase = createAdminClient();

    const updates: Record<string, unknown> = {};
    const allowed = [
      "name",
      "description",
      "assigned_path_slugs",
      "start_date",
      "end_date",
      "is_active",
    ] as const;
    for (const key of allowed) {
      if (key in validated.data) {
        updates[key] = validated.data[key];
      }
    }
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("batches")
      .update(updates)
      .eq("id", batchId)
      .eq("institute_id", instituteId)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Batch not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ batch: data });
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
 * DELETE /api/institutes/[instituteId]/batches/[batchId] — archive batch.
 * Soft-delete: sets is_active to false.
 */
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { instituteId, batchId } = await params;
    const ctx = await requireRole(
      "institute_admin",
      "admin",
      "super_admin",
    );
    verifyAccess(ctx, instituteId);

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("batches")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", batchId)
      .eq("institute_id", instituteId)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Batch not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ batch: data });
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
