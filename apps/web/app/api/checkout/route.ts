import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createCheckoutSession, PLANS } from "@/lib/stripe";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { z } from "zod";
import { validateBody } from "@/lib/validations";

const checkoutSchema = z.object({
  plan: z.enum(["premium", "team"]),
  interval: z.enum(["monthly", "annual"]),
});

/**
 * POST /api/checkout — Create a Stripe checkout session.
 */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 5 requests/hour
  const rl = rateLimit(`checkout:${userId}`, RATE_LIMITS.checkout);
  if (!rl.success) {
    return rateLimitResponse(rl);
  }

  const body = await request.json();
  const validated = validateBody(checkoutSchema, body);
  if (validated.error) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { plan, interval } = validated.data;

  // Get price ID
  const planConfig = PLANS[plan];
  const priceId =
    interval === "monthly"
      ? planConfig.stripePriceIdMonthly
      : planConfig.stripePriceIdAnnual;

  if (!priceId) {
    return NextResponse.json(
      { error: "Payment not configured for this plan" },
      { status: 400 },
    );
  }

  // Get user email from Clerk
  const user = await currentUser();
  if (!user?.emailAddresses?.[0]?.emailAddress) {
    return NextResponse.json(
      { error: "No email address found" },
      { status: 400 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const session = await createCheckoutSession({
      userId,
      priceId,
      customerEmail: user.emailAddresses[0].emailAddress,
      successUrl: `${appUrl}/dashboard?checkout=success`,
      cancelUrl: `${appUrl}/pricing?checkout=canceled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
