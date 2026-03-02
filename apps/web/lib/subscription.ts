import { createAdminClient } from "@/lib/supabase/server";

export type Plan = "free" | "premium" | "team";

export interface Subscription {
  plan: Plan;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
}

const FREE_SUBSCRIPTION: Subscription = {
  plan: "free",
  status: "active",
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  stripeCustomerId: null,
};

/**
 * Get the current subscription for a user.
 * Returns free plan if no subscription exists.
 */
export async function getSubscription(userId: string): Promise<Subscription> {
  const supabase = createAdminClient();

  const { data } = (await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single()) as any;

  if (!data) {
    return FREE_SUBSCRIPTION;
  }

  return {
    plan: data.plan as Plan,
    status: data.status,
    currentPeriodEnd: data.current_period_end,
    cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
    stripeCustomerId: data.stripe_customer_id,
  };
}

/**
 * Check if a user has an active premium or team subscription.
 */
export async function isPremium(userId: string): Promise<boolean> {
  const sub = await getSubscription(userId);
  return (
    (sub.plan === "premium" || sub.plan === "team") &&
    sub.status === "active"
  );
}

/**
 * Feature access definitions by plan.
 */
export const FEATURES = {
  // Free tier features
  allLessons: ["free", "premium", "team"],
  localLabs: ["free", "premium", "team"],
  inlineQuizzes: ["free", "premium", "team"],
  basicProgress: ["free", "premium", "team"],

  // Premium features
  cloudLabs: ["premium", "team"],
  certificates: ["premium", "team"],
  moduleAssessments: ["premium", "team"],
  pdfDownloads: ["premium", "team"],
  prioritySupport: ["premium", "team"],

  // Team features
  teamDashboard: ["team"],
  teamAnalytics: ["team"],
  ssoIntegration: ["team"],
} as const;

export type Feature = keyof typeof FEATURES;

/**
 * Check if a plan has access to a specific feature.
 */
export function hasFeatureAccess(plan: Plan, feature: Feature): boolean {
  return (FEATURES[feature] as readonly string[]).includes(plan);
}

/**
 * Free tier lab session limits.
 */
export const FREE_LAB_SESSIONS_PER_MONTH = 3;

/**
 * Check if a free user has remaining lab sessions this month.
 */
export async function hasRemainingLabSessions(
  userId: string,
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const sub = await getSubscription(userId);

  // Premium and team users have unlimited sessions
  if (sub.plan !== "free") {
    return { allowed: true, used: 0, limit: Infinity };
  }

  const supabase = createAdminClient();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("daily_activity")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("date", startOfMonth.toISOString())
    .eq("activity_type", "lab_session");

  const used = count ?? 0;

  return {
    allowed: used < FREE_LAB_SESSIONS_PER_MONTH,
    used,
    limit: FREE_LAB_SESSIONS_PER_MONTH,
  };
}
