import { redirect, notFound } from "next/navigation";
import { requireRole, AuthError } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { EnrollForm } from "./enroll-form";

interface PageProps {
  params: Promise<{ batchId: string }>;
}

export const metadata = {
  title: "Enroll Students",
  description: "Add students to a batch.",
};

export default async function EnrollStudentsPage({ params }: PageProps) {
  const { batchId } = await params;

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

  const supabase = createAdminClient();
  const { data: batch } = await supabase
    .from("batches")
    .select("id, name")
    .eq("id", batchId)
    .eq("institute_id", ctx.instituteId)
    .single();

  if (!batch) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Enroll Students</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add students to <span className="font-medium">{batch.name}</span> by
          entering their usernames.
        </p>
      </div>
      <EnrollForm batchId={batchId} instituteId={ctx.instituteId} />
    </div>
  );
}
