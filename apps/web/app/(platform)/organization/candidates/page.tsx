import { redirect } from "next/navigation";
import { requireRole, AuthError } from "@/lib/auth";
import { CandidateSearch } from "./candidate-search";

export const metadata = {
  title: "Candidate Search",
  description: "Search and discover candidates by skills and criteria.",
};

export default async function CandidateSearchPage() {
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
        <h1 className="text-2xl font-bold">Candidate Search</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Find candidates by skills, location, and availability.
        </p>
      </div>
      <CandidateSearch orgId={ctx.orgId} />
    </div>
  );
}
