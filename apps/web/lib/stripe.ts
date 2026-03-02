import Stripe from "stripe";

/**
 * Server-side Stripe client (lazy-initialized).
 * Only import this in server components and API routes.
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return _stripe;
}


/**
 * Stripe product/price configuration.
 * These IDs should be created in the Stripe Dashboard and stored as env vars.
 */
export const PLANS = {
  free: {
    name: "Free",
    priceMonthly: 0,
    priceAnnual: 0,
    stripePriceIdMonthly: null,
    stripePriceIdAnnual: null,
  },
  premium: {
    name: "Premium",
    priceMonthly: 900, // $9.00
    priceAnnual: 7900, // $79.00
    stripePriceIdMonthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || null,
    stripePriceIdAnnual: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID || null,
  },
  team: {
    name: "Team",
    priceMonthly: 2900, // $29.00 per seat
    priceAnnual: 27900, // $279.00 per seat
    stripePriceIdMonthly: process.env.STRIPE_TEAM_MONTHLY_PRICE_ID || null,
    stripePriceIdAnnual: process.env.STRIPE_TEAM_ANNUAL_PRICE_ID || null,
  },
} as const;

export type PlanType = keyof typeof PLANS;

/**
 * Create a Stripe checkout session for a subscription.
 */
export async function createCheckoutSession({
  userId,
  priceId,
  customerEmail,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  priceId: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  return getStripe().checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: customerEmail,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId },
    subscription_data: {
      metadata: { userId },
    },
  });
}

/**
 * Create a Stripe billing portal session for managing subscriptions.
 */
export async function createBillingPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  return getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

/**
 * Get or create a Stripe customer for a user.
 */
export async function getOrCreateCustomer(
  email: string,
  userId: string,
): Promise<string> {
  // Search for existing customer by email
  const existing = await getStripe().customers.list({
    email,
    limit: 1,
  });

  if (existing.data.length > 0) {
    return existing.data[0].id;
  }

  // Create new customer
  const customer = await getStripe().customers.create({
    email,
    metadata: { userId },
  });

  return customer.id;
}

/**
 * Construct a webhook event from the raw body and signature.
 */
export function constructWebhookEvent(
  body: string,
  signature: string,
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  return getStripe().webhooks.constructEvent(body, signature, webhookSecret);
}
