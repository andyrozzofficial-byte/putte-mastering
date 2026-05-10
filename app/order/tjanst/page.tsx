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
      <main className="mx-auto max-w-5xl px-5 pb-14 pt-8 sm:px-6 md:pb-20 md:pt-10 lg:px-7">
        <StepProgress activeStep={1} />

        <h1 className="mt-10 text-center text-[1.375rem] font-semibold tracking-tight text-black sm:text-xl md:mt-12 md:text-2xl">
          Välj tjänst
        </h1>

        <div className="mt-8 grid gap-4 md:mt-10 md:grid-cols-3 md:gap-4 lg:gap-5">
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
