import Link from "next/link";
import type { Metadata } from "next";

import { OrderStatusBadge } from "@/components/dashboard/order-status-badge";
import { verifyDeliveryToken } from "@/lib/delivery/token";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import { mapDbStatusToBadge, formatOrderCreatedAt } from "@/lib/studio/orders-data";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
};

export const metadata: Metadata = {
  title: "Delivery",
  description: "Download your finished master.",
};

export default async function DeliveryPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { token } = await searchParams;

  if (!token || !verifyDeliveryToken(id, token)) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col px-5 pb-16 pt-12 sm:px-6 md:pt-16">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-xl font-semibold tracking-tight text-black sm:text-2xl">
            Invalid link
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-gray-600 sm:text-sm">
            This delivery link is invalid or expired. Please contact us if you need
            help.
          </p>
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

  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, track_name, status, mastered_file, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col px-5 pb-16 pt-12 sm:px-6 md:pt-16">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-xl font-semibold tracking-tight text-black sm:text-2xl">
            Delivery unavailable
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-gray-600 sm:text-sm">
            We couldn’t load this delivery right now. Please try again later.
          </p>
        </div>
      </main>
    );
  }

  const status = mapDbStatusToBadge(data.status ?? null);
  const label = (data.track_name ?? "").trim() || `Order ${data.id.slice(0, 8)}`;
  const downloadHref = data.mastered_file
    ? `/api/delivery/${id}/download?token=${encodeURIComponent(token)}`
    : null;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col px-5 pb-16 pt-12 sm:px-6 md:pt-16">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight text-black sm:text-2xl">
              {label}
            </h1>
            <p className="mt-1 text-[13px] text-gray-500 sm:text-sm">
              Status: <span className="font-medium text-black">{statusLabel(status)}</span>
            </p>
            <p className="mt-1 text-[13px] text-gray-500 sm:text-sm">
              Order date: <span className="font-medium text-black">{formatOrderCreatedAt(data.created_at)}</span>
            </p>
          </div>
          <div className="shrink-0">
            <OrderStatusBadge status={status} />
          </div>
        </div>

        <div className="mt-8">
          {downloadHref ? (
            <a
              href={downloadHref}
              className="inline-flex w-full items-center justify-center rounded-lg bg-black px-4 py-2.5 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-black/90 sm:w-auto sm:text-sm"
            >
              Download master
            </a>
          ) : (
            <p className="text-[13px] text-gray-600 sm:text-sm">
              Your master isn’t ready yet. Please check back later.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

function statusLabel(status: ReturnType<typeof mapDbStatusToBadge>): string {
  if (status === "new") return "New";
  if (status === "in_progress") return "In progress";
  if (status === "waiting_revision") return "Waiting revision";
  return "Completed";
}

