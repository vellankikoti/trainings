import { NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

/**
 * Stripe webhook handler.
 * Handles subscription lifecycle events.
 *
 * POST /api/webhooks/stripe
 */
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(body, signature);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (!userId) {
        console.error("No userId in checkout session metadata");
        break;
      }

      // Get subscription details
      const { getStripe } = await import("@/lib/stripe");
      const subscription = await getStripe().subscriptions.retrieve(subscriptionId);

      // Determine plan from price
      const priceId = subscription.items.data[0]?.price.id;
      const plan = determinePlan(priceId);

      // Upsert subscription record
      const { error } = (await (supabase.from("subscriptions") as any).upsert(
        {
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan,
          status: "active",
          current_period_start: new Date(
            subscription.current_period_start * 1000,
          ).toISOString(),
          current_period_end: new Date(
            subscription.current_period_end * 1000,
          ).toISOString(),
        },
        { onConflict: "user_id" },
      )) as any;

      if (error) {
        console.error("Failed to create subscription:", error);
        return NextResponse.json(
          { error: "Database error" },
          { status: 500 },
        );
      }

      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const subscriptionId = subscription.id;
      const priceId = subscription.items.data[0]?.price.id;
      const plan = determinePlan(priceId);

      const { error } = (await (supabase
        .from("subscriptions") as any)
        .update({
          plan,
          status: subscription.status === "active" ? "active" : subscription.status as string,
          current_period_start: new Date(
            subscription.current_period_start * 1000,
          ).toISOString(),
          current_period_end: new Date(
            subscription.current_period_end * 1000,
          ).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        })
        .eq("stripe_subscription_id", subscriptionId)) as any;

      if (error) {
        console.error("Failed to update subscription:", error);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const subscriptionId = subscription.id;

      const { error } = (await (supabase
        .from("subscriptions") as any)
        .update({
          status: "canceled",
          plan: "free",
        })
        .eq("stripe_subscription_id", subscriptionId)) as any;

      if (error) {
        console.error("Failed to cancel subscription:", error);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string;

      if (subscriptionId) {
        const { error } = (await (supabase
          .from("subscriptions") as any)
          .update({ status: "past_due" })
          .eq("stripe_subscription_id", subscriptionId)) as any;

        if (error) {
          console.error("Failed to mark subscription as past_due:", error);
        }
      }
      break;
    }

    default:
      // Unhandled event type — log but don't error
      console.log(`Unhandled Stripe event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

/**
 * Determine plan type from Stripe price ID.
 */
function determinePlan(priceId: string | undefined): string {
  if (!priceId) return "free";

  const premiumMonthly = process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID;
  const premiumAnnual = process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID;
  const teamMonthly = process.env.STRIPE_TEAM_MONTHLY_PRICE_ID;
  const teamAnnual = process.env.STRIPE_TEAM_ANNUAL_PRICE_ID;

  if (priceId === premiumMonthly || priceId === premiumAnnual) {
    return "premium";
  }
  if (priceId === teamMonthly || priceId === teamAnnual) {
    return "team";
  }

  return "premium"; // Default to premium for unknown price IDs
}
