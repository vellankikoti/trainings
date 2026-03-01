import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Choose the right plan for your DevOps learning journey.",
};

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Perfect for getting started with DevOps fundamentals.",
    cta: "Start Free",
    ctaLink: "/sign-up",
    comingSoon: false,
    features: [
      "Foundations learning path",
      "Community exercises",
      "Public profile",
      "Basic progress tracking",
      "Access to blog content",
    ],
  },
  {
    name: "Premium",
    price: "$9",
    period: "/month",
    description: "Unlock all paths, labs, and certificates.",
    cta: "Coming Soon",
    ctaLink: "#",
    comingSoon: true,
    highlighted: true,
    features: [
      "All 6 learning paths",
      "Interactive browser labs",
      "Verified certificates",
      "Module assessments",
      "Priority support",
      "Offline access",
    ],
  },
  {
    name: "Team",
    price: "$29",
    period: "/user/month",
    description: "Train your team with analytics and admin tools.",
    cta: "Coming Soon",
    ctaLink: "#",
    comingSoon: true,
    features: [
      "Everything in Premium",
      "Team dashboard",
      "Progress analytics",
      "Custom learning paths",
      "SSO integration",
      "Dedicated support",
    ],
  },
];

const faqs = [
  {
    question: "Is the free tier really free forever?",
    answer:
      "Yes! The Foundations path will always be free. We believe everyone deserves access to quality DevOps education.",
  },
  {
    question: "Can I switch plans later?",
    answer:
      "Absolutely. You can upgrade or downgrade at any time. Your progress is always preserved.",
  },
  {
    question: "Do certificates cost extra?",
    answer:
      "No. Certificates are included with Premium and Team plans. Pass the assessment and your certificate is generated automatically.",
  },
  {
    question: "Is there a student discount?",
    answer:
      "Yes! Students with a valid .edu email get 50% off Premium. Contact us for details.",
  },
];

export default function PricingPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Simple, Transparent Pricing</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Start free. Upgrade when you&apos;re ready.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-lg border p-8 ${
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
              <span className="text-4xl font-bold">{tier.price}</span>
              {tier.period && (
                <span className="text-muted-foreground">{tier.period}</span>
              )}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {tier.description}
            </p>

            <a
              href={tier.ctaLink}
              className={`mt-6 block rounded-lg py-2.5 text-center text-sm font-medium transition-colors ${
                tier.comingSoon
                  ? "border bg-muted text-muted-foreground cursor-not-allowed"
                  : tier.highlighted
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border hover:bg-muted"
              }`}
            >
              {tier.cta}
            </a>

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
