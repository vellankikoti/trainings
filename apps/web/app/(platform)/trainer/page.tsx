import { redirect } from "next/navigation";
import Link from "next/link";
import { requireRole, AuthError } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { detectAtRiskStudents } from "@/lib/trainer/at-risk";

export const metadata = {
  title: "Trainer Dashboard",
  description: "Monitor students and manage batches.",
};

export default async function TrainerDashboard() {
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

  if (!ctx.instituteId) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">No Institute Assigned</h1>
          <p className="mt-2 text-muted-foreground">
            You are not a member of any institute. Contact an admin to get
            started.
          </p>
        </div>
      </div>
    );
  }

  const supabase = createAdminClient();

  // Fetch institute, batches, and student counts in parallel
  const [
    { data: institute },
    { data: batches },
  ] = await Promise.all([
    supabase
      .from("institutes")
      .select("id, name, slug, plan, max_students")
      .eq("id", ctx.instituteId)
      .single(),
    supabase
      .from("batches")
      .select("id, name, is_active, assigned_path_slugs, start_date, end_date, created_at, batch_enrollments(count)")
      .eq("institute_id", ctx.instituteId)
      .order("created_at", { ascending: false }),
  ]);

  const activeBatches = (batches ?? []).filter((b) => b.is_active);

  // Get total active students across all active batches
  let totalStudents = 0;
  const batchIds = activeBatches.map((b) => b.id);

  if (batchIds.length > 0) {
    const { count } = await supabase
      .from("batch_enrollments")
      .select("id", { count: "exact", head: true })
      .in("batch_id", batchIds)
      .eq("status", "active");
    totalStudents = count ?? 0;
  }

  // Get at-risk students for the first active batch (for quick overview)
  let atRiskCount = 0;
  if (activeBatches.length > 0) {
    const atRisk = await detectAtRiskStudents(activeBatches[0].id);
    atRiskCount = atRisk.filter((s) => s.riskLevel === "high" || s.riskLevel === "medium").length;
  }

  // Compute average completion (across all active batch enrollments)
  let avgCompletion = 0;
  if (batchIds.length > 0) {
    const { data: pathProg } = await supabase
      .from("path_progress")
      .select("user_id, percentage")
      .in(
        "user_id",
        (
          await supabase
            .from("batch_enrollments")
            .select("user_id")
            .in("batch_id", batchIds)
            .eq("status", "active")
        ).data?.map((e) => e.user_id) ?? [],
      );

    if (pathProg && pathProg.length > 0) {
      const sum = pathProg.reduce((a, p) => a + p.percentage, 0);
      avgCompletion = Math.round(sum / pathProg.length);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Trainer Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            {institute?.name ?? "Institute"} &middot;{" "}
            <span className="capitalize">{ctx.role.replace("_", " ")}</span>
          </p>
        </div>
        <Link
          href="/trainer/batches/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          New Batch
        </Link>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Active Students"
          value={String(totalStudents)}
          description="Across all batches"
        />
        <StatCard
          title="Avg. Completion"
          value={`${avgCompletion}%`}
          description="Path progress"
        />
        <StatCard
          title="At Risk"
          value={String(atRiskCount)}
          description="Inactive 3+ days"
          alert={atRiskCount > 0}
        />
        <StatCard
          title="Active Batches"
          value={String(activeBatches.length)}
          description={`of ${(batches ?? []).length} total`}
        />
      </div>

      {/* Batches list */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">Batches</h2>
        {activeBatches.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              No active batches yet. Create one to start enrolling students.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {activeBatches.map((batch) => {
              const enrollCount =
                (batch.batch_enrollments as unknown as { count: number }[])?.[0]
                  ?.count ?? 0;
              return (
                <Link
                  key={batch.id}
                  href={`/trainer/batches/${batch.id}`}
                  className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold group-hover:text-primary">
                        {batch.name}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {batch.assigned_path_slugs?.length ?? 0} path(s)
                        assigned &middot; {enrollCount} student(s)
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      {batch.start_date && (
                        <p>
                          Started{" "}
                          {new Date(batch.start_date).toLocaleDateString()}
                        </p>
                      )}
                      {batch.end_date && (
                        <p>
                          Ends{" "}
                          {new Date(batch.end_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Archived batches */}
      {(batches ?? []).filter((b) => !b.is_active).length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Archived Batches
          </h3>
          <div className="space-y-2">
            {(batches ?? [])
              .filter((b) => !b.is_active)
              .map((batch) => (
                <Link
                  key={batch.id}
                  href={`/trainer/batches/${batch.id}`}
                  className="block rounded-lg border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground transition-colors hover:bg-muted/40"
                >
                  {batch.name}
                </Link>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  alert,
}: {
  title: string;
  value: string;
  description: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border bg-card p-5 ${
        alert
          ? "border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20"
          : "border-border"
      }`}
    >
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p
        className={`mt-2 text-3xl font-bold tabular-nums ${
          alert ? "text-amber-600 dark:text-amber-400" : ""
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
