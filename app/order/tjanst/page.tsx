import { FlowHeader } from "@/components/order/flow-header";
import { PricingCard } from "@/components/order/pricing-card";
import { StepProgress } from "@/components/order/step-progress";
import { TrustBadges } from "@/components/order/trust-badges";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Välj tjänst — MASTRAD",
  description:
    "Välj masteringpaket: Standard, Premium eller Stem Master. Enkelt och tydligt.",
};

const plans = [
  {
    title: "Standard Master",
    price: "1 500 kr",
    features: [
      "Professionell mastering",
      "1 revision",
      "Leverans inom 2–3 dagar",
    ],
    popular: false as const,
  },
  {
    title: "Premium Master",
    price: "2 000 kr",
    features: [
      "Professionell mastering",
      "2 revisioner",
      "Expressleverans (1–2 dagar)",
    ],
    popular: true as const,
  },
  {
    title: "Stem Master",
    price: "3 000 kr",
    features: ["För stems / mixar", "Mer kontroll & balans", "2 revisioner"],
    popular: false as const,
  },
] as const;

export default function OrderServicePage() {
  return (
    <div className="min-h-screen bg-neutral-50/50">
      <FlowHeader />
      <main className="mx-auto max-w-5xl px-6 pb-20 pt-10 md:pb-28 md:pt-14 lg:px-8">
        <StepProgress activeStep={1} />

        <h1 className="mt-16 text-center text-2xl font-semibold tracking-tight text-black md:mt-20 md:text-3xl">
          Välj tjänst
        </h1>

        <div className="mt-10 grid gap-6 md:mt-14 md:grid-cols-3 md:gap-5 lg:gap-6">
          {plans.map((plan) => (
            <PricingCard
              key={plan.title}
              title={plan.title}
              price={plan.price}
              features={plan.features}
              popular={plan.popular}
            />
          ))}
        </div>

        <TrustBadges />
      </main>
    </div>
  );
}
