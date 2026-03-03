import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireRole, AuthError } from "@/lib/auth";

type Params = {
  params: Promise<{ instituteId: string; batchId: string }>;
};

/**
 * GET /api/institutes/[instituteId]/batches/[batchId]/analytics
 *
 * Aggregate batch analytics — completion rates, XP distribution,
 * at-risk students, activity trends.
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

    if (
      ctx.role !== "admin" &&
      ctx.role !== "super_admin" &&
      ctx.instituteId !== instituteId
    ) {
      throw new AuthError("Forbidden", 403);
    }

    const supabase = createAdminClient();

    // Get batch with assigned paths
    const { data: batch } = await supabase
      .from("batches")
      .select("id, name, assigned_path_slugs, start_date, end_date")
      .eq("id", batchId)
      .eq("institute_id", instituteId)
      .single();

    if (!batch) {
      return NextResponse.json(
        { error: "Batch not found" },
        { status: 404 },
      );
    }

    // Get enrolled students
    const { data: enrollments } = await supabase
      .from("batch_enrollments")
      .select(
        "user_id, status, profiles!batch_enrollments_user_id_fkey(total_xp, current_level, current_streak, last_activity_date)",
      )
      .eq("batch_id", batchId)
      .eq("status", "active");

    const students = enrollments ?? [];
    const studentIds = students.map((s) => s.user_id);
    const totalStudents = studentIds.length;

    if (totalStudents === 0) {
      return NextResponse.json({
        batch: {
          id: batch.id,
          name: batch.name,
          assignedPaths: batch.assigned_path_slugs,
        },
        totalStudents: 0,
        overview: {
          avgXp: 0,
          avgLevel: 0,
          avgStreak: 0,
          activeToday: 0,
          atRiskCount: 0,
        },
        completionRates: [],
        xpDistribution: [],
        atRiskStudents: [],
      });
    }

    const assignedPaths = batch.assigned_path_slugs ?? [];

    // Get path progress for all enrolled students
    const { data: pathProgress } = await supabase
      .from("path_progress")
      .select("user_id, path_slug, percentage")
      .in("user_id", studentIds)
      .in("path_slug", assignedPaths.length > 0 ? assignedPaths : [""]);

    // Compute per-path completion rates
    const pathCompletionMap = new Map<
      string,
      { total: number; completed: number; sumPct: number }
    >();

    for (const pathSlug of assignedPaths) {
      pathCompletionMap.set(pathSlug, {
        total: totalStudents,
        completed: 0,
        sumPct: 0,
      });
    }

    for (const pp of pathProgress ?? []) {
      const entry = pathCompletionMap.get(pp.path_slug);
      if (entry) {
        entry.sumPct += pp.percentage;
        if (pp.percentage === 100) entry.completed++;
      }
    }

    const completionRates = assignedPaths.map((pathSlug) => {
      const entry = pathCompletionMap.get(pathSlug) ?? {
        total: totalStudents,
        completed: 0,
        sumPct: 0,
      };
      return {
        pathSlug,
        avgPercentage: Math.round(entry.sumPct / totalStudents),
        completedCount: entry.completed,
        totalStudents,
      };
    });

    // Compute aggregate stats
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const threeDaysAgo = new Date(
      now.getTime() - 3 * 24 * 60 * 60 * 1000,
    ).toISOString();

    let totalXp = 0;
    let totalLevel = 0;
    let totalStreak = 0;
    let activeToday = 0;
    const atRiskStudents: Array<{
      userId: string;
      daysSinceActive: number;
    }> = [];

    for (const s of students) {
      const profile = s.profiles as unknown as {
        total_xp: number;
        current_level: number;
        current_streak: number;
        last_activity_date: string | null;
      } | null;

      if (!profile) continue;

      totalXp += profile.total_xp;
      totalLevel += profile.current_level;
      totalStreak += profile.current_streak;

      if (profile.last_activity_date) {
        if (profile.last_activity_date.startsWith(todayStr)) {
          activeToday++;
        }
        const daysSince = Math.floor(
          (now.getTime() -
            new Date(profile.last_activity_date).getTime()) /
            (1000 * 60 * 60 * 24),
        );
        if (daysSince >= 3) {
          atRiskStudents.push({
            userId: s.user_id,
            daysSinceActive: daysSince,
          });
        }
      } else {
        // Never active = at risk
        atRiskStudents.push({ userId: s.user_id, daysSinceActive: -1 });
      }
    }

    // XP distribution buckets
    const xpBuckets = [
      { label: "0-500", min: 0, max: 500, count: 0 },
      { label: "500-1500", min: 500, max: 1500, count: 0 },
      { label: "1500-3500", min: 1500, max: 3500, count: 0 },
      { label: "3500-6500", min: 3500, max: 6500, count: 0 },
      { label: "6500+", min: 6500, max: Infinity, count: 0 },
    ];

    for (const s of students) {
      const profile = s.profiles as unknown as {
        total_xp: number;
      } | null;
      const xp = profile?.total_xp ?? 0;
      for (const bucket of xpBuckets) {
        if (xp >= bucket.min && xp < bucket.max) {
          bucket.count++;
          break;
        }
      }
    }

    return NextResponse.json({
      batch: {
        id: batch.id,
        name: batch.name,
        assignedPaths: batch.assigned_path_slugs,
        startDate: batch.start_date,
        endDate: batch.end_date,
      },
      totalStudents,
      overview: {
        avgXp: Math.round(totalXp / totalStudents),
        avgLevel: Math.round((totalLevel / totalStudents) * 10) / 10,
        avgStreak: Math.round((totalStreak / totalStudents) * 10) / 10,
        activeToday,
        atRiskCount: atRiskStudents.length,
      },
      completionRates,
      xpDistribution: xpBuckets.map((b) => ({
        label: b.label,
        count: b.count,
      })),
      atRiskStudents: atRiskStudents.slice(0, 20),
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
