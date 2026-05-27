import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order received",
  description: "Your mastering order has been received.",
};

type PageProps = {
  searchParams: Promise<{ mode?: string }>;
};

export default async function OrderConfirmPage({ searchParams }: PageProps) {
  const { mode } = await searchParams;
  const test = mode === "test";

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col px-5 pb-16 pt-12 sm:px-6 md:pt-16">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-xl font-semibold tracking-tight text-black sm:text-2xl">
          Order received
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-gray-600 sm:text-sm">
          {test
            ? "Test mode is enabled — payment was skipped. Your order was saved and will appear in the Studio dashboard."
            : "Thanks — your order was saved. You’ll receive updates by email."}
        </p>

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

