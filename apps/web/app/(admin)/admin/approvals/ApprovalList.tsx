"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Approval {
  id: string;
  entity_type: string;
  entity_id: string;
  status: string;
  entity_name?: string;
  requester_name?: string;
  created_at: string;
}

export function ApprovalList({ approvals }: { approvals: Approval[] }) {
  return (
    <div className="space-y-3">
      {approvals.map((a) => (
        <ApprovalCard key={a.id} approval={a} />
      ))}
    </div>
  );
}

function ApprovalCard({ approval }: { approval: Approval }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleApprove = async () => {
    setLoading("approve");
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/approvals/${approval.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to approve");
      setMessage({ type: "success", text: "Approved successfully" });
      setTimeout(() => router.refresh(), 1000);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed" });
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    if (rejectReason.length < 10) {
      setMessage({ type: "error", text: "Reason must be at least 10 characters" });
      return;
    }
    setLoading("reject");
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/approvals/${approval.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to reject");
      setMessage({ type: "success", text: "Rejected" });
      setTimeout(() => router.refresh(), 1000);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold">{approval.entity_name}</p>
          <p className="text-sm text-muted-foreground">
            <span className="capitalize">{approval.entity_type}</span> &middot; Requested by{" "}
            {approval.requester_name} &middot; {new Date(approval.created_at).toLocaleDateString()}
          </p>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          Pending
        </span>
      </div>

      {message && (
        <div
          className={`mt-3 rounded-lg p-2 text-sm ${
            message.type === "success"
              ? "bg-green-500/10 text-green-600 dark:text-green-400"
              : "bg-red-500/10 text-red-600 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {showRejectForm && (
        <div className="mt-3 space-y-2">
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection (min 10 characters)..."
            rows={2}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {!showRejectForm ? (
          <>
            <button
              onClick={() => setShowRejectForm(true)}
              disabled={loading !== null}
              className="rounded-lg border border-red-200 px-4 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              Reject
            </button>
            <button
              onClick={handleApprove}
              disabled={loading !== null}
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading === "approve" ? "Approving..." : "Approve"}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setShowRejectForm(false)}
              disabled={loading !== null}
              className="rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={loading !== null || rejectReason.length < 10}
              className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {loading === "reject" ? "Rejecting..." : "Confirm Reject"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
