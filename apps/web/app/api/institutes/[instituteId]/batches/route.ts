import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireRole, AuthError } from "@/lib/auth";
import { batchCreateSchema, validateBody } from "@/lib/validations";

type Params = { params: Promise<{ instituteId: string }> };

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
 * GET /api/institutes/[instituteId]/batches — list batches.
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
    verifyAccess(ctx, instituteId);

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("batches")
      .select(
        "*, batch_enrollments(count)",
      )
      .eq("institute_id", instituteId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const batches = (data ?? []).map((b) => {
      const enrollments = b.batch_enrollments as unknown as
        | { count: number }[]
        | undefined;
      return {
        ...b,
        batch_enrollments: undefined,
        studentCount: enrollments?.[0]?.count ?? 0,
      };
    });

    return NextResponse.json({ batches });
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
 * POST /api/institutes/[instituteId]/batches — create a batch.
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { instituteId } = await params;
    const ctx = await requireRole(
      "trainer",
      "institute_admin",
      "admin",
      "super_admin",
    );
    verifyAccess(ctx, instituteId);

    const body = await request.json();
    const validated = validateBody(batchCreateSchema, body);
    if (validated.error) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("batches")
      .insert({
        institute_id: instituteId,
        name: validated.data.name,
        description: validated.data.description || null,
        assigned_path_slugs: validated.data.assigned_path_slugs,
        start_date: validated.data.start_date || null,
        end_date: validated.data.end_date || null,
        created_by: ctx.profileId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ batch: data }, { status: 201 });
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
