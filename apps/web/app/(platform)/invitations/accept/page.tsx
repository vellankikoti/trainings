import { redirect } from "next/navigation";
import { requireAuth, AuthError } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { createHash } from "crypto";
import { InvitationAction } from "./InvitationAction";

export const metadata = {
  title: "Accept Invitation",
  description: "Accept or decline an invitation to join an organization or institute.",
};

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function AcceptInvitationPage({ searchParams }: Props) {
  let ctx;
  try {
    ctx = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) redirect("/sign-in");
    throw e;
  }

  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Invalid Invitation Link</h1>
          <p className="mt-2 text-muted-foreground">
            This invitation link is missing or invalid. Please check your email for the correct link.
          </p>
        </div>
      </div>
    );
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const supabase = createAdminClient();

  const { data: invitation } = await supabase
    .from("invitations")
    .select("id, email, entity_type, entity_id, role, status, expires_at, invited_by")
    .eq("token_hash", tokenHash)
    .is("deleted_at", null)
    .single();

  if (!invitation) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Invitation Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            This invitation may have been revoked or already used.
          </p>
        </div>
      </div>
    );
  }

  if (invitation.status !== "pending") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Invitation {invitation.status === "accepted" ? "Already Accepted" : invitation.status === "expired" ? "Expired" : "Unavailable"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {invitation.status === "accepted"
              ? "This invitation has already been accepted."
              : invitation.status === "expired"
                ? "This invitation has expired. Please ask the sender for a new one."
                : `This invitation is ${invitation.status}.`}
          </p>
        </div>
      </div>
    );
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Invitation Expired</h1>
          <p className="mt-2 text-muted-foreground">
            This invitation has expired. Please ask the sender for a new one.
          </p>
        </div>
      </div>
    );
  }

  // Fetch entity name
  const entityTable = invitation.entity_type === "organization" ? "organizations" : "institutes";
  const { data: entity } = await supabase
    .from(entityTable)
    .select("name")
    .eq("id", invitation.entity_id)
    .single();

  // Fetch inviter name
  const { data: inviter } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", invitation.invited_by)
    .single();

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-lg border p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">You&apos;re Invited!</h1>
          <p className="mt-2 text-muted-foreground">
            {inviter?.display_name ?? "Someone"} has invited you to join{" "}
            <span className="font-semibold text-foreground">{entity?.name ?? "an organization"}</span>{" "}
            as a <span className="font-semibold text-foreground">{invitation.role.replace("_", " ")}</span>.
          </p>
        </div>

        <div className="space-y-2 rounded-lg bg-muted/30 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Entity</span>
            <span className="font-medium">{entity?.name ?? invitation.entity_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type</span>
            <span className="capitalize font-medium">{invitation.entity_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Role</span>
            <span className="capitalize font-medium">{invitation.role.replace("_", " ")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Expires</span>
            <span className="font-medium">{new Date(invitation.expires_at).toLocaleDateString()}</span>
          </div>
        </div>

        <InvitationAction invitationId={invitation.id} entityType={invitation.entity_type} />
      </div>
    </div>
  );
}
