"use client";

import { ORDER_PLANS } from "@/lib/order-plans";
import {
  clearOrderUploadDraft,
  readOrderUploadDraft,
} from "@/lib/order-flow-session";
import { submitOrderToSupabase } from "@/lib/submit-order";
import { PricingCard } from "@/components/order/pricing-card";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export function OrderPlansClient() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSelectPlan = useCallback(
    async (planTitle: string, price: string) => {
      setError(null);
      const draft = readOrderUploadDraft();
      if (!draft) {
        setError(
          "Ingen uppladdad fil hittades. Gå tillbaka till startsidan och ladda upp ditt spår först.",
        );
        return;
      }

      setLoadingPlan(planTitle);
      try {
        await submitOrderToSupabase({
          customer_name: "",
          track_name: draft.trackName,
          service: planTitle,
          status: "new",
          notes: "",
          uploaded_file: draft.uploadedFile,
          mastered_file: null,
          price,
        });
        clearOrderUploadDraft();
        router.push("/?order=received");
      } catch (e) {
        const msg =
          e instanceof Error
            ? e.message
            : "Något gick fel. Försök igen om en stund.";
        setError(msg);
      } finally {
        setLoadingPlan(null);
      }
    },
    [router],
  );

  return (
    <>
      {error ? (
        <p
          className="mx-auto mt-6 max-w-lg text-center text-[13px] text-red-700 sm:text-sm"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div
        className={`grid gap-4 md:grid-cols-3 md:gap-4 lg:gap-5 ${
          error ? "mt-6 md:mt-6" : "mt-8 md:mt-10"
        }`}
      >
        {ORDER_PLANS.map((plan) => (
          <PricingCard
            key={plan.title}
            title={plan.title}
            price={plan.price}
            features={plan.features}
            popular={plan.popular}
            disabled={loadingPlan !== null}
            isLoading={loadingPlan === plan.title}
            onSelect={() => onSelectPlan(plan.title, plan.price)}
          />
        ))}
      </div>
    </>
  );
}
