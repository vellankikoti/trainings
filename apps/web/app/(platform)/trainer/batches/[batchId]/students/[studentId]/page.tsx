import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { requireRole, AuthError } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { calculateLevel } from "@/lib/levels";

interface PageProps {
  params: Promise<{ batchId: string; studentId: string }>;
}

export default async function StudentDetailPage({ params }: PageProps) {
  const { batchId, studentId } = await params;

  let ctx;
  try {
    ctx = await requireRole(
      "trainer",
      "institute_admin",
      "admin",
      "super_admin",
    );
  } catch (e) {
    if (e instanceof AuthError) redirect("/dashboard");
    throw e;
  }

  if (!ctx.instituteId) redirect("/trainer");

  const supabase = createAdminClient();

  // Get batch info
  const { data: batch } = await supabase
    .from("batches")
    .select("id, name, assigned_path_slugs")
    .eq("id", batchId)
    .eq("institute_id", ctx.instituteId)
    .single();

  if (!batch) notFound();

  // Verify student is enrolled
  const { data: enrollment } = await supabase
    .from("batch_enrollments")
    .select("id, enrolled_at, status")
    .eq("batch_id", batchId)
    .eq("user_id", studentId)
    .single();

  if (!enrollment) notFound();

  // Fetch student data in parallel
  const assignedPaths = batch.assigned_path_slugs ?? [];
  const [
    { data: profile },
    { data: lessonProgress },
    { data: pathProgress },
    { data: quizAttempts },
    { data: recentActivity },
    { data: skills },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, display_name, username, avatar_url, total_xp, current_level, current_streak, longest_streak, last_activity_date",
      )
      .eq("id", studentId)
      .single(),
    supabase
      .from("lesson_progress")
      .select("lesson_slug, path_slug, module_slug, status, completed_at")
      .eq("user_id", studentId)
      .in("path_slug", assignedPaths.length > 0 ? assignedPaths : [""])
      .order("completed_at", { ascending: false }),
    supabase
      .from("path_progress")
      .select("path_slug, percentage, modules_completed, modules_total")
      .eq("user_id", studentId)
      .in("path_slug", assignedPaths.length > 0 ? assignedPaths : [""]),
    supabase
      .from("quiz_attempts")
      .select("quiz_id, score, passed, xp_earned, attempted_at")
      .eq("user_id", studentId)
      .order("attempted_at", { ascending: false })
      .limit(20),
    supabase
      .from("daily_activity")
      .select("activity_date, xp_earned, lessons_completed, time_spent_seconds")
      .eq("user_id", studentId)
      .order("activity_date", { ascending: false })
      .limit(14),
    supabase
      .from("skill_scores")
      .select("domain, composite_score, theory_score, lab_score, quiz_score")
      .eq("user_id", studentId)
      .order("composite_score", { ascending: false })
      .limit(10),
  ]);

  if (!profile) notFound();

  const levelObj = calculateLevel(profile.total_xp ?? 0);
  const daysSinceActive = profile.last_activity_date
    ? Math.floor(
        (Date.now() - new Date(profile.last_activity_date).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  // Aggregate lesson stats
  const completedLessons =
    lessonProgress?.filter((l) => l.status === "completed").length ?? 0;
  const totalLessonsStarted = lessonProgress?.length ?? 0;

  // Quiz stats
  const totalQuizzes = quizAttempts?.length ?? 0;
  const passedQuizzes = quizAttempts?.filter((q) => q.passed).length ?? 0;
  const avgScore =
    totalQuizzes > 0
      ? Math.round(
          (quizAttempts?.reduce((s, q) => s + q.score, 0) ?? 0) / totalQuizzes,
        )
      : 0;

  // Activity stats for the last 14 days
  const totalRecentXp =
    recentActivity?.reduce((s, a) => s + a.xp_earned, 0) ?? 0;
  const totalRecentLessons =
    recentActivity?.reduce((s, a) => s + a.lessons_completed, 0) ?? 0;
  const activeDays = recentActivity?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/trainer/batches/${batchId}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back to {batch.name}
        </Link>
        <div className="mt-2 flex items-center gap-4">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="h-14 w-14 rounded-full"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              {(profile.display_name ?? "?").charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">
              {profile.display_name ?? "Unknown"}
            </h1>
            {profile.username && (
              <p className="text-sm text-muted-foreground">
                @{profile.username}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <MiniStat label="Level" value={`Lv ${levelObj.level}`} sub={levelObj.title} />
        <MiniStat
          label="Total XP"
          value={profile.total_xp.toLocaleString()}
        />
        <MiniStat label="Streak" value={`${profile.current_streak}d`} sub={`Best: ${profile.longest_streak}d`} />
        <MiniStat
          label="Last Active"
          value={
            daysSinceActive === null
              ? "Never"
              : daysSinceActive === 0
                ? "Today"
                : `${daysSinceActive}d ago`
          }
          alert={daysSinceActive !== null && daysSinceActive >= 3}
        />
        <MiniStat
          label="Enrolled"
          value={new Date(enrollment.enrolled_at).toLocaleDateString()}
        />
      </div>

      {/* Path progress */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Path Progress</h2>
        {(pathProgress ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No progress recorded yet.
          </p>
        ) : (
          <div className="space-y-3">
            {(pathProgress ?? []).map((pp) => (
              <div
                key={pp.path_slug}
                className="rounded-lg border border-border p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{pp.path_slug}</p>
                  <p className="text-sm font-semibold tabular-nums">
                    {pp.percentage}%
                  </p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pp.percentage}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {pp.modules_completed} / {pp.modules_total} modules completed
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Activity (14 days) */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Recent Activity (14 days)
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-border p-4 text-center">
            <p className="text-2xl font-bold tabular-nums">{totalRecentXp}</p>
            <p className="text-xs text-muted-foreground">XP Earned</p>
          </div>
          <div className="rounded-lg border border-border p-4 text-center">
            <p className="text-2xl font-bold tabular-nums">
              {totalRecentLessons}
            </p>
            <p className="text-xs text-muted-foreground">Lessons Completed</p>
          </div>
          <div className="rounded-lg border border-border p-4 text-center">
            <p className="text-2xl font-bold tabular-nums">{activeDays}</p>
            <p className="text-xs text-muted-foreground">Active Days</p>
          </div>
        </div>

        {(recentActivity ?? []).length > 0 && (
          <div className="mt-3 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    XP
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Lessons
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(recentActivity ?? []).map((a) => (
                  <tr key={a.activity_date}>
                    <td className="px-4 py-2 tabular-nums">
                      {new Date(a.activity_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 tabular-nums">{a.xp_earned}</td>
                    <td className="px-4 py-2 tabular-nums">
                      {a.lessons_completed}
                    </td>
                    <td className="px-4 py-2 tabular-nums text-muted-foreground">
                      {Math.round(a.time_spent_seconds / 60)}m
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Lesson Progress */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Lessons ({completedLessons} completed / {totalLessonsStarted} started)
        </h2>
        {totalLessonsStarted === 0 ? (
          <p className="text-sm text-muted-foreground">
            No lessons started yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Path
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Module
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Lesson
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Completed
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(lessonProgress ?? []).slice(0, 30).map((l, i) => (
                  <tr key={`${l.lesson_slug}-${i}`}>
                    <td className="px-4 py-2 text-xs">{l.path_slug}</td>
                    <td className="px-4 py-2 text-xs">{l.module_slug}</td>
                    <td className="px-4 py-2 text-xs font-medium">
                      {l.lesson_slug}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          l.status === "completed"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {l.completed_at
                        ? new Date(l.completed_at).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Quiz Attempts */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Quiz Performance ({passedQuizzes}/{totalQuizzes} passed, avg{" "}
          {avgScore}%)
        </h2>
        {totalQuizzes === 0 ? (
          <p className="text-sm text-muted-foreground">
            No quiz attempts yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Quiz
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Score
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Result
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    XP
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(quizAttempts ?? []).map((q, i) => (
                  <tr key={`${q.quiz_id}-${i}`}>
                    <td className="px-4 py-2 text-xs font-medium">
                      {q.quiz_id}
                    </td>
                    <td className="px-4 py-2 tabular-nums">{q.score}%</td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          q.passed
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {q.passed ? "Passed" : "Failed"}
                      </span>
                    </td>
                    <td className="px-4 py-2 tabular-nums">
                      +{q.xp_earned}
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {new Date(q.attempted_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Skills */}
      {(skills ?? []).length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Top Skills</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {(skills ?? []).map((s) => (
              <div
                key={s.domain}
                className="rounded-lg border border-border p-3 text-center"
              >
                <p className="text-xs font-medium">{s.domain}</p>
                <p className="mt-1 text-lg font-bold tabular-nums">
                  {s.composite_score}
                </p>
                <p className="text-xs text-muted-foreground">
                  T:{s.theory_score} L:{s.lab_score} Q:{s.quiz_score}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Report download */}
      <section className="pt-2">
        <a
          href={`/api/institutes/${ctx.instituteId}/batches/${batchId}/reports?type=student&studentId=${studentId}`}
          download
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Download Student Report (CSV)
        </a>
      </section>
    </div>
  );
}

function MiniStat({
  label,
  value,
  sub,
  alert,
}: {
  label: string;
  value: string;
  sub?: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        alert
          ? "border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20"
          : "border-border bg-card"
      }`}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={`mt-1 text-xl font-bold tabular-nums ${
          alert ? "text-amber-600 dark:text-amber-400" : ""
        }`}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs text-muted-foreground">{sub}</p>
      )}
    </div>
  );
}
