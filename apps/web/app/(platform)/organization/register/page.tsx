import { redirect } from "next/navigation";
import { requireAuth, AuthError } from "@/lib/auth";
import { OrgRegistrationForm } from "./OrgRegistrationForm";

export const metadata = {
  title: "Register Organization",
  description: "Register your organization on the platform.",
};

export default async function RegisterOrganizationPage() {
  let ctx;
  try {
    ctx = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) redirect("/sign-in");
    throw e;
  }

  // If user already has an org, redirect to org dashboard
  if (ctx.orgId) {
    redirect("/organization");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Register Your Organization</h1>
        <p className="mt-2 text-muted-foreground">
          Set up your company profile to post jobs, search candidates, and manage your hiring pipeline.
        </p>
      </div>
      <OrgRegistrationForm />
    </div>
  );
}
