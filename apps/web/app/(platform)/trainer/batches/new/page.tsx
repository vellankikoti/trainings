import { redirect } from "next/navigation";
import { requireRole, AuthError } from "@/lib/auth";
import { getAllPaths } from "@/lib/content";
import { NewBatchForm } from "./new-batch-form";

export const metadata = {
  title: "Create Batch",
  description: "Create a new student batch.",
};

export default async function NewBatchPage() {
  let ctx;
  try {
    ctx = await requireRole(
      "trainer",
      "institute_admin",
      "admin",
      "super_admin",
    );
  } catch (e) {
    if (e instanceof AuthError) redirect("/dashboard");
    throw e;
  }

  if (!ctx.instituteId) redirect("/trainer");

  const allPaths = getAllPaths();
  const pathOptions = allPaths.map((p) => ({
    slug: p.slug,
    title: p.title,
  }));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create New Batch</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set up a batch to organize and track student progress.
        </p>
      </div>
      <NewBatchForm
        instituteId={ctx.instituteId}
        pathOptions={pathOptions}
      />
    </div>
  );
}
