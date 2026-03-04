import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { requireRole, AuthError } from "@/lib/auth";
import { approvalActionSchema, validateBody } from "@/lib/validations";
import { logAudit } from "@/lib/audit";

type Params = { params: Promise<{ approvalId: string }> };

/**
 * POST /api/admin/approvals/[approvalId]/approve — Approve a pending registration.
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { approvalId } = await params;
    const ctx = await requireRole("admin", "super_admin");
    const body = await request.json().catch(() => ({}));
    const validated = validateBody(approvalActionSchema, body);

    const supabase = createAdminClient();

    // Fetch the approval request
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
        status: "approved",
        reviewed_by: ctx.profileId,
        reviewed_at: new Date().toISOString(),
        review_notes: validated.data?.notes || null,
      })
      .eq("id", approvalId);

    // Activate the entity (only if not soft-deleted)
    const entityTable = approval.entity_type === "organization" ? "organizations" : "institutes";
    await supabase
      .from(entityTable)
      .update({ status: "active" })
      .eq("id", approval.entity_id)
      .is("deleted_at", null);

    await logAudit({
      actorId: ctx.profileId,
      actorRole: ctx.role,
      action: `${approval.entity_type}.approved`,
      resourceType: approval.entity_type,
      resourceId: approval.entity_id,
      entityType: approval.entity_type,
      entityId: approval.entity_id,
      metadata: { approval_id: approvalId, notes: validated.data?.notes },
    });

    // TODO: Send approval email to the requester

    return NextResponse.json({
      data: {
        approval_id: approvalId,
        status: "approved",
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
