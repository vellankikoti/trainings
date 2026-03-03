import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireRole, AuthError } from "@/lib/auth";
import { calculateLevel, levelProgress } from "@/lib/levels";

type Params = {
  params: Promise<{
    instituteId: string;
    batchId: string;
    studentId: string;
  }>;
};

/**
 * GET /api/institutes/[instituteId]/batches/[batchId]/students/[studentId]
 *
 * Per-student detailed metrics for trainer monitoring.
 * Returns: profile, progress per assigned path, recent activity, skill scores.
 */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { instituteId, batchId, studentId } = await params;
    const ctx = await requireRole(
      "trainer",
      "institute_admin",
      "admin",
      "super_admin",
    );

    if (
      ctx.role !== "admin" &&
      ctx.role !== "super_admin" &&
      ctx.instituteId !== instituteId
    ) {
      throw new AuthError("Forbidden", 403);
    }

    const supabase = createAdminClient();

    // Verify student is enrolled in this batch
    const { data: enrollment } = await supabase
      .from("batch_enrollments")
      .select("id, enrolled_at, status")
      .eq("batch_id", batchId)
      .eq("user_id", studentId)
      .single();

    if (!enrollment) {
      return NextResponse.json(
        { error: "Student not found in this batch" },
        { status: 404 },
      );
    }

    // Get batch to know assigned paths
    const { data: batch } = await supabase
      .from("batches")
      .select("assigned_path_slugs")
      .eq("id", batchId)
      .single();

    const assignedPaths = batch?.assigned_path_slugs ?? [];

    // Fetch all data in parallel
    const [
      { data: profile },
      { data: pathProgress },
      { data: moduleProgress },
      { data: lessonProgress },
      { data: skillScores },
      { data: recentActivity },
      { data: quizAttempts },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "display_name, username, avatar_url, total_xp, current_level, current_streak, longest_streak, last_activity_date",
        )
        .eq("id", studentId)
        .single(),
      supabase
        .from("path_progress")
        .select("*")
        .eq("user_id", studentId)
        .in("path_slug", assignedPaths.length > 0 ? assignedPaths : [""]),
      supabase
        .from("module_progress")
        .select("*")
        .eq("user_id", studentId)
        .in("path_slug", assignedPaths.length > 0 ? assignedPaths : [""]),
      supabase
        .from("lesson_progress")
        .select("lesson_slug, path_slug, module_slug, status, completed_at")
        .eq("user_id", studentId)
        .in("path_slug", assignedPaths.length > 0 ? assignedPaths : [""]),
      supabase
        .from("skill_scores")
        .select("domain, composite_score, theory_score, lab_score, quiz_score")
        .eq("user_id", studentId)
        .order("composite_score", { ascending: false }),
      supabase
        .from("daily_activity")
        .select("activity_date, xp_earned, lessons_completed, time_spent_seconds")
        .eq("user_id", studentId)
        .order("activity_date", { ascending: false })
        .limit(30),
      supabase
        .from("quiz_attempts")
        .select("quiz_id, score, passed, attempted_at")
        .eq("user_id", studentId)
        .order("attempted_at", { ascending: false })
        .limit(10),
    ]);

    if (!profile) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 },
      );
    }

    const levelObj = calculateLevel(profile.total_xp);
    const lvlProg = levelProgress(profile.total_xp);

    // Compute days since last activity
    const daysSinceActive = profile.last_activity_date
      ? Math.floor(
          (Date.now() - new Date(profile.last_activity_date).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : null;

    return NextResponse.json({
      student: {
        id: studentId,
        displayName: profile.display_name,
        username: profile.username,
        avatarUrl: profile.avatar_url,
        totalXp: profile.total_xp,
        level: levelObj.level,
        levelTitle: levelObj.title,
        levelProgress: lvlProg,
        currentStreak: profile.current_streak,
        longestStreak: profile.longest_streak,
        lastActivityDate: profile.last_activity_date,
        daysSinceActive,
        enrolledAt: enrollment.enrolled_at,
        status: enrollment.status,
      },
      paths: pathProgress ?? [],
      modules: moduleProgress ?? [],
      lessons: lessonProgress ?? [],
      skills: skillScores ?? [],
      recentActivity: recentActivity ?? [],
      quizAttempts: quizAttempts ?? [],
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
