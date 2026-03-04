import { createAdminClient } from "@/lib/supabase/server";
import { ApprovalList } from "./ApprovalList";

export const metadata = {
  title: "Approval Requests",
  description: "Review and manage pending registration requests.",
};

interface ApprovalRow {
  id: string;
  entity_type: string;
  entity_id: string;
  status: string;
  requested_by: string;
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  entity_name?: string;
  requester_name?: string;
}

async function getApprovals(): Promise<ApprovalRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

  try {
    const supabase = createAdminClient();

    const { data: approvals, error } = await supabase
      .from("approval_requests")
      .select("id, entity_type, entity_id, status, requested_by, created_at, reviewed_by, reviewed_at, review_notes")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !approvals) return [];

    // Enrich with entity names and requester profiles
    const enriched = await Promise.all(
      approvals.map(async (a) => {
        const table = a.entity_type === "organization" ? "organizations" : "institutes";
        const [{ data: entity }, { data: requester }] = await Promise.all([
          supabase.from(table).select("name").eq("id", a.entity_id).single(),
          supabase.from("profiles").select("display_name").eq("id", a.requested_by).single(),
        ]);
        return {
          ...a,
          entity_name: entity?.name ?? "Unknown",
          requester_name: requester?.display_name ?? "Unknown",
        };
      })
    );

    return enriched;
  } catch {
    return [];
  }
}

export default async function ApprovalsPage() {
  const approvals = await getApprovals();
  const pending = approvals.filter((a) => a.status === "pending_review");
  const processed = approvals.filter((a) => a.status !== "pending_review");

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold">Approval Requests</h1>
      <p className="mt-2 text-muted-foreground">
        {pending.length > 0
          ? `${pending.length} pending request${pending.length > 1 ? "s" : ""} awaiting review`
          : "No pending requests"}
      </p>

      {pending.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">Pending Review</h2>
          <ApprovalList approvals={pending} />
        </section>
      )}

      {processed.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">Processed</h2>
          <div className="space-y-3">
            {processed.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 p-4"
              >
                <div>
                  <p className="font-medium">{a.entity_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.entity_type} &middot; Requested by {a.requester_name} &middot;{" "}
                    {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    a.status === "approved"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {approvals.length === 0 && (
        <div className="mt-8 rounded-lg border bg-muted/50 p-8 text-center">
          <h2 className="text-xl font-semibold">No Approval Requests</h2>
          <p className="mt-2 text-muted-foreground">
            Approval requests will appear here when organizations or institutes register on the platform.
          </p>
        </div>
      )}
    </div>
  );
}
