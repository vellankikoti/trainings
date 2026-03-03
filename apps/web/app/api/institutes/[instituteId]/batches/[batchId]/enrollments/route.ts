import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireRole, AuthError } from "@/lib/auth";
import { batchEnrollSchema, validateBody } from "@/lib/validations";

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
 * GET /api/institutes/[instituteId]/batches/[batchId]/enrollments
 * List enrolled students with basic progress.
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

    // Verify batch belongs to institute
    const { data: batch } = await supabase
      .from("batches")
      .select("id")
      .eq("id", batchId)
      .eq("institute_id", instituteId)
      .single();

    if (!batch) {
      return NextResponse.json(
        { error: "Batch not found" },
        { status: 404 },
      );
    }

    const { data, error } = await supabase
      .from("batch_enrollments")
      .select(
        "id, enrolled_at, status, user_id, profiles!batch_enrollments_user_id_fkey(id, display_name, username, avatar_url, total_xp, current_level, current_streak, last_activity_date)",
      )
      .eq("batch_id", batchId)
      .order("enrolled_at", { ascending: true });

    if (error) throw error;

    const enrollments = (data ?? []).map((e) => {
      const profile = e.profiles as unknown as {
        id: string;
        display_name: string | null;
        username: string | null;
        avatar_url: string | null;
        total_xp: number;
        current_level: number;
        current_streak: number;
        last_activity_date: string | null;
      } | null;
      return {
        id: e.id,
        userId: e.user_id,
        enrolledAt: e.enrolled_at,
        status: e.status,
        displayName: profile?.display_name ?? null,
        username: profile?.username ?? null,
        avatarUrl: profile?.avatar_url ?? null,
        totalXp: profile?.total_xp ?? 0,
        currentLevel: profile?.current_level ?? 1,
        currentStreak: profile?.current_streak ?? 0,
        lastActivityDate: profile?.last_activity_date ?? null,
      };
    });

    return NextResponse.json({ enrollments });
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
 * POST /api/institutes/[instituteId]/batches/[batchId]/enrollments
 * Enroll students by username array.
 */
export async function POST(request: NextRequest, { params }: Params) {
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
    const validated = validateBody(batchEnrollSchema, body);
    if (validated.error) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Verify batch belongs to institute
    const { data: batch } = await supabase
      .from("batches")
      .select("id, institute_id")
      .eq("id", batchId)
      .eq("institute_id", instituteId)
      .single();

    if (!batch) {
      return NextResponse.json(
        { error: "Batch not found" },
        { status: 404 },
      );
    }

    // Check institute student limit
    const { data: institute } = await supabase
      .from("institutes")
      .select("max_students")
      .eq("id", instituteId)
      .single();

    const { count: currentTotal } = await supabase
      .from("batch_enrollments")
      .select("id", { count: "exact", head: true })
      .in(
        "batch_id",
        (
          await supabase
            .from("batches")
            .select("id")
            .eq("institute_id", instituteId)
        ).data?.map((b) => b.id) ?? [],
      )
      .eq("status", "active");

    const maxStudents = institute?.max_students ?? 50;
    const remaining = maxStudents - (currentTotal ?? 0);

    if (validated.data.usernames.length > remaining) {
      return NextResponse.json(
        {
          error: `Cannot enroll ${validated.data.usernames.length} students. Only ${remaining} slots remaining (limit: ${maxStudents}).`,
        },
        { status: 400 },
      );
    }

    // Resolve usernames to profile IDs
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username")
      .in("username", validated.data.usernames);

    const foundUsernames = new Set(
      (profiles ?? []).map((p) => p.username),
    );
    const notFound = validated.data.usernames.filter(
      (u: string) => !foundUsernames.has(u),
    );

    // Get already enrolled users
    const profileIds = (profiles ?? []).map((p) => p.id);
    const { data: alreadyEnrolled } = await supabase
      .from("batch_enrollments")
      .select("user_id")
      .eq("batch_id", batchId)
      .in("user_id", profileIds);

    const alreadyEnrolledIds = new Set(
      (alreadyEnrolled ?? []).map((e) => e.user_id),
    );

    // Filter to new enrollments only
    const toEnroll = (profiles ?? []).filter(
      (p) => !alreadyEnrolledIds.has(p.id),
    );

    if (toEnroll.length > 0) {
      const rows = toEnroll.map((p) => ({
        batch_id: batchId,
        user_id: p.id,
        enrolled_by: ctx.profileId,
        status: "active",
      }));

      const { error: enrollError } = await supabase
        .from("batch_enrollments")
        .insert(rows);

      if (enrollError) throw enrollError;
    }

    return NextResponse.json({
      enrolled: toEnroll.length,
      skipped: alreadyEnrolledIds.size,
      notFound,
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

/**
 * DELETE /api/institutes/[instituteId]/batches/[batchId]/enrollments
 * Remove a student from batch. Body: { userId: string }
 */
export async function DELETE(request: NextRequest, { params }: Params) {
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
    const userId = body.userId;
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("batch_enrollments")
      .update({ status: "removed" })
      .eq("batch_id", batchId)
      .eq("user_id", userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
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
