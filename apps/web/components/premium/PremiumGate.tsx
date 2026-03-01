"use client";

import { type ReactNode } from "react";
import { UpgradePrompt } from "./UpgradePrompt";

interface PremiumGateProps {
  /** The user's current plan */
  plan: "free" | "premium" | "team";
  /** Minimum plan required to access this content */
  requiredPlan?: "premium" | "team";
  /** What feature is being gated (shown in upgrade prompt) */
  feature: string;
  /** Content to show if user has access */
  children: ReactNode;
  /** Optional fallback instead of UpgradePrompt */
  fallback?: ReactNode;
}

/**
 * Wraps premium-only content. Shows the content if the user has the required plan,
 * otherwise shows an upgrade prompt.
 */
export function PremiumGate({
  plan,
  requiredPlan = "premium",
  feature,
  children,
  fallback,
}: PremiumGateProps) {
  const planHierarchy = { free: 0, premium: 1, team: 2 };

  const hasAccess = planHierarchy[plan] >= planHierarchy[requiredPlan];

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return <UpgradePrompt feature={feature} requiredPlan={requiredPlan} />;
}
