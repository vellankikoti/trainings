import { redirect } from "next/navigation";
import Link from "next/link";
import { requireRole, AuthError } from "@/lib/auth";
import { HiringFunnel } from "./hiring-funnel";

export const metadata = {
  title: "Hiring Analytics",
  description: "Track your hiring funnel and recruitment metrics.",
};

export default async function OrgAnalyticsPage() {
  let ctx;
  try {
    ctx = await requireRole("recruiter", "org_admin", "admin", "super_admin");
  } catch (e) {
    if (e instanceof AuthError) redirect("/dashboard");
    throw e;
  }

  if (!ctx.orgId) redirect("/organization");

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/organization"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back to Dashboard
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Hiring Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your hiring funnel and recruitment performance.
        </p>
      </div>
      <HiringFunnel orgId={ctx.orgId} />
    </div>
  );
}
