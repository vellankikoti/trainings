import { redirect } from "next/navigation";
import { requireRole, AuthError } from "@/lib/auth/get-auth-context";

export default async function OrganizationDashboard() {
  try {
    const ctx = await requireRole("recruiter", "org_admin", "admin", "super_admin");

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organization Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Search for candidates, manage job postings, and track your hiring pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Active Postings"
            value="—"
            description="Live job listings"
          />
          <DashboardCard
            title="Candidates Viewed"
            value="—"
            description="This month"
          />
          <DashboardCard
            title="Shortlisted"
            value="—"
            description="Candidates in pipeline"
          />
          <DashboardCard
            title="Profile Views Left"
            value="—"
            description="Monthly allowance"
          />
        </div>

        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            Candidate search and job posting features coming soon.
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Role: <code className="rounded bg-muted px-1.5 py-0.5">{ctx.role}</code>
            {ctx.orgId && (
              <> | Organization: <code className="rounded bg-muted px-1.5 py-0.5">{ctx.orgId}</code></>
            )}
          </p>
        </div>
      </div>
    );
  } catch (e) {
    if (e instanceof AuthError) {
      redirect("/dashboard");
    }
    throw e;
  }
}

function DashboardCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
