import type { Metadata } from "next";
import { PricingContent } from "./pricing-content";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Choose the right plan for your DevOps learning journey.",
};

export default function PricingPage() {
  return <PricingContent />;
}
