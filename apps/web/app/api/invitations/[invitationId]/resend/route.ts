import { NextResponse, type NextRequest } from "next/server";
import { randomBytes, createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAuth, AuthError } from "@/lib/auth";

type Params = { params: Promise<{ invitationId: string }> };

/**
 * POST /api/invitations/[invitationId]/resend — Resend invitation email and extend expiry.
 */
export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { invitationId } = await params;
    const ctx = await requireAuth();
    const supabase = createAdminClient();

    const { data: invitation } = await supabase
      .from("invitations")
      .select("id, status, invited_by, resend_count, last_resent_at, entity_type, entity_id")
      .eq("id", invitationId)
      .is("deleted_at", null)
      .single();

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    if (invitation.status !== "pending") {
      return NextResponse.json(
        { error: `Invitation is ${invitation.status}, cannot resend` },
        { status: 409 }
      );
    }

    // Verify caller is the inviter or admin
    if (
      invitation.invited_by !== ctx.profileId &&
      ctx.role !== "admin" &&
      ctx.role !== "super_admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (invitation.resend_count >= 3) {
      return NextResponse.json(
        { error: "Maximum resend limit reached (3)" },
        { status: 422 }
      );
    }

    // Cooldown: 1 hour between resends
    if (invitation.last_resent_at) {
      const lastResent = new Date(invitation.last_resent_at).getTime();
      const oneHour = 60 * 60 * 1000;
      if (Date.now() - lastResent < oneHour) {
        return NextResponse.json(
          { error: "Please wait at least 1 hour between resends" },
          { status: 429 }
        );
      }
    }

    // Generate new token
    const newToken = randomBytes(32).toString("hex");
    const newTokenHash = createHash("sha256").update(newToken).digest("hex");

    const { data: updated, error } = await supabase
      .from("invitations")
      .update({
        token_hash: newTokenHash,
        resend_count: invitation.resend_count + 1,
        last_resent_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq("id", invitationId)
      .select("id, expires_at, resend_count")
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to resend invitation" }, { status: 500 });
    }

    // TODO: Send new email via Resend with newToken

    return NextResponse.json({
      data: {
        invitation_id: updated!.id,
        expires_at: updated!.expires_at,
        resend_count: updated!.resend_count,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

