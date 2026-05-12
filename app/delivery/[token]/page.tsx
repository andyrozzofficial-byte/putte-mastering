import Link from "next/link";
import type { Metadata } from "next";

import { DeliveryRevisionForm } from "@/components/delivery/revision-request-form";
import { OrderStatusBadge } from "@/components/dashboard/order-status-badge";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import {
  formatOrderCreatedAt,
  mapDbStatusToBadge,
} from "@/lib/studio/orders-data";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ token: string }>;
};

export const metadata: Metadata = {
  title: "Delivery",
  description: "Download your finished master.",
};

type VersionRow = {
  id: string;
  version: number;
  storage_ref: string;
  created_at: string;
};

type RevisionRow = {
  id: string;
  message: string;
  created_at: string;
};

function basenameFromRef(ref: string): string {
  const i = ref.lastIndexOf("/");
  return i >= 0 ? ref.slice(i + 1) : ref;
}

export default async function DeliveryPage({ params }: PageProps) {
  const { token: rawToken } = await params;
  const token = decodeURIComponent(rawToken).trim();

  if (!token) {
    return invalidLink();
  }

  const supabase = createServiceRoleSupabaseClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      track_name,
      status,
      service,
      created_at,
      mastered_file,
      delivery_access_token,
      order_master_versions ( id, version, storage_ref, created_at ),
      order_revision_requests ( id, message, created_at )
    `,
    )
    .eq("delivery_access_token", token)
    .maybeSingle();

  if (error || !order?.delivery_access_token) {
    return invalidLink();
  }

  const versions = (order.order_master_versions ?? []) as VersionRow[];
  const revisions = (order.order_revision_requests ?? []) as RevisionRow[];

  versions.sort((a, b) => b.version - a.version);
  revisions.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const status = mapDbStatusToBadge(order.status ?? null);
  const label =
    (order.track_name ?? "").trim() || `Order ${(order.id as string).slice(0, 8)}`;
  const service = (order.service ?? "").trim() || "—";
  const latestVersion = versions[0];
  const downloadHref = latestVersion
    ? `/api/delivery/${encodeURIComponent(token)}/download`
    : order.mastered_file
      ? `/api/delivery/${encodeURIComponent(token)}/download`
      : null;

  const deliveryDateLabel = latestVersion
    ? formatOrderCreatedAt(latestVersion.created_at)
    : "—";

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col px-5 pb-16 pt-12 sm:px-6 md:pt-16">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight text-black sm:text-2xl">
              {label}
            </h1>
            <p className="mt-1 text-[13px] text-gray-500 sm:text-sm">
              Service:{" "}
              <span className="font-medium text-black">{service}</span>
            </p>
            <p className="mt-1 text-[13px] text-gray-500 sm:text-sm">
              Status:{" "}
              <span className="font-medium text-black">{statusLabel(status)}</span>
            </p>
            <p className="mt-1 text-[13px] text-gray-500 sm:text-sm">
              Order placed:{" "}
              <span className="font-medium text-black">
                {formatOrderCreatedAt(order.created_at as string)}
              </span>
            </p>
            <p className="mt-1 text-[13px] text-gray-500 sm:text-sm">
              Latest master:{" "}
              <span className="font-medium text-black">{deliveryDateLabel}</span>
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
              Download latest master
            </a>
          ) : (
            <p className="text-[13px] text-gray-600 sm:text-sm">
              Your master is not ready yet. You will receive an email when it is
              uploaded.
            </p>
          )}
        </div>

        {versions.length > 0 ? (
          <div className="mt-10 border-t border-gray-100 pt-8">
            <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">
              Master versions
            </h2>
            <ul className="mt-4 space-y-3 text-[13px] sm:text-sm">
              {versions.map((v, idx) => (
                <li
                  key={v.id}
                  className="flex flex-col gap-1 rounded-lg border border-gray-100 bg-neutral-50/40 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <span className="font-medium text-black">
                      Version {v.version}
                      {idx === 0 ? (
                        <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-900">
                          Latest
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-gray-500">
                      {basenameFromRef(v.storage_ref)} ·{" "}
                      {formatOrderCreatedAt(v.created_at)}
                    </span>
                  </div>
                  {idx === 0 ? null : (
                    <a
                      className="shrink-0 text-gray-600 underline decoration-gray-300 underline-offset-4 hover:text-black"
                      href={`/api/delivery/${encodeURIComponent(token)}/download?version=${v.version}`}
                    >
                      Download
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {revisions.length > 0 ? (
          <div className="mt-10 border-t border-gray-100 pt-8">
            <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">
              Your revision notes
            </h2>
            <ul className="mt-4 space-y-3 text-[13px] text-gray-700 sm:text-sm">
              {revisions.map((r) => (
                <li
                  key={r.id}
                  className="rounded-lg border border-gray-100 bg-white px-3 py-2.5 leading-relaxed"
                >
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                    {formatOrderCreatedAt(r.created_at)}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap">{r.message}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <DeliveryRevisionForm accessToken={token} />
      </div>
    </main>
  );
}

function invalidLink() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col px-5 pb-16 pt-12 sm:px-6 md:pt-16">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-xl font-semibold tracking-tight text-black sm:text-2xl">
          Invalid link
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-gray-600 sm:text-sm">
          This delivery link is invalid. Please use the link from your email or contact
          us for help.
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

function statusLabel(status: ReturnType<typeof mapDbStatusToBadge>): string {
  if (status === "new") return "New";
  if (status === "in_progress") return "In progress";
  if (status === "waiting_revision") return "Waiting revision";
  return "Completed";
}
