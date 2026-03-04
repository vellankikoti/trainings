"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  invitationId: string;
  entityType: string;
}

export function InvitationAction({ invitationId, entityType }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleAction = async (action: "accept" | "decline") => {
    setLoading(action);
    setMessage(null);

    try {
      const res = await fetch(`/api/invitations/${invitationId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || `Failed to ${action} invitation`);
      }

      if (action === "accept") {
        setMessage({ type: "success", text: "Invitation accepted! Redirecting..." });
        const redirectTo = entityType === "organization" ? "/organization" : "/institute";
        setTimeout(() => router.push(redirectTo), 1500);
      } else {
        setMessage({ type: "success", text: "Invitation declined." });
        setTimeout(() => router.push("/dashboard"), 1500);
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : `Failed to ${action}`,
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`rounded-lg p-3 text-center text-sm ${
            message.type === "success"
              ? "bg-green-500/10 text-green-600 dark:text-green-400"
              : "bg-red-500/10 text-red-600 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}
      <div className="flex gap-3">
        <button
          onClick={() => handleAction("decline")}
          disabled={loading !== null}
          className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-50"
        >
          {loading === "decline" ? "Declining..." : "Decline"}
        </button>
        <button
          onClick={() => handleAction("accept")}
          disabled={loading !== null}
          className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading === "accept" ? "Accepting..." : "Accept Invitation"}
        </button>
      </div>
    </div>
  );
}
