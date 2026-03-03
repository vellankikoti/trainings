import { redirect } from "next/navigation";
import { requireRole, AuthError } from "@/lib/auth";
import { JobPostForm } from "./job-post-form";

export const metadata = {
  title: "Post Job",
  description: "Create a new job posting.",
};

export default async function NewJobPage() {
  let ctx;
  try {
    ctx = await requireRole("recruiter", "org_admin", "admin", "super_admin");
  } catch (e) {
    if (e instanceof AuthError) redirect("/dashboard");
    throw e;
  }

  if (!ctx.orgId) redirect("/organization");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Post a Job</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a job posting to attract candidates from the platform.
        </p>
      </div>
      <JobPostForm orgId={ctx.orgId} />
    </div>
  );
}
