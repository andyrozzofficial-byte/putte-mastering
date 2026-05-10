import { OrderStatusBadge } from "@/components/dashboard/order-status-badge";
import { CustomerSourceFile } from "@/components/studio/customer-source-file";
import { DeliveryMasterUpload } from "@/components/studio/delivery-master-upload";
import { getStudioOrder } from "@/lib/studio-orders";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const order = getStudioOrder(id);
  return {
    title: order ? `${order.label} — Studio` : "Order — Studio",
  };
}

export default async function StudioOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = getStudioOrder(id);
  if (!order) notFound();

  return (
    <main className="flex-1 bg-neutral-50/40 px-4 pb-16 pt-6 md:px-8 md:pb-20 md:pt-8 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/studio/ordrar"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-black"
        >
          <ArrowLeftIcon />
          Tillbaka
        </Link>

        <header className="mt-10 flex flex-col items-center gap-4 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-6">
          <span className="hidden md:block" aria-hidden />
          <h1 className="text-center text-2xl font-semibold tracking-tight text-black md:text-3xl">
            {order.label}
          </h1>
          <div className="flex justify-center md:justify-end">
            <OrderStatusBadge status={order.status} />
          </div>
        </header>

        <section className="mt-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">
            Kund
          </h2>
          <dl className="mt-6 space-y-4 text-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:gap-8">
              <dt className="w-28 shrink-0 text-gray-500">Namn</dt>
              <dd className="font-medium text-black">{order.customerName}</dd>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:gap-8">
              <dt className="w-28 shrink-0 text-gray-500">E-post</dt>
              <dd>
                <a
                  href={`mailto:${order.customerEmail}`}
                  className="font-medium text-black underline decoration-gray-300 underline-offset-4 hover:decoration-black"
                >
                  {order.customerEmail}
                </a>
              </dd>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:gap-8">
              <dt className="w-28 shrink-0 text-gray-500">Datum</dt>
              <dd className="text-black">
                {new Date(`${order.orderedAt}T12:00:00`).toLocaleDateString(
                  "sv-SE",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  },
                )}
                <span className="mt-0.5 block text-sm font-normal text-gray-500">
                  {order.dateRelative}
                </span>
              </dd>
            </div>
          </dl>
        </section>

        <div className="mt-8 space-y-8">
          <CustomerSourceFile
            fileName={order.sourceFile.name}
            formatLabel={order.sourceFile.formatLabel}
            durationLabel={order.sourceFile.durationLabel}
            sizeLabel={order.sourceFile.sizeLabel}
          />

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">
              Orderdetaljer
            </h2>
            <dl className="mt-6 space-y-5 text-sm">
              <div className="flex flex-col gap-1 border-b border-gray-100 pb-5 sm:flex-row sm:gap-8">
                <dt className="w-36 shrink-0 text-gray-500">Vald tjänst</dt>
                <dd className="font-medium text-black">{order.service}</dd>
              </div>
              <div className="flex flex-col gap-1 border-b border-gray-100 pb-5 sm:flex-row sm:gap-8">
                <dt className="w-36 shrink-0 text-gray-500">Pris</dt>
                <dd className="font-medium text-black">{order.price}</dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-8">
                <dt className="w-36 shrink-0 text-gray-500 pt-0.5">
                  Meddelande från kund
                </dt>
                <dd className="leading-relaxed text-gray-700">
                  {order.customerNote ?? (
                    <span className="text-gray-400">Inget meddelande.</span>
                  )}
                </dd>
              </div>
            </dl>
          </section>

          <DeliveryMasterUpload />
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
