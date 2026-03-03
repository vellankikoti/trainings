import { redirect } from "next/navigation";
import Link from "next/link";
import { requireRole, AuthError } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Institute Dashboard",
  description: "Manage trainers, batches, and institute analytics.",
};

export default async function InstituteDashboard() {
  let ctx;
  try {
    ctx = await requireRole("institute_admin", "admin", "super_admin");
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
            You are not assigned to any institute. Contact an admin.
          </p>
        </div>
      </div>
    );
  }

  const supabase = createAdminClient();

  const [
    { data: institute },
    { data: members },
    { data: batches },
  ] = await Promise.all([
    supabase
      .from("institutes")
      .select("id, name, slug, plan, max_students, is_active, created_at")
      .eq("id", ctx.instituteId)
      .single(),
    supabase
      .from("institute_members")
      .select(
        "id, role, joined_at, profiles!institute_members_user_id_fkey(id, display_name, username, avatar_url)",
      )
      .eq("institute_id", ctx.instituteId)
      .order("joined_at", { ascending: true }),
    supabase
      .from("batches")
      .select(
        "id, name, is_active, assigned_path_slugs, start_date, end_date, created_at, batch_enrollments(count)",
      )
      .eq("institute_id", ctx.instituteId)
      .order("created_at", { ascending: false }),
  ]);

  if (!institute) redirect("/dashboard");

  const trainers =
    (members ?? []).filter((m) => m.role === "trainer").length;
  const admins =
    (members ?? []).filter((m) => m.role === "institute_admin").length;
  const activeBatches = (batches ?? []).filter((b) => b.is_active);
  const archivedBatches = (batches ?? []).filter((b) => !b.is_active);

  // Total enrolled students
  let totalStudents = 0;
  for (const b of activeBatches) {
    const enrollCount =
      (b.batch_enrollments as unknown as { count: number }[])?.[0]?.count ?? 0;
    totalStudents += enrollCount;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {institute.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Institute Admin Dashboard &middot;{" "}
            <span className="capitalize">{institute.plan}</span> plan
          </p>
        </div>
        <Link
          href="/trainer"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Trainer View
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Trainers"
          value={String(trainers)}
          description={`${admins} admin(s)`}
        />
        <StatCard
          title="Active Batches"
          value={String(activeBatches.length)}
          description={`${archivedBatches.length} archived`}
        />
        <StatCard
          title="Total Students"
          value={String(totalStudents)}
          description={`of ${institute.max_students} max`}
          alert={totalStudents >= institute.max_students * 0.9}
        />
        <StatCard
          title="Plan"
          value={institute.plan.charAt(0).toUpperCase() + institute.plan.slice(1)}
          description={`${institute.max_students} student limit`}
        />
      </div>

      {/* Members */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Members ({(members ?? []).length})
          </h2>
          <Link
            href="/institute/members/invite"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Invite Member
          </Link>
        </div>
        {(members ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No members yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Member
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(members ?? []).map((m) => {
                  const profile = m.profiles as unknown as {
                    id: string;
                    display_name: string | null;
                    username: string | null;
                    avatar_url: string | null;
                  } | null;
                  return (
                    <tr
                      key={m.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {profile?.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt=""
                              className="h-8 w-8 rounded-full"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {(profile?.display_name ?? "?")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium">
                              {profile?.display_name ?? "Unknown"}
                            </p>
                            {profile?.username && (
                              <p className="text-xs text-muted-foreground">
                                @{profile.username}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            m.role === "institute_admin"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          }`}
                        >
                          {m.role === "institute_admin" ? "Admin" : "Trainer"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(m.joined_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Batches */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">
          Batches ({(batches ?? []).length})
        </h2>
        {(batches ?? []).length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No batches created yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(batches ?? []).map((b) => {
              const enrollCount =
                (b.batch_enrollments as unknown as { count: number }[])?.[0]
                  ?.count ?? 0;
              return (
                <Link
                  key={b.id}
                  href={`/trainer/batches/${b.id}`}
                  className={`group block rounded-lg border p-4 transition-colors hover:border-primary/40 hover:bg-muted/30 ${
                    b.is_active ? "border-border bg-card" : "border-border/50 bg-muted/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold group-hover:text-primary">
                          {b.name}
                        </h3>
                        {!b.is_active && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            Archived
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {b.assigned_path_slugs?.length ?? 0} path(s) &middot;{" "}
                        {enrollCount} student(s)
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      {b.start_date && (
                        <p>
                          {new Date(b.start_date).toLocaleDateString()}
                          {b.end_date &&
                            ` — ${new Date(b.end_date).toLocaleDateString()}`}
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
