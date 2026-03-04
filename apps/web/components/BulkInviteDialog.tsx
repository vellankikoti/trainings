"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";

interface Props {
  entityType: "organization" | "institute";
  entityId: string;
  allowedRoles: { value: string; label: string }[];
  onSuccess?: () => void;
}

interface InviteResult {
  email: string;
  status: "success" | "error";
  message: string;
}

export function BulkInviteDialog({ entityType, entityId, allowedRoles, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [emailsText, setEmailsText] = useState("");
  const [role, setRole] = useState(allowedRoles[0]?.value ?? "");
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<InviteResult[]>([]);

  const parseEmails = (text: string): string[] => {
    return text
      .split(/[,;\n]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0 && e.includes("@"));
  };

  const handleBulkInvite = async () => {
    const emails = parseEmails(emailsText);
    if (emails.length === 0) return;

    setLoading(true);
    setResults([]);
    const inviteResults: InviteResult[] = [];

    for (const email of emails) {
      const { error } = await api.post("/api/invitations", {
        email,
        entity_type: entityType,
        entity_id: entityId,
        role,
        message: messageText || undefined,
      });

      inviteResults.push({
        email,
        status: error ? "error" : "success",
        message: error ?? "Invitation sent",
      });
    }

    setResults(inviteResults);
    setLoading(false);

    const successCount = inviteResults.filter((r) => r.status === "success").length;
    if (successCount > 0) {
      onSuccess?.();
    }
  };

  const emails = parseEmails(emailsText);
  const successCount = results.filter((r) => r.status === "success").length;
  const errorCount = results.filter((r) => r.status === "error").length;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
      >
        Bulk Invite
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg">
        <h2 className="text-lg font-semibold">Bulk Invite Members</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter multiple email addresses separated by commas, semicolons, or new lines.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Email Addresses *
              {emails.length > 0 && (
                <span className="ml-2 font-normal text-muted-foreground">
                  ({emails.length} detected)
                </span>
              )}
            </label>
            <textarea
              value={emailsText}
              onChange={(e) => setEmailsText(e.target.value)}
              placeholder={"alice@company.com\nbob@company.com\ncarol@company.com"}
              rows={4}
              disabled={loading}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Role for all invitees *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            >
              {allowedRoles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Personal Message</label>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Optional message to include in all invitations..."
              rows={2}
              disabled={loading}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
          </div>
        </div>

        {results.length > 0 && (
          <div className="mt-4 max-h-40 space-y-1 overflow-y-auto rounded-lg border p-3">
            <p className="mb-2 text-sm font-medium">
              Results: {successCount} sent, {errorCount} failed
            </p>
            {results.map((r, i) => (
              <div
                key={i}
                className={`flex items-center justify-between text-xs ${
                  r.status === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                }`}
              >
                <span className="truncate">{r.email}</span>
                <span className="ml-2 shrink-0">{r.message}</span>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="mt-3 text-sm text-muted-foreground">
            Sending invitations... ({results.length}/{emails.length})
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => {
              setOpen(false);
              setResults([]);
              setEmailsText("");
            }}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            {results.length > 0 ? "Close" : "Cancel"}
          </button>
          {results.length === 0 && (
            <button
              onClick={handleBulkInvite}
              disabled={loading || emails.length === 0}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Sending..." : `Send ${emails.length} Invitation${emails.length !== 1 ? "s" : ""}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
