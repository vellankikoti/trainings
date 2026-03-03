/**
 * Organization billing plans and Stripe integration.
 *
 * Plans:
 * - free:       5 profile views/month, 2 contacts/month, 1 seat, 1 job posting
 * - starter:    50 profile views/month, 10 contacts/month, 3 seats, 5 job postings
 * - pro:        200 profile views/month, 50 contacts/month, 10 seats, unlimited postings
 * - enterprise: Unlimited everything, dedicated support
 *
 * Requires:
 * - STRIPE_SECRET_KEY
 * - STRIPE_ORG_STARTER_PRICE_ID
 * - STRIPE_ORG_PRO_PRICE_ID
 * - STRIPE_ORG_ENTERPRISE_PRICE_ID
 */

export interface OrgPlan {
  id: string;
  name: string;
  profileViews: number;
  contacts: number;
  maxSeats: number;
  maxJobs: number;
  price: number; // monthly USD
  stripePriceId: string | null;
}

export const ORG_PLANS: OrgPlan[] = [
  {
    id: "free",
    name: "Free",
    profileViews: 5,
    contacts: 2,
    maxSeats: 1,
    maxJobs: 1,
    price: 0,
    stripePriceId: null,
  },
  {
    id: "starter",
    name: "Starter",
    profileViews: 50,
    contacts: 10,
    maxSeats: 3,
    maxJobs: 5,
    price: 49,
    stripePriceId: process.env.STRIPE_ORG_STARTER_PRICE_ID ?? null,
  },
  {
    id: "pro",
    name: "Pro",
    profileViews: 200,
    contacts: 50,
    maxSeats: 10,
    maxJobs: -1, // unlimited
    price: 149,
    stripePriceId: process.env.STRIPE_ORG_PRO_PRICE_ID ?? null,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    profileViews: -1,
    contacts: -1,
    maxSeats: -1,
    maxJobs: -1,
    price: 499,
    stripePriceId: process.env.STRIPE_ORG_ENTERPRISE_PRICE_ID ?? null,
  },
];

export function getPlan(planId: string): OrgPlan | undefined {
  return ORG_PLANS.find((p) => p.id === planId);
}

export function getPlanLimits(planId: string) {
  const plan = getPlan(planId) ?? ORG_PLANS[0];
  return {
    profileViews: plan.profileViews,
    contacts: plan.contacts,
    maxSeats: plan.maxSeats,
    maxJobs: plan.maxJobs,
  };
}
