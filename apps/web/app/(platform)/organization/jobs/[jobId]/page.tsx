import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { requireRole, AuthError } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { ApplicationActions } from "./application-actions";

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export default async function OrgJobDetailPage({ params }: PageProps) {
  const { jobId } = await params;

  let ctx;
  try {
    ctx = await requireRole("recruiter", "org_admin", "admin", "super_admin");
  } catch (e) {
    if (e instanceof AuthError) redirect("/dashboard");
    throw e;
  }

  if (!ctx.orgId) redirect("/organization");

  const supabase = createAdminClient();

  const { data: job } = await supabase
    .from("job_postings")
    .select("*")
    .eq("id", jobId)
    .eq("org_id", ctx.orgId)
    .single();

  if (!job) notFound();

  const { data: applications } = await supabase
    .from("job_applications")
    .select(
      "id, user_id, status, applied_at, updated_at, profiles!job_applications_user_id_fkey(display_name, username, avatar_url, total_xp, current_level)",
    )
    .eq("job_id", jobId)
    .order("applied_at", { ascending: false });

  const apps = (applications ?? []).map((a) => {
    const profile = a.profiles as unknown as {
      display_name: string | null;
      username: string | null;
      avatar_url: string | null;
      total_xp: number;
      current_level: number;
    } | null;
    return {
      id: a.id,
      userId: a.user_id,
      status: a.status,
      appliedAt: a.applied_at,
      displayName: profile?.display_name ?? "Unknown",
      username: profile?.username ?? null,
      avatarUrl: profile?.avatar_url ?? null,
      totalXp: profile?.total_xp ?? 0,
      level: profile?.current_level ?? 1,
    };
  });

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null;
    const fmt = (n: number) =>
      n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
    if (job.salary_min && job.salary_max)
      return `${job.salary_currency} ${fmt(job.salary_min)} - ${fmt(job.salary_max)}`;
    if (job.salary_min) return `${job.salary_currency} ${fmt(job.salary_min)}+`;
    return `Up to ${job.salary_currency} ${fmt(job.salary_max!)}`;
  };

  const salary = formatSalary();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/organization/jobs"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back to Jobs
        </Link>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{job.title}</h1>
              {!job.is_active && (
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  Closed
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {job.company_name}
            </p>
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-wrap gap-2">
          {job.is_remote && (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              Remote
            </span>
          )}
          {job.location_city && (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
              {job.location_city}
              {job.location_country && `, ${job.location_country}`}
            </span>
          )}
          {job.employment_type && (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
              {job.employment_type.replace("_", "-")}
            </span>
          )}
          {salary && (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
              {salary}
            </span>
          )}
          {job.experience_years_min != null && (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
              {job.experience_years_min}
              {job.experience_years_max != null &&
                `-${job.experience_years_max}`}{" "}
              yrs exp
            </span>
          )}
        </div>

        {job.required_skills.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Required Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {job.required_skills.map((s: string) => (
                <span
                  key={s}
                  className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs text-primary"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.description && (
          <div className="mt-4 whitespace-pre-wrap text-sm">
            {job.description}
          </div>
        )}

        <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
          <span>Posted {new Date(job.posted_at).toLocaleDateString()}</span>
          {job.expires_at && (
            <span>
              Expires {new Date(job.expires_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Applications */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">
          Applications ({apps.length})
        </h2>
        {apps.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              No applications yet. Candidates will appear here when they apply.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Candidate
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Level / XP
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Applied
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {apps.map((app) => (
                  <tr
                    key={app.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {app.avatarUrl ? (
                          <img
                            src={app.avatarUrl}
                            alt=""
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {app.displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{app.displayName}</p>
                          {app.username && (
                            <Link
                              href={`/u/${app.username}`}
                              className="text-xs text-primary hover:underline"
                            >
                              @{app.username}
                            </Link>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      Lv {app.level} &middot;{" "}
                      {app.totalXp.toLocaleString()} XP
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <ApplicationActions
                        applicationId={app.id}
                        orgId={ctx.orgId!}
                        jobId={jobId}
                        currentStatus={app.status}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {app.username && (
                        <Link
                          href={`/u/${app.username}`}
                          className="text-xs text-primary hover:underline"
                        >
                          View Profile
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
