"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface BatchActionsProps {
  batchId: string;
  instituteId: string;
  isActive: boolean;
}

export function BatchActions({
  batchId,
  instituteId,
  isActive,
}: BatchActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggleActive = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/institutes/${instituteId}/batches/${batchId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: !isActive }),
        },
      );
      if (!res.ok) throw new Error("Failed to update batch");
      router.refresh();
    } catch (err) {
      console.error("Batch toggle failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleActive}
      disabled={loading}
      className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
        isActive
          ? "border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/30"
          : "border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
      }`}
    >
      {loading
        ? "Updating..."
        : isActive
          ? "Archive Batch"
          : "Reactivate Batch"}
    </button>
  );
}
