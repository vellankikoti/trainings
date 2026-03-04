import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireRole, AuthError } from "@/lib/auth";
import { rejectionSchema, validateBody } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

type Params = { params: Promise<{ approvalId: string }> };

/**
 * POST /api/admin/approvals/[approvalId]/reject — Reject a pending registration.
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { approvalId } = await params;
    const ctx = await requireRole("admin", "super_admin");
    const body = await request.json().catch(() => ({}));
    const validated = validateBody(rejectionSchema, body);

    if (validated.error) {
      return NextResponse.json({ error: validated.error }, { status: 422 });
    }

    const supabase = createAdminClient();

    const { data: approval } = await supabase
      .from("approval_requests")
      .select("id, entity_type, entity_id, status, requested_by")
      .eq("id", approvalId)
      .is("deleted_at", null)
      .single();

    if (!approval) {
      return NextResponse.json({ error: "Approval request not found" }, { status: 404 });
    }

    if (approval.status !== "pending_review") {
      return NextResponse.json(
        { error: `Request is already ${approval.status}` },
        { status: 409 }
      );
    }

    // Update approval request
    await supabase
      .from("approval_requests")
      .update({
        status: "rejected",
        reviewed_by: ctx.profileId,
        reviewed_at: new Date().toISOString(),
        review_notes: validated.data.reason,
      })
      .eq("id", approvalId);

    // Mark the entity as rejected (only if not soft-deleted)
    const entityTable = approval.entity_type === "organization" ? "organizations" : "institutes";
    await supabase
      .from(entityTable)
      .update({ status: "rejected" })
      .eq("id", approval.entity_id)
      .is("deleted_at", null);

    await logAudit({
      actorId: ctx.profileId,
      actorRole: ctx.role,
      action: `${approval.entity_type}.rejected`,
      resourceType: approval.entity_type,
      resourceId: approval.entity_id,
      entityType: approval.entity_type,
      entityId: approval.entity_id,
      metadata: { approval_id: approvalId, reason: validated.data.reason },
    });

    // TODO: Send rejection email to the requester with reason

    return NextResponse.json({
      data: {
        approval_id: approvalId,
        status: "rejected",
        entity_type: approval.entity_type,
        entity_id: approval.entity_id,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
