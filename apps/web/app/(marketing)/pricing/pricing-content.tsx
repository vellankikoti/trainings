"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

const tiers = [
  {
    name: "Free",
    priceMonthly: "$0",
    priceAnnual: "$0",
    period: "",
    savings: "",
    description: "Perfect for getting started with DevOps fundamentals.",
    plan: "free" as const,
    features: [
      "All lessons across all paths",
      "Local lab environments",
      "Inline quizzes",
      "Basic progress tracking",
      "Public profile & leaderboard",
      "Community access",
    ],
  },
  {
    name: "Premium",
    priceMonthly: "$9",
    priceAnnual: "$79",
    period: "/month",
    savings: "Save 27%",
    annualPerMonth: "$6.58",
    description: "Unlock cloud labs, certificates, and assessments.",
    plan: "premium" as const,
    highlighted: true,
    features: [
      "Everything in Free",
      "Cloud-based browser labs",
      "Verified certificates",
      "Module & path assessments",
      "PDF lesson downloads",
      "Priority support",
    ],
  },
  {
    name: "Team",
    priceMonthly: "$29",
    priceAnnual: "$279",
    period: "/user/month",
    savings: "Save 20%",
    annualPerMonth: "$23.25",
    description: "Train your team with analytics and admin tools.",
    plan: "team" as const,
    features: [
      "Everything in Premium",
      "Team admin dashboard",
      "Progress analytics & reports",
      "Custom learning paths",
      "CSV export",
      "Dedicated support",
    ],
  },
];

const faqs = [
  {
    question: "Is the free tier really free forever?",
    answer:
      "Yes! All lessons will always be free. We believe everyone deserves access to quality DevOps education. Premium unlocks extra features like cloud labs and certificates.",
  },
  {
    question: "Can I switch plans later?",
    answer:
      "Absolutely. You can upgrade, downgrade, or cancel at any time. If you downgrade, you keep access until the end of your billing period. Your progress is always preserved.",
  },
  {
    question: "Do certificates cost extra?",
    answer:
      "No. Certificates are included with Premium and Team plans. Pass the module assessment and your verified certificate is generated automatically.",
  },
  {
    question: "Is there a student discount?",
    answer:
      "Yes! Students with a valid .edu email get 50% off Premium. Contact us for details.",
  },
];

export function PricingContent() {
  const [annual, setAnnual] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);
  const { isSignedIn } = useAuth();

  async function handleSubscribe(plan: "premium" | "team") {
    if (!isSignedIn) {
      window.location.href = "/sign-up?redirect_url=/pricing";
      return;
    }

    setLoading(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          interval: annual ? "annual" : "monthly",
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Simple, Transparent Pricing</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Start free. Upgrade when you&apos;re ready.
        </p>

        {/* Billing Toggle */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <span
            className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}
          >
            Monthly
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              annual ? "bg-primary" : "bg-muted-foreground/30"
            }`}
            role="switch"
            aria-checked={annual}
            aria-label="Toggle annual billing"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                annual ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium ${annual ? "text-foreground" : "text-muted-foreground"}`}
          >
            Annual
          </span>
          {annual && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Save up to 27%
            </span>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative rounded-lg border p-8 ${
              tier.highlighted
                ? "border-primary shadow-lg ring-1 ring-primary"
                : ""
            }`}
          >
            {tier.highlighted && (
              <div className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Most Popular
              </div>
            )}
            <h3 className="text-2xl font-bold">{tier.name}</h3>
            <div className="mt-2">
              <span className="text-4xl font-bold">
                {annual ? tier.priceAnnual : tier.priceMonthly}
              </span>
              {tier.plan !== "free" && (
                <span className="text-muted-foreground">
                  {annual ? "/year" : tier.period}
                </span>
              )}
            </div>
            {annual && tier.annualPerMonth && (
              <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                {tier.annualPerMonth}/mo &middot; {tier.savings}
              </p>
            )}
            <p className="mt-3 text-sm text-muted-foreground">
              {tier.description}
            </p>

            {tier.plan === "free" ? (
              <Link
                href="/sign-up"
                className="mt-6 block rounded-lg border py-2.5 text-center text-sm font-medium transition-colors hover:bg-muted"
              >
                Start Free
              </Link>
            ) : tier.plan === "team" ? (
              <a
                href="mailto:team@devops-engineers.com?subject=Team Plan Inquiry"
                className="mt-6 block rounded-lg border py-2.5 text-center text-sm font-medium transition-colors hover:bg-muted"
              >
                Contact Us
              </a>
            ) : (
              <button
                onClick={() => handleSubscribe(tier.plan)}
                disabled={loading === tier.plan}
                className={`mt-6 block w-full rounded-lg py-2.5 text-center text-sm font-medium transition-colors ${
                  tier.highlighted
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border hover:bg-muted"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {loading === tier.plan ? "Loading..." : "Subscribe"}
              </button>
            )}

            <ul className="mt-6 space-y-3 text-sm">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <span className="text-primary">&#10003;</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mx-auto mt-20 max-w-3xl">
        <h2 className="mb-8 text-center text-3xl font-bold">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-lg border p-6">
              <h3 className="font-semibold">{faq.question}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
