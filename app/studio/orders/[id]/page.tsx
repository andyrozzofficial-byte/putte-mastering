import { OrderStatusBadge } from "@/components/dashboard/order-status-badge";
import { CustomerSourceFile } from "@/components/studio/customer-source-file";
import { DeliveryMasterUpload } from "@/components/studio/delivery-master-upload";
import { OrderStatusActions } from "@/components/studio/order-status-actions";
import { deliveryPortalAbsoluteUrl } from "@/lib/delivery/app-url";
import {
  dbRowToStudioDetail,
  fetchOrderMasterVersions,
  fetchOrderRevisionRequests,
  fetchStudioOrderById,
  formatOrderCreatedAt,
} from "@/lib/studio/orders-data";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const row = await fetchStudioOrderById(id);
  const order = row ? dbRowToStudioDetail(row) : null;
  return {
    title: order ? `${order.label} — Studio` : "Order — Studio",
  };
}

export default async function StudioOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const row = await fetchStudioOrderById(id);
  if (!row) notFound();

  const order = dbRowToStudioDetail(row);
  const [masterVersions, revisionRequests] = await Promise.all([
    fetchOrderMasterVersions(id),
    fetchOrderRevisionRequests(id),
  ]);

  const portalToken = (row.delivery_access_token ?? "").trim();
  const customerPortalUrl = portalToken
    ? deliveryPortalAbsoluteUrl(portalToken)
    : "";
  const currentVersion =
    masterVersions.length > 0
      ? Math.max(...masterVersions.map((v) => v.version))
      : null;

  return (
    <main className="flex-1 bg-neutral-50/40 px-4 pb-12 pt-5 md:px-7 md:pb-16 md:pt-7 lg:px-10">
      <div className="mx-auto max-w-2xl lg:max-w-3xl">
        <Link
          href="/studio/ordrar"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 transition-colors hover:text-black sm:text-sm"
        >
          <ArrowLeftIcon />
          Back
        </Link>

        <header className="mt-8 flex flex-col items-center gap-3 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-5">
          <span className="hidden md:block" aria-hidden />
          <h1 className="text-center text-[1.375rem] font-semibold tracking-tight text-black sm:text-xl md:text-2xl">
            {order.label}
          </h1>
          <div className="flex justify-center md:justify-end">
            <OrderStatusBadge status={order.status} />
          </div>
        </header>

        <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">
            Customer
          </h2>
          <dl className="mt-5 space-y-3 text-[13px] sm:text-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:gap-8">
              <dt className="w-28 shrink-0 text-gray-500">Name</dt>
              <dd className="font-medium text-black">{order.customerName}</dd>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:gap-8">
              <dt className="w-28 shrink-0 text-gray-500">Email</dt>
              <dd>
                {order.customerEmail.trim().length > 0 ? (
                  <a
                    href={`mailto:${order.customerEmail}`}
                    className="font-medium text-black underline decoration-gray-300 underline-offset-4 hover:decoration-black"
                  >
                    {order.customerEmail}
                  </a>
                ) : (
                  <span className="font-medium text-gray-400">Not provided</span>
                )}
              </dd>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:gap-8">
              <dt className="w-28 shrink-0 text-gray-500">Date</dt>
              <dd className="text-black">
                {order.orderedAt.length > 0 ? (
                  new Date(`${order.orderedAt}T12:00:00`).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                ) : (
                  <span className="text-gray-400">—</span>
                )}
                <span className="mt-0.5 block text-sm font-normal text-gray-500">
                  {order.dateRelative}
                </span>
              </dd>
            </div>
          </dl>
        </section>

        <div className="mt-6 space-y-6 md:space-y-7">
          <CustomerSourceFile
            fileName={order.sourceFile.name}
            formatLabel={order.sourceFile.formatLabel}
            durationLabel={order.sourceFile.durationLabel}
            sizeLabel={order.sourceFile.sizeLabel}
          />

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
            <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">
              Order details
            </h2>
            <dl className="mt-5 space-y-4 text-[13px] sm:text-sm">
              <div className="flex flex-col gap-1 border-b border-gray-100 pb-4 sm:flex-row sm:gap-8">
                <dt className="w-36 shrink-0 text-gray-500">Service</dt>
                <dd className="font-medium text-black">{order.service}</dd>
              </div>
              <div className="flex flex-col gap-1 border-b border-gray-100 pb-4 sm:flex-row sm:gap-8">
                <dt className="w-36 shrink-0 text-gray-500">Price</dt>
                <dd className="font-medium text-black">{order.price}</dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-8">
                <dt className="w-36 shrink-0 text-gray-500 pt-0.5">
                  Customer message
                </dt>
                <dd className="leading-relaxed text-gray-700">
                  {order.customerNote ?? (
                    <span className="text-gray-400">No message.</span>
                  )}
                </dd>
              </div>
            </dl>
          </section>

          <OrderStatusActions orderId={order.id} currentStatus={order.status} />

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
            <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">
              Customer delivery
            </h2>
            <dl className="mt-5 space-y-3 text-[13px] sm:text-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-8">
                <dt className="w-36 shrink-0 text-gray-500">Current version</dt>
                <dd className="font-medium text-black">
                  {currentVersion != null ? `v${currentVersion}` : "—"}
                </dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-8">
                <dt className="w-36 shrink-0 text-gray-500">Master ready at</dt>
                <dd className="font-medium text-black">
                  {row.delivery_completed_at
                    ? formatOrderCreatedAt(row.delivery_completed_at)
                    : "—"}
                </dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-8">
                <dt className="w-36 shrink-0 text-gray-500">Customer downloads</dt>
                <dd className="font-medium text-black">
                  {row.delivery_download_count ?? 0}
                </dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-8">
                <dt className="w-36 shrink-0 text-gray-500">Last download</dt>
                <dd className="font-medium text-black">
                  {row.delivery_last_downloaded_at
                    ? formatOrderCreatedAt(row.delivery_last_downloaded_at)
                    : "—"}
                </dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-8">
                <dt className="w-36 shrink-0 text-gray-500">Portal link</dt>
                <dd className="min-w-0 break-all">
                  {customerPortalUrl ? (
                    <a
                      href={customerPortalUrl}
                      className="font-medium text-black underline decoration-gray-300 underline-offset-4 hover:decoration-black"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {customerPortalUrl}
                    </a>
                  ) : (
                    <span className="text-gray-400">
                      Will appear after the next master upload (legacy orders without a
                      token).
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </section>

          {revisionRequests.length > 0 ? (
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
              <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">
                Revision requests
              </h2>
              <ul className="mt-4 space-y-3 text-[13px] text-gray-800 sm:text-sm">
                {revisionRequests.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-lg border border-gray-100 bg-neutral-50/40 px-3 py-2.5"
                  >
                    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                      {formatOrderCreatedAt(r.created_at)}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap leading-relaxed">
                      {r.message}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {masterVersions.length > 0 ? (
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
              <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">
                Master upload history
              </h2>
              <ul className="mt-4 space-y-2 text-[13px] sm:text-sm">
                {masterVersions.map((v) => (
                  <li
                    key={v.id}
                    className="flex flex-col justify-between gap-1 rounded-lg border border-gray-100 px-3 py-2 sm:flex-row sm:items-center"
                  >
                    <span className="font-medium text-black">
                      Version {v.version}
                      {v.version === currentVersion ? (
                        <span className="ml-2 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-900">
                          Latest
                        </span>
                      ) : null}
                    </span>
                    <span className="text-gray-500">
                      {formatOrderCreatedAt(v.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <DeliveryMasterUpload orderId={order.id} />
        </div>
      </div>
    </main>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}
