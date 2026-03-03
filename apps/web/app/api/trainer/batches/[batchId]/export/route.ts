import { NextResponse, type NextRequest } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireRole, AuthError } from "@/lib/auth";
import { calculateLevel } from "@/lib/levels";

type Params = {
  params: Promise<{ batchId: string }>;
};

/**
 * GET /api/trainer/batches/[batchId]/export?format=csv
 *
 * Export a CSV report of all students in a batch with their progress data.
 * Requires trainer, institute_admin, admin, or super_admin role.
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { batchId } = await params;
    const ctx = await requireRole(
      "trainer",
      "institute_admin",
      "admin",
      "super_admin",
    );

    // Trainers and institute admins must have an institute
    if (
      (ctx.role === "trainer" || ctx.role === "institute_admin") &&
      !ctx.instituteId
    ) {
      return NextResponse.json(
        { error: "No institute association found" },
        { status: 403 },
      );
    }

    const url = new URL(request.url);
    const format = url.searchParams.get("format") ?? "csv";

    if (format !== "csv") {
      return NextResponse.json(
        { error: "Unsupported format. Only csv is supported." },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    // -----------------------------------------------------------------------
    // 1. Fetch the batch — scope to the trainer's institute unless admin
    // -----------------------------------------------------------------------
    let batchQuery = supabase
      .from("batches")
      .select("id, name, assigned_path_slugs, start_date, end_date")
      .eq("id", batchId);

    if (ctx.role !== "admin" && ctx.role !== "super_admin") {
      batchQuery = batchQuery.eq("institute_id", ctx.instituteId!);
    }

    const { data: batch } = await batchQuery.single();

    if (!batch) {
      return NextResponse.json(
        { error: "Batch not found" },
        { status: 404 },
      );
    }

    // -----------------------------------------------------------------------
    // 2. Fetch enrolled students with profile data
    // -----------------------------------------------------------------------
    const { data: enrollments } = await supabase
      .from("batch_enrollments")
      .select(
        "user_id, enrolled_at, status, profiles!batch_enrollments_user_id_fkey(id, clerk_id, display_name, username, total_xp, current_streak, last_activity_date)",
      )
      .eq("batch_id", batchId)
      .eq("status", "active")
      .order("enrolled_at", { ascending: true });

    const students = enrollments ?? [];
    const studentIds = students.map((s) => s.user_id);

    if (studentIds.length === 0) {
      const csv = "No students enrolled in this batch.";
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="batch-${sanitizeFilename(batch.name)}-report.csv"`,
        },
      });
    }

    // -----------------------------------------------------------------------
    // 3. Fetch lesson completion counts per student
    // -----------------------------------------------------------------------
    const { data: lessonData } = await supabase
      .from("lesson_progress")
      .select("user_id, status")
      .in("user_id", studentIds)
      .eq("status", "completed");

    const lessonsCompletedMap = new Map<string, number>();
    for (const l of lessonData ?? []) {
      lessonsCompletedMap.set(
        l.user_id,
        (lessonsCompletedMap.get(l.user_id) ?? 0) + 1,
      );
    }

    // -----------------------------------------------------------------------
    // 4. Fetch total lesson count across all assigned paths
    //    We count all lesson_progress rows (any status) per student in the
    //    assigned paths to determine total lessons the student has encountered.
    //    We also compute an overall count from path_progress modules_total.
    // -----------------------------------------------------------------------
    const assignedPaths = batch.assigned_path_slugs ?? [];

    const { data: pathProgressData } = await supabase
      .from("path_progress")
      .select("user_id, path_slug, percentage, modules_total, modules_completed")
      .in("user_id", studentIds)
      .in("path_slug", assignedPaths.length > 0 ? assignedPaths : [""]);

    // Build per-student aggregated path progress
    const studentPathProgress = new Map<
      string,
      { sumPercentage: number; pathCount: number }
    >();
    for (const pp of pathProgressData ?? []) {
      const existing = studentPathProgress.get(pp.user_id) ?? {
        sumPercentage: 0,
        pathCount: 0,
      };
      existing.sumPercentage += pp.percentage;
      existing.pathCount += 1;
      studentPathProgress.set(pp.user_id, existing);
    }

    // Count total lessons from lesson_progress for students in assigned paths
    const { data: allLessonRows } = await supabase
      .from("lesson_progress")
      .select("user_id, status, path_slug")
      .in("user_id", studentIds)
      .in("path_slug", assignedPaths.length > 0 ? assignedPaths : [""]);

    const totalLessonsMap = new Map<string, number>();
    for (const lr of allLessonRows ?? []) {
      totalLessonsMap.set(
        lr.user_id,
        (totalLessonsMap.get(lr.user_id) ?? 0) + 1,
      );
    }

    // -----------------------------------------------------------------------
    // 5. Fetch student emails from Clerk (batch lookup by clerk_id)
    // -----------------------------------------------------------------------
    type ProfileData = {
      id: string;
      clerk_id: string;
      display_name: string | null;
      username: string | null;
      total_xp: number;
      current_streak: number;
      last_activity_date: string | null;
    };

    const clerkIdToEmail = new Map<string, string>();

    // Collect all clerk IDs
    const clerkIds: string[] = [];
    for (const s of students) {
      const profile = s.profiles as unknown as ProfileData | null;
      if (profile?.clerk_id) {
        clerkIds.push(profile.clerk_id);
      }
    }

    // Fetch from Clerk in batches of 100 (Clerk API limit)
    if (clerkIds.length > 0) {
      try {
        const client = await clerkClient();
        for (let i = 0; i < clerkIds.length; i += 100) {
          const chunk = clerkIds.slice(i, i + 100);
          const usersResponse = await client.users.getUserList({
            userId: chunk,
            limit: 100,
          });
          for (const user of usersResponse.data) {
            const email =
              user.emailAddresses.find(
                (e) => e.id === user.primaryEmailAddressId,
              )?.emailAddress ??
              user.emailAddresses[0]?.emailAddress ??
              "";
            clerkIdToEmail.set(user.id, email);
          }
        }
      } catch {
        // If Clerk API fails, we still export without emails
      }
    }

    // -----------------------------------------------------------------------
    // 6. Determine student status (active / at-risk / inactive)
    // -----------------------------------------------------------------------
    const now = new Date();

    function getStudentStatus(
      daysSinceActive: number | null,
      lessonsCompleted: number,
      totalXp: number,
    ): string {
      if (daysSinceActive === null) {
        // Never active
        return lessonsCompleted === 0 && totalXp === 0 ? "inactive" : "at-risk";
      }
      if (daysSinceActive >= 7) return "inactive";
      if (daysSinceActive >= 3) return "at-risk";
      return "active";
    }

    // -----------------------------------------------------------------------
    // 7. Build CSV rows
    // -----------------------------------------------------------------------
    const headers = [
      "Student Name",
      "Email",
      "Username",
      "Lessons Completed",
      "Total Lessons",
      "Completion %",
      "Current Streak",
      "Total XP",
      "Level",
      "Level Title",
      "Last Activity",
      "Status",
      "Enrolled At",
    ];

    const rows: string[][] = [];

    for (const enrollment of students) {
      const profile = enrollment.profiles as unknown as ProfileData | null;

      const displayName = profile?.display_name ?? "Unknown";
      const username = profile?.username ?? "";
      const clerkId = profile?.clerk_id ?? "";
      const email = clerkIdToEmail.get(clerkId) ?? "";
      const totalXp = profile?.total_xp ?? 0;
      const currentStreak = profile?.current_streak ?? 0;
      const lastActivityDate = profile?.last_activity_date ?? null;

      const levelObj = calculateLevel(totalXp);
      const lessonsCompleted =
        lessonsCompletedMap.get(enrollment.user_id) ?? 0;
      const totalLessons =
        totalLessonsMap.get(enrollment.user_id) ?? 0;

      // Overall completion: average of assigned path percentages, or 0
      const ppData = studentPathProgress.get(enrollment.user_id);
      const completionPct =
        ppData && ppData.pathCount > 0
          ? Math.round(ppData.sumPercentage / ppData.pathCount)
          : totalLessons > 0
            ? Math.round((lessonsCompleted / totalLessons) * 100)
            : 0;

      let daysSinceActive: number | null = null;
      if (lastActivityDate) {
        daysSinceActive = Math.floor(
          (now.getTime() - new Date(lastActivityDate).getTime()) /
            (1000 * 60 * 60 * 24),
        );
      }

      const status = getStudentStatus(
        daysSinceActive,
        lessonsCompleted,
        totalXp,
      );

      const lastActivity = lastActivityDate
        ? new Date(lastActivityDate).toISOString().split("T")[0]
        : "Never";

      const enrolledAt = enrollment.enrolled_at
        ? enrollment.enrolled_at.split("T")[0]
        : "";

      rows.push([
        displayName,
        email,
        username,
        String(lessonsCompleted),
        String(totalLessons),
        String(completionPct),
        String(currentStreak),
        String(totalXp),
        String(levelObj.level),
        levelObj.title,
        lastActivity,
        status,
        enrolledAt,
      ]);
    }

    // -----------------------------------------------------------------------
    // 8. Serialize to CSV
    // -----------------------------------------------------------------------
    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${cell.replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const filename = `batch-${sanitizeFilename(batch.name)}-report-${now.toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.statusCode },
      );
    }
    console.error("[trainer/batches/export] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Sanitize a string for use in a filename.
 * Replaces non-alphanumeric characters (except hyphens) with hyphens.
 */
function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9-]/gi, "-").replace(/-+/g, "-").toLowerCase();
}
