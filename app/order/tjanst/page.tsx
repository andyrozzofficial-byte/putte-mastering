import { FlowHeader } from "@/components/order/flow-header";
import { OrderPlansClient } from "@/components/order/order-plans-client";
import { StepProgress } from "@/components/order/step-progress";
import { TrustBadges } from "@/components/order/trust-badges";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Välj tjänst — MASTRAD",
  description:
    "Välj masteringpaket: Standard, Premium eller Stem Master. Enkelt och tydligt.",
};

export default function OrderServicePage() {
  return (
    <div className="min-h-screen bg-neutral-50/50">
      <FlowHeader />
      <main className="mx-auto max-w-5xl px-5 pb-14 pt-8 sm:px-6 md:pb-20 md:pt-10 lg:px-7">
        <StepProgress activeStep={1} />

        <h1 className="mt-10 text-center text-[1.375rem] font-semibold tracking-tight text-black sm:text-xl md:mt-12 md:text-2xl">
          Välj tjänst
        </h1>

        <OrderPlansClient />

        <TrustBadges />
      </main>
    </div>
  );
}
