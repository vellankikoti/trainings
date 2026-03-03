import { redirect } from "next/navigation";
import Link from "next/link";
import { requireRole, AuthError } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Job Postings",
  description: "Manage your organization's job postings.",
};

export default async function OrgJobsPage() {
  let ctx;
  try {
    ctx = await requireRole("recruiter", "org_admin", "admin", "super_admin");
  } catch (e) {
    if (e instanceof AuthError) redirect("/dashboard");
    throw e;
  }

  if (!ctx.orgId) redirect("/organization");

  const supabase = createAdminClient();

  const { data: jobs } = await supabase
    .from("job_postings")
    .select(
      "id, title, company_name, is_active, posted_at, expires_at, required_skills, location_city, location_country, is_remote, employment_type, salary_min, salary_max, salary_currency, job_applications(count)",
    )
    .eq("org_id", ctx.orgId)
    .order("posted_at", { ascending: false });

  const allJobs = jobs ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/organization"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            &larr; Back to Dashboard
          </Link>
          <h1 className="mt-1 text-2xl font-bold">
            Job Postings ({allJobs.length})
          </h1>
        </div>
        <Link
          href="/organization/jobs/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Post Job
        </Link>
      </div>

      {allJobs.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            No job postings yet. Create one to start receiving applications.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {allJobs.map((job) => {
            const appCount =
              (job.job_applications as unknown as { count: number }[])?.[0]
                ?.count ?? 0;
            const isExpired =
              job.expires_at && new Date(job.expires_at) < new Date();

            return (
              <Link
                key={job.id}
                href={`/organization/jobs/${job.id}`}
                className={`group block rounded-lg border p-4 transition-colors hover:border-primary/40 hover:bg-muted/30 ${
                  job.is_active && !isExpired
                    ? "border-border"
                    : "border-border/50 bg-muted/20"
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
                      {isExpired && job.is_active && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          Expired
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {job.company_name}
                      {" · "}
                      {job.is_remote ? "Remote" : job.location_city ?? "—"}
                      {job.location_country &&
                        !job.is_remote &&
                        `, ${job.location_country}`}
                      {job.employment_type &&
                        ` · ${job.employment_type.replace("_", "-")}`}
                    </p>
                    {job.required_skills.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {job.required_skills.slice(0, 5).map((s: string) => (
                          <span
                            key={s}
                            className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs text-primary"
                          >
                            {s}
                          </span>
                        ))}
                        {job.required_skills.length > 5 && (
                          <span className="text-xs text-muted-foreground">
                            +{job.required_skills.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums">
                      {appCount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      application{appCount !== 1 ? "s" : ""}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Posted {new Date(job.posted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
