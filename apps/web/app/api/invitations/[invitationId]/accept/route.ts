import { NextResponse, type NextRequest } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAuth, AuthError } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

type Params = { params: Promise<{ invitationId: string }> };

/**
 * POST /api/invitations/[invitationId]/accept — Accept a pending invitation.
 * Verifies email ownership, then uses the atomic accept_invitation() RPC.
 */
export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { invitationId } = await params;
    const ctx = await requireAuth();
    const supabase = createAdminClient();

    // Verify the invitation exists and get its email
    const { data: invitation } = await supabase
      .from("invitations")
      .select("id, email, status")
      .eq("id", invitationId)
      .is("deleted_at", null)
      .single();

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    if (invitation.status !== "pending") {
      return NextResponse.json(
        { error: `Invitation is ${invitation.status}` },
        { status: 409 }
      );
    }

    // Verify the authenticated user's email matches the invitation email
    const user = await currentUser();
    const userEmails = (user?.emailAddresses ?? []).map(
      (e) => e.emailAddress.toLowerCase()
    );

    if (!userEmails.includes(invitation.email.toLowerCase())) {
      return NextResponse.json(
        { error: "This invitation was sent to a different email address" },
        { status: 403 }
      );
    }

    // Call the atomic RPC function
    const { data, error } = await supabase.rpc("accept_invitation", {
      p_invitation_id: invitationId,
      p_user_id: ctx.profileId,
    });

    if (error) {
      const msg = error.message || "";
      if (msg.includes("INVITATION_NOT_FOUND")) {
        return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
      }
      if (msg.includes("INVITATION_NOT_PENDING")) {
        return NextResponse.json({ error: "Invitation is no longer pending" }, { status: 409 });
      }
      if (msg.includes("INVITATION_EXPIRED")) {
        return NextResponse.json({ error: "Invitation has expired" }, { status: 410 });
      }
      if (msg.includes("ALREADY_MEMBER")) {
        return NextResponse.json({ error: "You are already a member" }, { status: 409 });
      }
      return NextResponse.json({ error: "Failed to accept invitation" }, { status: 500 });
    }

    const result = data as unknown as {
      membership_id: string;
      role: string;
      entity_type: string;
      entity_id: string;
      entity_name: string;
    };

    // Log audit
    await logAudit({
      actorId: ctx.profileId,
      actorRole: ctx.role,
      action: "invitation.accepted",
      resourceType: "invitation",
      resourceId: invitationId,
      entityType: result.entity_type,
      entityId: result.entity_id,
      newValues: { role: result.role, membership_id: result.membership_id },
    });

    const redirectTo = result.entity_type === "organization" ? "/organization" : "/institute";

    return NextResponse.json({
      data: {
        invitation_id: invitationId,
        status: "accepted",
        entity_type: result.entity_type,
        entity_id: result.entity_id,
        entity_name: result.entity_name,
        role: result.role,
        redirect_to: redirectTo,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
