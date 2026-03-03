import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { requireRole, AuthError } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { detectAtRiskStudents } from "@/lib/trainer/at-risk";
import { calculateLevel } from "@/lib/levels";
import { BatchActions } from "./batch-actions";

interface PageProps {
  params: Promise<{ batchId: string }>;
}

export default async function BatchDetailPage({ params }: PageProps) {
  const { batchId } = await params;

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

  // Get batch
  const { data: batch } = await supabase
    .from("batches")
    .select("*")
    .eq("id", batchId)
    .eq("institute_id", ctx.instituteId)
    .single();

  if (!batch) notFound();

  // Get enrolled students with profiles
  const { data: enrollments } = await supabase
    .from("batch_enrollments")
    .select(
      "id, user_id, enrolled_at, status, profiles!batch_enrollments_user_id_fkey(id, display_name, username, avatar_url, total_xp, current_level, current_streak, last_activity_date)",
    )
    .eq("batch_id", batchId)
    .eq("status", "active")
    .order("enrolled_at", { ascending: true });

  const students = (enrollments ?? []).map((e) => {
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

    const levelObj = calculateLevel(profile?.total_xp ?? 0);
    const daysSinceActive = profile?.last_activity_date
      ? Math.floor(
          (Date.now() - new Date(profile.last_activity_date).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : null;

    return {
      enrollmentId: e.id,
      userId: e.user_id,
      displayName: profile?.display_name ?? "Unknown",
      username: profile?.username ?? null,
      avatarUrl: profile?.avatar_url ?? null,
      totalXp: profile?.total_xp ?? 0,
      level: levelObj.level,
      levelTitle: levelObj.title,
      currentStreak: profile?.current_streak ?? 0,
      daysSinceActive,
      enrolledAt: e.enrolled_at,
    };
  });

  // Get at-risk data
  const atRiskStudents = await detectAtRiskStudents(batchId);
  const atRiskMap = new Map(
    atRiskStudents.map((s) => [s.userId, s]),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/trainer"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            &larr; Back to Dashboard
          </Link>
          <h1 className="mt-1 text-2xl font-bold">{batch.name}</h1>
          {batch.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {batch.description}
            </p>
          )}
          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
            <span>
              {batch.assigned_path_slugs?.length ?? 0} path(s) assigned
            </span>
            <span>{students.length} student(s)</span>
            {batch.start_date && (
              <span>
                Started {new Date(batch.start_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/trainer/batches/${batchId}/students/enroll`}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Add Students
          </Link>
          <BatchActions
            batchId={batchId}
            instituteId={ctx.instituteId}
            isActive={batch.is_active}
          />
        </div>
      </div>

      {/* At-risk alerts */}
      {atRiskStudents.filter((s) => s.riskLevel === "high").length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-50 p-4 dark:bg-amber-950/20">
          <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            At-Risk Students ({atRiskStudents.filter((s) => s.riskLevel === "high").length})
          </h3>
          <div className="mt-2 space-y-1">
            {atRiskStudents
              .filter((s) => s.riskLevel === "high")
              .slice(0, 5)
              .map((s) => (
                <Link
                  key={s.userId}
                  href={`/trainer/batches/${batchId}/students/${s.userId}`}
                  className="block text-sm text-amber-700 hover:underline dark:text-amber-400"
                >
                  {s.displayName || s.username} &mdash;{" "}
                  {s.reasons.join(", ")}
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* Student grid */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">
          Students ({students.length})
        </h2>
        {students.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              No students enrolled yet. Add students to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Level
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    XP
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Streak
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Last Active
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((student) => {
                  const risk = atRiskMap.get(student.userId);
                  return (
                    <tr
                      key={student.userId}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/trainer/batches/${batchId}/students/${student.userId}`}
                          className="flex items-center gap-3 hover:text-primary"
                        >
                          {student.avatarUrl ? (
                            <img
                              src={student.avatarUrl}
                              alt=""
                              className="h-8 w-8 rounded-full"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {student.displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium">
                              {student.displayName}
                            </p>
                            {student.username && (
                              <p className="text-xs text-muted-foreground">
                                @{student.username}
                              </p>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        Lv {student.level}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {student.totalXp.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {student.currentStreak}d
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {student.daysSinceActive === null
                          ? "Never"
                          : student.daysSinceActive === 0
                            ? "Today"
                            : `${student.daysSinceActive}d ago`}
                      </td>
                      <td className="px-4 py-3">
                        {risk ? (
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              risk.riskLevel === "high"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : risk.riskLevel === "medium"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            }`}
                          >
                            {risk.riskLevel}
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            on track
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Report download */}
      <section className="flex gap-3">
        <a
          href={`/api/institutes/${ctx.instituteId}/batches/${batchId}/reports?type=batch`}
          download
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Download Batch Report (CSV)
        </a>
      </section>
    </div>
  );
}
