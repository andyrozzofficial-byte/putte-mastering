import Link from "next/link";
import type { Metadata } from "next";

import { deliveryPortalAbsoluteUrl } from "@/lib/delivery/app-url";
import { fulfillCheckoutSessionById } from "@/lib/stripe/fulfill-checkout-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order received",
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
        title="We could not open your confirmation"
        body="If you completed payment, check your email for a confirmation message or contact the studio."
      />
    );
  }

  if (process.env.NEXT_PUBLIC_TEST_MODE === "true") {
    return (
      <StatusCard
        title="We could not open your confirmation"
        body="Online checkout is not available in test mode. Please contact the studio if you need help."
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
        title="We could not open your confirmation"
        body="If your payment went through, you should receive a confirmation email shortly. You can also contact the studio for help."
      />
    );
  }

  const { confirmation } = result;
  const portalUrl = deliveryPortalAbsoluteUrl(result.deliveryAccessToken);

  const checklist = [
    {
      label: "File uploaded",
      detail: "Your audio file was received successfully.",
    },
    {
      label: "Payment received",
      detail: "Your payment was processed successfully.",
    },
    {
      label: "Confirmation email sent",
      detail: "Check your inbox for order details and updates.",
    },
    {
      label: "Estimated delivery",
      detail: confirmation.deliveryTime,
    },
  ] as const;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col px-5 pb-16 pt-12 sm:px-6 md:pt-16">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col items-center text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl"
            aria-hidden
          >
            ✅
          </div>
          <h1 className="mt-5 text-xl font-semibold tracking-tight text-black sm:text-2xl">
            Order received
          </h1>
          <p className="mt-2 max-w-md text-[13px] leading-relaxed text-gray-600 sm:text-sm">
            Thank you — your mastering order is in the queue. We&apos;ll email you when
            your master is ready.
          </p>
        </div>

        <dl className="mt-8 space-y-4 rounded-xl border border-gray-100 bg-neutral-50/50 p-5 text-[13px] sm:text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-6">
            <dt className="text-gray-500">File</dt>
            <dd className="break-all font-medium text-black">{confirmation.fileName}</dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-6">
            <dt className="text-gray-500">Track</dt>
            <dd className="font-medium text-black">{confirmation.trackName}</dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-6">
            <dt className="text-gray-500">Service</dt>
            <dd className="font-medium text-black">{confirmation.service}</dd>
          </div>
        </dl>

        <ul className="mt-6 space-y-3">
          {checklist.map((item) => (
            <li
              key={item.label}
              className="flex gap-3 rounded-lg border border-gray-100 px-4 py-3 text-[13px] sm:text-sm"
            >
              <span className="mt-0.5 shrink-0 text-emerald-600" aria-hidden>
                ✓
              </span>
              <span>
                <span className="font-medium text-black">{item.label}</span>
                <span className="mt-0.5 block text-gray-600">{item.detail}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white px-4 py-4 text-center text-[13px] sm:text-sm">
          <p className="font-medium text-black">Your delivery portal</p>
          <p className="mt-1 text-gray-600">
            Download your finished master and request revisions from one place.
          </p>
          <a
            href={portalUrl}
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-black px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-black/90 sm:text-sm"
          >
            Open delivery portal
          </a>
        </div>

        <div className="mt-8 flex justify-center">
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

function StatusCard({ title, body }: { title: string; body: string }) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col px-5 pb-16 pt-12 sm:px-6 md:pt-16">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-xl font-semibold tracking-tight text-black sm:text-2xl">
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
