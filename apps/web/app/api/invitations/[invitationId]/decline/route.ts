import { NextResponse, type NextRequest } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAuth, AuthError } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

type Params = { params: Promise<{ invitationId: string }> };

/**
 * POST /api/invitations/[invitationId]/decline — Decline a pending invitation.
 * Verifies the authenticated user's email matches the invitation email.
 */
export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { invitationId } = await params;
    const ctx = await requireAuth();
    const supabase = createAdminClient();

    // Fetch the invitation
    const { data: invitation } = await supabase
      .from("invitations")
      .select("id, email, status, entity_type, entity_id")
      .eq("id", invitationId)
      .is("deleted_at", null)
      .single();

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    if (invitation.status !== "pending") {
      return NextResponse.json(
        { error: `Invitation is ${invitation.status}, cannot decline` },
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

    // Update status
    const { error } = await supabase
      .from("invitations")
      .update({ status: "declined", declined_at: new Date().toISOString() })
      .eq("id", invitationId);

    if (error) {
      return NextResponse.json({ error: "Failed to decline invitation" }, { status: 500 });
    }

    await logAudit({
      actorId: ctx.profileId,
      actorRole: ctx.role,
      action: "invitation.declined",
      resourceType: "invitation",
      resourceId: invitationId,
      entityType: invitation.entity_type,
      entityId: invitation.entity_id,
    });

    return NextResponse.json({
      data: { invitation_id: invitationId, status: "declined" },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
