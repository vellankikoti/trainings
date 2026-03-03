/**
 * Stripe billing utilities for organization plans.
 *
 * Requires STRIPE_SECRET_KEY environment variable.
 * Creates checkout sessions and manages subscriptions.
 */

import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { getPlan, getPlanLimits } from "./org-plans";

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2024-06-20" as Stripe.LatestApiVersion });
}

/**
 * Create a Stripe Checkout session for an organization plan upgrade.
 */
export async function createOrgCheckoutSession(
  orgId: string,
  planId: string,
  successUrl: string,
  cancelUrl: string,
): Promise<string | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const plan = getPlan(planId);
  if (!plan?.stripePriceId) return null;

  const supabase = createAdminClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, billing_email, stripe_customer_id")
    .eq("id", orgId)
    .single();

  if (!org) return null;

  // Get or create Stripe customer
  let customerId = org.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      name: org.name,
      email: org.billing_email ?? undefined,
      metadata: { org_id: orgId },
    });
    customerId = customer.id;

    await supabase
      .from("organizations")
      .update({ stripe_customer_id: customerId })
      .eq("id", orgId);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { org_id: orgId, plan_id: planId },
  });

  return session.url;
}

/**
 * Handle Stripe subscription webhook events.
 * Called from the Stripe webhook handler.
 */
export async function handleOrgSubscriptionEvent(
  event: Stripe.Event,
): Promise<void> {
  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orgId = session.metadata?.org_id;
      const planId = session.metadata?.plan_id;

      if (orgId && planId) {
        const limits = getPlanLimits(planId);
        await supabase
          .from("organizations")
          .update({
            plan: planId,
            profile_views_remaining: limits.profileViews,
            contacts_remaining: limits.contacts,
            max_seats: limits.maxSeats,
          })
          .eq("id", orgId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      const { data: org } = await supabase
        .from("organizations")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (org) {
        const freeLimits = getPlanLimits("free");
        await supabase
          .from("organizations")
          .update({
            plan: "free",
            profile_views_remaining: freeLimits.profileViews,
            contacts_remaining: freeLimits.contacts,
            max_seats: freeLimits.maxSeats,
          })
          .eq("id", org.id);
      }
      break;
    }
  }
}
