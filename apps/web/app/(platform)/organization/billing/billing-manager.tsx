"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface PlanInfo {
  id: string;
  name: string;
  price: number;
  profileViews: number;
  contacts: number;
  maxSeats: number;
  maxJobs: number;
}

interface BillingData {
  currentPlan: string;
  profileViewsRemaining: number;
  contactsRemaining: number;
  maxSeats: number;
  hasStripeCustomer: boolean;
  plans: PlanInfo[];
}

export function BillingManager({ orgId }: { orgId: string }) {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  useEffect(() => {
    fetch(`/api/organizations/${orgId}/billing`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [orgId]);

  const handleCheckout = async (planId: string) => {
    setActionLoading(planId);
    try {
      const res = await fetch(`/api/organizations/${orgId}/billing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "checkout", planId }),
      });
      const result = await res.json();
      if (result.url) {
        window.location.href = result.url;
      } else {
        alert(result.error || "Failed to create checkout session");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePortal = async () => {
    setActionLoading("portal");
    try {
      const res = await fetch(`/api/organizations/${orgId}/billing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "portal" }),
      });
      const result = await res.json();
      if (result.url) {
        window.location.href = result.url;
      } else {
        alert(result.error || "Failed to open billing portal");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-lg border border-border bg-muted/30"
          />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">Failed to load billing data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Success/Cancel banners */}
      {success && (
        <div className="rounded-lg bg-emerald-100 p-4 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          Subscription activated successfully! Your plan has been upgraded.
        </div>
      )}
      {canceled && (
        <div className="rounded-lg bg-amber-100 p-4 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          Checkout was canceled. No changes were made to your plan.
        </div>
      )}

      {/* Current Usage */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Current Usage</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Plan</p>
            <p className="mt-1 text-2xl font-bold capitalize">
              {data.currentPlan}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Profile Views Remaining
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {data.profileViewsRemaining}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Contacts Remaining
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {data.contactsRemaining}
            </p>
          </div>
        </div>

        {data.hasStripeCustomer && (
          <button
            onClick={handlePortal}
            disabled={actionLoading === "portal"}
            className="mt-4 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            {actionLoading === "portal"
              ? "Opening..."
              : "Manage Billing (Stripe Portal)"}
          </button>
        )}
      </section>

      {/* Plans */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Available Plans</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.plans.map((plan) => {
            const isCurrent = plan.id === data.currentPlan;
            const isUpgrade =
              data.plans.findIndex((p) => p.id === plan.id) >
              data.plans.findIndex((p) => p.id === data.currentPlan);

            return (
              <div
                key={plan.id}
                className={`relative rounded-lg border p-6 ${
                  isCurrent
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-2.5 left-4 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                    Current
                  </span>
                )}
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="mt-1 text-3xl font-bold tabular-nums">
                  ${plan.price}
                  <span className="text-sm font-normal text-muted-foreground">
                    /mo
                  </span>
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckIcon />
                    {plan.profileViews === -1
                      ? "Unlimited"
                      : plan.profileViews}{" "}
                    profile views/mo
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon />
                    {plan.contacts === -1 ? "Unlimited" : plan.contacts}{" "}
                    contacts/mo
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon />
                    {plan.maxSeats === -1 ? "Unlimited" : plan.maxSeats} seats
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon />
                    {plan.maxJobs === -1 ? "Unlimited" : plan.maxJobs} job
                    postings
                  </li>
                </ul>

                {!isCurrent && isUpgrade && plan.price > 0 && (
                  <button
                    onClick={() => handleCheckout(plan.id)}
                    disabled={actionLoading === plan.id}
                    className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {actionLoading === plan.id
                      ? "Redirecting..."
                      : `Upgrade to ${plan.name}`}
                  </button>
                )}
                {isCurrent && (
                  <p className="mt-4 text-center text-xs text-muted-foreground">
                    Your current plan
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-emerald-500"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
