"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <div className="mx-auto max-w-md space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-red-600 dark:text-red-400"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-foreground">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
