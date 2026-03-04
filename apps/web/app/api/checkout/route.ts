import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createCheckoutSession, PLANS } from "@/lib/stripe";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { z } from "zod";
import { validateBody } from "@/lib/validations";
import { apiErrors, withLogging } from "@/lib/api-helpers";

const checkoutSchema = z.object({
  plan: z.enum(["premium", "team"]),
  interval: z.enum(["monthly", "annual"]),
});

/**
 * POST /api/checkout — Create a Stripe checkout session.
 */
export const POST = withLogging(async (request: Request) => {
  const { userId } = await auth();
  if (!userId) {
    return apiErrors.unauthorized();
  }

  // Rate limit: 5 requests/hour
  const rl = await rateLimit(`checkout:${userId}`, RATE_LIMITS.checkout);
  if (!rl.success) {
    return rateLimitResponse(rl);
  }

  const body = await request.json();
  const validated = validateBody(checkoutSchema, body);
  if (validated.error) {
    return apiErrors.badRequest(validated.error);
  }

  const { plan, interval } = validated.data;

  // Get price ID
  const planConfig = (PLANS as any)[plan];
  const priceId =
    interval === "monthly"
      ? planConfig.stripePriceIdMonthly
      : planConfig.stripePriceIdAnnual;

  if (!priceId) {
    return apiErrors.badRequest("Payment not configured for this plan");
  }

  // Get user email from Clerk
  const user = await currentUser();
  if (!user?.emailAddresses?.[0]?.emailAddress) {
    return apiErrors.badRequest("No email address found");
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
    return apiErrors.internal();
  }
});
