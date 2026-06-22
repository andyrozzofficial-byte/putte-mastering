import Link from "next/link";
import type { Metadata } from "next";

import { deliveryPortalAbsoluteUrl } from "@/lib/delivery/app-url";
import { fulfillCheckoutSessionById } from "@/lib/stripe/fulfill-checkout-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment received",
  description: "Your mastering order has been received.",
};

type PageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function OrderSuccessPage({ searchParams }: PageProps) {
  const { session_id: sessionId } = await searchParams;
  const trimmed = typeof sessionId === "string" ? sessionId.trim() : "";

  if (!trimmed) {
    return (
      <StatusCard
        title="Missing payment reference"
        body="We could not link this page to your checkout session. If you completed payment, check your email or contact the studio."
        variant="error"
      />
    );
  }

  if (process.env.NEXT_PUBLIC_TEST_MODE === "true") {
    return (
      <StatusCard
        title="Test mode active"
        body="Stripe fulfillment is disabled while NEXT_PUBLIC_TEST_MODE is enabled."
        variant="error"
      />
    );
  }

  const result = await fulfillCheckoutSessionById(trimmed, {
    logTag: "[order-success]",
    sendCustomerEmail: true,
  });

  if (!result.ok) {
    return (
      <StatusCard
        title="We could not confirm your order yet"
        body={`${result.reason} Your payment may still have gone through — contact the studio with your checkout reference.`}
        variant="error"
      />
    );
  }

  const portalUrl = deliveryPortalAbsoluteUrl(result.deliveryAccessToken);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col px-5 pb-16 pt-12 sm:px-6 md:pt-16">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-xl font-semibold tracking-tight text-black sm:text-2xl">
          Payment received
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-gray-600 sm:text-sm">
          {result.alreadyExisted
            ? "Your order was already registered. You can open your delivery page below."
            : "Thanks — your payment was received and your order is now in the studio queue. You’ll also get updates by email."}
        </p>

        <div className="mt-6 rounded-lg border border-gray-100 bg-neutral-50/50 px-4 py-3 text-[13px] text-gray-600 sm:text-sm">
          <p>
            Delivery page:{" "}
            <a
              href={portalUrl}
              className="font-medium text-black underline decoration-gray-300 underline-offset-4 hover:decoration-black"
            >
              Open delivery portal
            </a>
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-medium text-black shadow-sm transition-colors hover:bg-gray-50 sm:text-sm"
          >
            Back to homepage
          </Link>
          <Link
            href="/studio"
            className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2.5 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-black/90 sm:text-sm"
          >
            Open Studio
          </Link>
        </div>
      </div>
    </main>
  );
}

function StatusCard({
  title,
  body,
  variant,
}: {
  title: string;
  body: string;
  variant: "error";
}) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col px-5 pb-16 pt-12 sm:px-6 md:pt-16">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <h1
          className={`text-xl font-semibold tracking-tight sm:text-2xl ${
            variant === "error" ? "text-red-900" : "text-black"
          }`}
        >
          {title}
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-gray-600 sm:text-sm">{body}</p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-medium text-black shadow-sm transition-colors hover:bg-gray-50 sm:text-sm"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
