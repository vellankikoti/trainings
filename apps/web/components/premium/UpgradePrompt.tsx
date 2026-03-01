"use client";

import Link from "next/link";

interface UpgradePromptProps {
  /** The feature being accessed */
  feature: string;
  /** The plan required */
  requiredPlan?: "premium" | "team";
}

/**
 * Shown when a free user tries to access a premium feature.
 * Provides a clear call-to-action to upgrade.
 */
export function UpgradePrompt({
  feature,
  requiredPlan = "premium",
}: UpgradePromptProps) {
  const planName = requiredPlan === "team" ? "Team" : "Premium";
  const price = requiredPlan === "team" ? "$29/user/mo" : "$9/mo";

  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center dark:border-yellow-800 dark:bg-yellow-950/30">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/50">
        <svg
          className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>

      <h3 className="mb-1 text-lg font-semibold text-yellow-900 dark:text-yellow-100">
        {planName} Feature
      </h3>

      <p className="mb-4 text-sm text-yellow-700 dark:text-yellow-300">
        <strong>{feature}</strong> is available on the {planName} plan
        (starting at {price}).
      </p>

      <Link
        href="/pricing"
        className="inline-flex items-center rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600"
      >
        View Plans
      </Link>

      <p className="mt-3 text-xs text-yellow-600 dark:text-yellow-400">
        All lessons remain free forever. Premium unlocks extra features.
      </p>
    </div>
  );
}
