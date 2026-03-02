import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createBillingPortalSession } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { getProfileId } from "@/lib/progress";

/**
 * POST /api/billing/portal — Create a Stripe billing portal session.
 * Allows users to manage their subscription (cancel, update payment, etc.).
 */
export async function POST() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profileId = await getProfileId(clerkId);
  if (!profileId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Get the user's Stripe customer ID
  const supabase = createAdminClient();
  const { data: subscription } = (await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", profileId)
    .single()) as any;

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No active subscription found" },
      { status: 404 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const session = await createBillingPortalSession({
      customerId: subscription.stripe_customer_id,
      returnUrl: `${appUrl}/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe billing portal error:", err);
    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 },
    );
  }
}
