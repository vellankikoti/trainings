import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireRole, AuthError } from "@/lib/auth";

type Params = {
  params: Promise<{ instituteId: string; batchId: string }>;
};

/**
 * GET /api/institutes/[instituteId]/batches/[batchId]/reports?type=batch|student&studentId=...&format=csv
 *
 * Generate CSV reports:
 * - type=batch: Batch summary report (all students)
 * - type=student&studentId=...: Individual student report
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { instituteId, batchId } = await params;
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

    const url = new URL(request.url);
    const reportType = url.searchParams.get("type") ?? "batch";
    const studentId = url.searchParams.get("studentId");

    const supabase = createAdminClient();

    // Verify batch
    const { data: batch } = await supabase
      .from("batches")
      .select("id, name, assigned_path_slugs")
      .eq("id", batchId)
      .eq("institute_id", instituteId)
      .single();

    if (!batch) {
      return NextResponse.json(
        { error: "Batch not found" },
        { status: 404 },
      );
    }

    if (reportType === "student" && studentId) {
      return generateStudentReport(supabase, batch, studentId);
    }

    return generateBatchReport(supabase, batch, batchId);
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

async function generateBatchReport(supabase: any, batch: any, batchId: string) {
  // Get all enrolled students with their progress
  const { data: enrollments } = await supabase
    .from("batch_enrollments")
    .select(
      "user_id, enrolled_at, status, profiles!batch_enrollments_user_id_fkey(display_name, username, total_xp, current_level, current_streak, last_activity_date)",
    )
    .eq("batch_id", batchId)
    .eq("status", "active");

  const studentIds = (enrollments ?? []).map(
    (e: { user_id: string }) => e.user_id,
  );

  // Get path progress for all students
  const assignedPaths = batch.assigned_path_slugs ?? [];
  const { data: pathProgress } = await supabase
    .from("path_progress")
    .select("user_id, path_slug, percentage")
    .in("user_id", studentIds.length > 0 ? studentIds : [""])
    .in("path_slug", assignedPaths.length > 0 ? assignedPaths : [""]);

  // Get lesson counts
  const { data: lessonData } = await supabase
    .from("lesson_progress")
    .select("user_id, status")
    .in("user_id", studentIds.length > 0 ? studentIds : [""])
    .eq("status", "completed");

  const lessonCounts = new Map<string, number>();
  for (const l of lessonData ?? []) {
    lessonCounts.set(l.user_id, (lessonCounts.get(l.user_id) ?? 0) + 1);
  }

  // Build path progress map
  const progressMap = new Map<string, Map<string, number>>();
  for (const pp of pathProgress ?? []) {
    if (!progressMap.has(pp.user_id)) {
      progressMap.set(pp.user_id, new Map());
    }
    progressMap.get(pp.user_id)!.set(pp.path_slug, pp.percentage);
  }

  // Build CSV
  const pathHeaders = assignedPaths.map(
    (p: string) => `${p} (%)`,
  );
  const headers = [
    "Username",
    "Display Name",
    "Level",
    "Total XP",
    "Streak",
    "Lessons Completed",
    ...pathHeaders,
    "Last Active",
    "Enrolled At",
  ];

  const rows = (enrollments ?? []).map(
    (e: {
      user_id: string;
      enrolled_at: string;
      profiles: unknown;
    }) => {
      const profile = e.profiles as {
        display_name: string | null;
        username: string | null;
        total_xp: number;
        current_level: number;
        current_streak: number;
        last_activity_date: string | null;
      } | null;

      const pathPcts = assignedPaths.map((p: string) =>
        String(progressMap.get(e.user_id)?.get(p) ?? 0),
      );

      return [
        profile?.username ?? "",
        profile?.display_name ?? "",
        String(profile?.current_level ?? 1),
        String(profile?.total_xp ?? 0),
        String(profile?.current_streak ?? 0),
        String(lessonCounts.get(e.user_id) ?? 0),
        ...pathPcts,
        profile?.last_activity_date ?? "never",
        e.enrolled_at.split("T")[0],
      ];
    },
  );

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell: string) => `"${cell.replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="batch-${batch.name.replace(/[^a-z0-9]/gi, "-")}-report.csv"`,
    },
  });
}

async function generateStudentReport(supabase: any, batch: any, studentId: string) {
  const assignedPaths = batch.assigned_path_slugs ?? [];

  const [
    { data: profile },
    { data: lessonProgress },
    { data: quizAttempts },
    { data: recentActivity },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "display_name, username, total_xp, current_level, current_streak",
      )
      .eq("id", studentId)
      .single(),
    supabase
      .from("lesson_progress")
      .select(
        "lesson_slug, path_slug, module_slug, status, completed_at, xp_earned",
      )
      .eq("user_id", studentId)
      .in("path_slug", assignedPaths.length > 0 ? assignedPaths : [""])
      .order("completed_at", { ascending: true }),
    supabase
      .from("quiz_attempts")
      .select("quiz_id, score, passed, attempted_at")
      .eq("user_id", studentId)
      .order("attempted_at", { ascending: true }),
    supabase
      .from("daily_activity")
      .select("activity_date, xp_earned, lessons_completed, time_spent_seconds")
      .eq("user_id", studentId)
      .order("activity_date", { ascending: false })
      .limit(30),
  ]);

  // Section 1: Student Info
  const info = [
    ["Student Report"],
    ["Username", profile?.username ?? ""],
    ["Display Name", profile?.display_name ?? ""],
    ["Level", String(profile?.current_level ?? 1)],
    ["Total XP", String(profile?.total_xp ?? 0)],
    ["Current Streak", String(profile?.current_streak ?? 0)],
    [""],
  ];

  // Section 2: Lesson Progress
  const lessonHeaders = [
    "Lesson Progress",
    "",
    "",
    "",
    "",
  ];
  const lessonSubHeaders = [
    "Path",
    "Module",
    "Lesson",
    "Status",
    "Completed At",
  ];
  const lessonRows = (lessonProgress ?? []).map(
    (l: {
      path_slug: string;
      module_slug: string;
      lesson_slug: string;
      status: string;
      completed_at: string | null;
    }) => [
      l.path_slug,
      l.module_slug,
      l.lesson_slug,
      l.status,
      l.completed_at?.split("T")[0] ?? "",
    ],
  );

  // Section 3: Quiz Attempts
  const quizHeaders = ["", "", "", ""];
  const quizTitle = ["Quiz Attempts", "", "", ""];
  const quizSubHeaders = ["Quiz ID", "Score", "Passed", "Date"];
  const quizRows = (quizAttempts ?? []).map(
    (q: {
      quiz_id: string;
      score: number;
      passed: boolean;
      attempted_at: string;
    }) => [
      q.quiz_id,
      String(q.score),
      q.passed ? "Yes" : "No",
      q.attempted_at.split("T")[0],
    ],
  );

  const allRows = [
    ...info,
    lessonHeaders,
    lessonSubHeaders,
    ...lessonRows,
    [""],
    quizTitle,
    quizSubHeaders,
    ...quizRows,
  ];

  const csv = allRows
    .map((row) =>
      row.map((cell: string) => `"${cell.replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");

  const name = profile?.username ?? studentId;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="student-${name}-report.csv"`,
    },
  });
}
