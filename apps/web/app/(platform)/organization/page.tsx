import { redirect } from "next/navigation";
import Link from "next/link";
import { requireRole, AuthError } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Organization Dashboard",
  description: "Manage job postings, search candidates, and track your hiring pipeline.",
};

export default async function OrganizationDashboard() {
  let ctx;
  try {
    ctx = await requireRole("recruiter", "org_admin", "admin", "super_admin");
  } catch (e) {
    if (e instanceof AuthError) redirect("/dashboard");
    throw e;
  }

  if (!ctx.orgId) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold">No Organization Assigned</h1>
          <p className="mt-2 text-muted-foreground">
            You are not a member of any organization. Register a new organization or accept an invitation to get started.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/organization/register"
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Register Organization
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg border px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const supabase = createAdminClient();

  const [
    { data: org },
    { data: jobs },
    { data: shortlisted },
    { count: viewsCount },
  ] = await Promise.all([
    supabase
      .from("organizations")
      .select("id, name, slug, plan, profile_views_remaining, contacts_remaining, max_seats, is_verified")
      .eq("id", ctx.orgId)
      .single(),
    supabase
      .from("job_postings")
      .select("id, title, is_active, posted_at, required_skills, location_city, is_remote, employment_type, job_applications(count)")
      .eq("org_id", ctx.orgId)
      .order("posted_at", { ascending: false }),
    supabase
      .from("candidate_interactions")
      .select("id, candidate_id, created_at, profiles!candidate_interactions_candidate_id_fkey(display_name, username)")
      .eq("org_id", ctx.orgId)
      .eq("interaction_type", "shortlisted")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("candidate_interactions")
      .select("id", { count: "exact", head: true })
      .eq("org_id", ctx.orgId)
      .eq("interaction_type", "profile_viewed"),
  ]);

  if (!org) redirect("/dashboard");

  const activeJobs = (jobs ?? []).filter((j) => j.is_active);
  const totalApplications = (jobs ?? []).reduce((sum, j) => {
    const count =
      (j.job_applications as unknown as { count: number }[])?.[0]?.count ?? 0;
    return sum + count;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{org.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organization Dashboard &middot;{" "}
            <span className="capitalize">{org.plan}</span> plan
            {org.is_verified && (
              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Verified
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/organization/members"
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Members
          </Link>
          <Link
            href="/organization/analytics"
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Analytics
          </Link>
          <Link
            href="/organization/billing"
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Billing
          </Link>
          <Link
            href="/organization/candidates"
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Search Candidates
          </Link>
          <Link
            href="/organization/jobs/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Post Job
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Active Postings"
          value={String(activeJobs.length)}
          description={`${totalApplications} total applications`}
        />
        <StatCard
          title="Candidates Viewed"
          value={String(viewsCount ?? 0)}
          description={`${org.profile_views_remaining} views remaining`}
          alert={org.profile_views_remaining <= 5}
        />
        <StatCard
          title="Shortlisted"
          value={String((shortlisted ?? []).length)}
          description="In pipeline"
        />
        <StatCard
          title="Contacts Left"
          value={String(org.contacts_remaining)}
          description={`${org.max_seats} seats on plan`}
          alert={org.contacts_remaining <= 3}
        />
      </div>

      {/* Recent Shortlisted */}
      {(shortlisted ?? []).length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Shortlisted Candidates</h2>
          <div className="space-y-2">
            {(shortlisted ?? []).map((s) => {
              const profile = s.profiles as unknown as {
                display_name: string | null;
                username: string | null;
              } | null;
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {profile?.display_name ?? "Unknown"}
                    </p>
                    {profile?.username && (
                      <p className="text-xs text-muted-foreground">
                        @{profile.username}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Job Postings */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Job Postings ({(jobs ?? []).length})
          </h2>
          <Link
            href="/organization/jobs"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            View All
          </Link>
        </div>
        {(jobs ?? []).length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              No job postings yet. Create one to start receiving applications.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {(jobs ?? []).slice(0, 5).map((job) => {
              const appCount =
                (job.job_applications as unknown as { count: number }[])?.[0]
                  ?.count ?? 0;
              return (
                <Link
                  key={job.id}
                  href={`/organization/jobs/${job.id}`}
                  className={`group block rounded-lg border p-4 transition-colors hover:border-primary/40 hover:bg-muted/30 ${
                    job.is_active ? "border-border" : "border-border/50 bg-muted/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold group-hover:text-primary">
                          {job.title}
                        </h3>
                        {!job.is_active && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            Closed
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {job.is_remote ? "Remote" : job.location_city ?? "—"}
                        {job.employment_type && ` · ${job.employment_type}`}
                        {job.required_skills.length > 0 &&
                          ` · ${job.required_skills.slice(0, 3).join(", ")}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums">
                        {appCount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        applications
                      </p>
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
