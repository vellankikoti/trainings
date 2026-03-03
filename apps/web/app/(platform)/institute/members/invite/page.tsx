import { redirect } from "next/navigation";
import { requireRole, AuthError } from "@/lib/auth";
import { InviteMemberForm } from "./invite-form";

export const metadata = {
  title: "Invite Member",
  description: "Add a trainer or admin to your institute.",
};

export default async function InviteMemberPage() {
  let ctx;
  try {
    ctx = await requireRole("institute_admin", "admin", "super_admin");
  } catch (e) {
    if (e instanceof AuthError) redirect("/dashboard");
    throw e;
  }

  if (!ctx.instituteId) redirect("/institute");

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Invite Member</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a trainer or admin to your institute by their username.
        </p>
      </div>
      <InviteMemberForm instituteId={ctx.instituteId} />
    </div>
  );
}
