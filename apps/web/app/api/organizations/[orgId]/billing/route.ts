import { NextResponse, type NextRequest } from "next/server";
import { requireRole, AuthError } from "@/lib/auth";
import { createOrgCheckoutSession } from "@/lib/billing/stripe-org";
import { ORG_PLANS } from "@/lib/billing/org-plans";
import { createAdminClient } from "@/lib/supabase/server";
import { createBillingPortalSession } from "@/lib/stripe";

type Params = { params: Promise<{ orgId: string }> };

/**
 * GET /api/organizations/[orgId]/billing
 * Returns current plan info and available plans.
 */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { orgId } = await params;
    const ctx = await requireRole("org_admin", "admin", "super_admin");

    if (
      ctx.role !== "admin" &&
      ctx.role !== "super_admin" &&
      ctx.orgId !== orgId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createAdminClient();
    const { data: org } = await supabase
      .from("organizations")
      .select(
        "plan, profile_views_remaining, contacts_remaining, max_seats, stripe_customer_id",
      )
      .eq("id", orgId)
      .single();

    if (!org) {
      return NextResponse.json({ error: "Org not found" }, { status: 404 });
    }

    return NextResponse.json({
      currentPlan: org.plan,
      profileViewsRemaining: org.profile_views_remaining,
      contactsRemaining: org.contacts_remaining,
      maxSeats: org.max_seats,
      hasStripeCustomer: !!org.stripe_customer_id,
      plans: ORG_PLANS.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        profileViews: p.profileViews,
        contacts: p.contacts,
        maxSeats: p.maxSeats,
        maxJobs: p.maxJobs,
      })),
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.statusCode },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/organizations/[orgId]/billing
 * Create a Stripe checkout session or billing portal session.
 * Body: { action: "checkout", planId: "starter" }
 *    or { action: "portal" }
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { orgId } = await params;
    const ctx = await requireRole("org_admin", "admin", "super_admin");

    if (
      ctx.role !== "admin" &&
      ctx.role !== "super_admin" &&
      ctx.orgId !== orgId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "";

    if (body.action === "portal") {
      // Redirect to Stripe billing portal
      const supabase = createAdminClient();
      const { data: org } = await supabase
        .from("organizations")
        .select("stripe_customer_id")
        .eq("id", orgId)
        .single();

      if (!org?.stripe_customer_id) {
        return NextResponse.json(
          { error: "No billing account found. Subscribe to a plan first." },
          { status: 400 },
        );
      }

      const session = await createBillingPortalSession({
        customerId: org.stripe_customer_id,
        returnUrl: `${origin}/organization/billing`,
      });

      return NextResponse.json({ url: session.url });
    }

    if (body.action === "checkout" && body.planId) {
      const url = await createOrgCheckoutSession(
        orgId,
        body.planId,
        `${origin}/organization/billing?success=true`,
        `${origin}/organization/billing?canceled=true`,
      );

      if (!url) {
        return NextResponse.json(
          {
            error:
              "Could not create checkout session. Stripe may not be configured or the plan has no price ID.",
          },
          { status: 400 },
        );
      }

      return NextResponse.json({ url });
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'checkout' or 'portal'." },
      { status: 400 },
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.statusCode },
      );
    }
    console.error("Billing error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
