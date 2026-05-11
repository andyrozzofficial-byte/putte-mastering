"use client";

import { ORDER_PLANS } from "@/lib/order-plans";
import {
  clearOrderUploadDraft,
  mergeOrderUploadDraft,
  readOrderUploadDraft,
} from "@/lib/order-flow-session";
import { submitOrderToSupabase } from "@/lib/submit-order";
import { PricingCard } from "@/components/order/pricing-card";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

function isValidEmail(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function OrderPlansClient() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState(
    () => readOrderUploadDraft()?.customer_name ?? "",
  );
  const [customerEmail, setCustomerEmail] = useState(
    () => readOrderUploadDraft()?.customer_email ?? "",
  );
  const [customerMessage, setCustomerMessage] = useState(
    () => readOrderUploadDraft()?.customer_message ?? "",
  );

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

      const name = customerName.trim();
      const email = customerEmail.trim();
      if (!name) {
        setError("Fyll i ditt namn innan du väljer tjänst.");
        return;
      }
      if (!email) {
        setError("Fyll i din e-postadress innan du väljer tjänst.");
        return;
      }
      if (!isValidEmail(email)) {
        setError("Ange en giltig e-postadress.");
        return;
      }

      setLoadingPlan(planTitle);
      try {
        await submitOrderToSupabase({
          customer_name: name,
          customer_email: email,
          customer_message: customerMessage,
          track_name: draft.trackName,
          service: planTitle,
          status: "new",
          uploaded_file: draft.storageRef,
          mastered_file: null,
          price,
        });
        clearOrderUploadDraft();
        router.push("/?order=received");
      } catch (e) {
        console.error("[order-plans] submitOrderToSupabase failed:", e);
        const msg =
          e instanceof Error
            ? e.message
            : "Något gick fel. Försök igen om en stund.";
        setError(msg);
      } finally {
        setLoadingPlan(null);
      }
    },
    [router, customerName, customerEmail, customerMessage],
  );

  const busy = loadingPlan !== null;

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

      <section
        className={`mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6 ${
          error ? "mt-6 md:mt-6" : "mt-8 md:mt-10"
        }`}
        aria-labelledby="customer-details-heading"
      >
        <h2
          id="customer-details-heading"
          className="text-[15px] font-semibold tracking-tight text-black sm:text-base"
        >
          Dina uppgifter
        </h2>
        <p className="mt-1.5 text-[13px] text-gray-500 sm:text-sm">
          Namn och e-post krävs för att vi ska kunna återkomma till dig.
        </p>
        <div className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="order-customer-name"
                className="block text-[13px] font-medium text-gray-700 sm:text-sm"
              >
                Namn <span className="text-red-600">*</span>
              </label>
              <input
                id="order-customer-name"
                name="customer_name"
                type="text"
                autoComplete="name"
                value={customerName}
                disabled={busy}
                onChange={(e) => {
                  const v = e.target.value;
                  setCustomerName(v);
                  mergeOrderUploadDraft({ customer_name: v });
                }}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[13px] text-black outline-none ring-black/5 transition-shadow placeholder:text-gray-400 focus:border-gray-300 focus:ring-2 sm:text-sm"
                placeholder="För- och efternamn"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="order-customer-email"
                className="block text-[13px] font-medium text-gray-700 sm:text-sm"
              >
                E-post <span className="text-red-600">*</span>
              </label>
              <input
                id="order-customer-email"
                name="customer_email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={customerEmail}
                disabled={busy}
                onChange={(e) => {
                  const v = e.target.value;
                  setCustomerEmail(v);
                  mergeOrderUploadDraft({ customer_email: v });
                }}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[13px] text-black outline-none ring-black/5 transition-shadow placeholder:text-gray-400 focus:border-gray-300 focus:ring-2 sm:text-sm"
                placeholder="du@exempel.se"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="order-customer-message"
              className="block text-[13px] font-medium text-gray-700 sm:text-sm"
            >
              Meddelande till masteringtekniker
            </label>
            <textarea
              id="order-customer-message"
              name="customer_message"
              rows={4}
              value={customerMessage}
              disabled={busy}
              onChange={(e) => {
                const v = e.target.value;
                setCustomerMessage(v);
                mergeOrderUploadDraft({ customer_message: v });
              }}
              className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[13px] text-black outline-none ring-black/5 transition-shadow placeholder:text-gray-400 focus:border-gray-300 focus:ring-2 sm:text-sm"
              placeholder="Valfritt — referenser, önskemål om loudness, leveransdatum osv."
            />
          </div>
        </div>
      </section>

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
            disabled={busy}
            isLoading={loadingPlan === plan.title}
            onSelect={() => onSelectPlan(plan.title, plan.price)}
          />
        ))}
      </div>
    </>
  );
}
