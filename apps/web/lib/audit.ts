/**
 * Audit logging helper.
 * Logs admin/security actions to the audit_log table.
 */

import { createAdminClient } from "@/lib/supabase/server";

interface AuditEntry {
  actorId: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  entityType?: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from("audit_log").insert({
      actor_id: entry.actorId,
      actor_role: entry.actorRole,
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId ?? null,
      entity_type: entry.entityType ?? null,
      entity_id: entry.entityId ?? null,
      old_values: entry.oldValues as any ?? null,
      new_values: entry.newValues as any ?? null,
      metadata: entry.metadata as any ?? null,
    });
  } catch {
    // Audit logging should never block the main operation
    console.error("[audit] Failed to write audit log", entry.action);
  }
}
