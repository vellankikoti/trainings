import { redirect } from "next/navigation";
import Link from "next/link";
import { requireRole, AuthError } from "@/lib/auth";
import { BillingManager } from "./billing-manager";

export const metadata = {
  title: "Organization Billing",
  description: "Manage your organization's plan and billing.",
};

export default async function OrgBillingPage() {
  let ctx;
  try {
    ctx = await requireRole("org_admin", "admin", "super_admin");
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
        <h1 className="mt-1 text-2xl font-bold">Billing & Plans</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your organization&apos;s subscription and view usage.
        </p>
      </div>
      <BillingManager orgId={ctx.orgId} />
    </div>
  );
}
