import Link from "next/link";
import type { Metadata } from "next";

import { DeliveryRevisionForm } from "@/components/delivery/revision-request-form";
import { OrderStatusBadge } from "@/components/dashboard/order-status-badge";
import type { OrderStatus } from "@/components/dashboard/order-status-badge";
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

function safeFormatDate(iso: string | null | undefined): string {
  if (typeof iso !== "string" || !iso.trim()) return "—";
  return formatOrderCreatedAt(iso);
}

function safeOrderStatus(raw: string | null | undefined): OrderStatus {
  return mapDbStatusToBadge(raw ?? null);
}

function normalizeVersionRows(rows: unknown[] | null | undefined): VersionRow[] {
  const out: VersionRow[] = [];
  if (!Array.isArray(rows)) return out;
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const id =
      typeof r.id === "string" && r.id.length > 0 ? r.id : `v-${i}-${String(r.version ?? "")}`;
    const vn = r.version;
    const version = typeof vn === "number" ? vn : Number(vn);
    const storage_ref = typeof r.storage_ref === "string" ? r.storage_ref : "";
    const created_at = typeof r.created_at === "string" ? r.created_at : "";
    if (!Number.isFinite(version) || !storage_ref) continue;
    out.push({ id, version, storage_ref, created_at });
  }
  out.sort((a, b) => b.version - a.version);
  return out;
}

function normalizeRevisionRows(rows: unknown[] | null | undefined): RevisionRow[] {
  const out: RevisionRow[] = [];
  if (!Array.isArray(rows)) return out;
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const id =
      typeof r.id === "string" && r.id.length > 0 ? r.id : `r-${i}-${String(r.created_at ?? "")}`;
    const message = typeof r.message === "string" ? r.message : "";
    const created_at = typeof r.created_at === "string" ? r.created_at : "";
    if (!message) continue;
    out.push({ id, message, created_at });
  }
  out.sort((a, b) => {
    const ta = new Date(a.created_at).getTime();
    const tb = new Date(b.created_at).getTime();
    if (Number.isNaN(ta) || Number.isNaN(tb)) return 0;
    return tb - ta;
  });
  return out;
}

export default async function DeliveryPage({ params }: PageProps) {
  let rawToken = "";
  try {
    const p = await params;
    rawToken = typeof p?.token === "string" ? p.token : "";
  } catch (e) {
    console.error("[delivery-page] params await failed", {
      message: e instanceof Error ? e.message : String(e),
    });
    return deliveryUnavailable(
      "We could not open this page.",
      "Something went wrong while loading the link. Please try again or use the link from your email.",
    );
  }

  const token = decodeURIComponent(rawToken).trim();
  if (!token) {
    return invalidLink();
  }

  let supabase;
  try {
    supabase = createServiceRoleSupabaseClient();
  } catch (e) {
    console.error("[delivery-page] supabase init failed", {
      message: e instanceof Error ? e.message : String(e),
    });
    return deliveryUnavailable(
      "Delivery temporarily unavailable",
      "The server could not connect to storage. Please try again shortly.",
    );
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, track_name, status, service, created_at, mastered_file, delivery_access_token",
    )
    .eq("delivery_access_token", token)
    .maybeSingle();

  if (orderError) {
    console.error("[delivery-page] order query failed", {
      message: orderError.message,
      code: orderError.code,
      details: orderError.details,
      hint: orderError.hint,
    });
    return deliveryUnavailable(
      "We could not load this delivery.",
      "Please check your link or try again in a few minutes.",
    );
  }

  if (!order || typeof order !== "object") {
    return invalidLink();
  }

  const access = order.delivery_access_token;
  if (typeof access !== "string" || !access.trim()) {
    return invalidLink();
  }

  const orderId = typeof order.id === "string" && order.id.length > 0 ? order.id : null;
  if (!orderId) {
    console.error("[delivery-page] order missing id", { tokenPrefix: token.slice(0, 8) });
    return deliveryUnavailable(
      "We could not load this delivery.",
      "Order data was incomplete. Please contact support if this keeps happening.",
    );
  }

  let versionRows: unknown[] | null = null;
  let revisionRows: unknown[] | null = null;

  try {
    const [vRes, rRes] = await Promise.all([
      supabase
        .from("order_master_versions")
        .select("id, version, storage_ref, created_at")
        .eq("order_id", orderId)
        .order("version", { ascending: false }),
      supabase
        .from("order_revision_requests")
        .select("id, message, created_at")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false }),
    ]);

    if (vRes.error) {
      console.error("[delivery-page] versions query failed", {
        message: vRes.error.message,
        code: vRes.error.code,
      });
    } else {
      versionRows = vRes.data;
    }

    if (rRes.error) {
      console.error("[delivery-page] revisions query failed", {
        message: rRes.error.message,
        code: rRes.error.code,
      });
    } else {
      revisionRows = rRes.data;
    }
  } catch (e) {
    console.error("[delivery-page] parallel queries threw", {
      message: e instanceof Error ? e.message : String(e),
    });
    return deliveryUnavailable(
      "We could not load this delivery.",
      "Please try again in a few minutes.",
    );
  }

  const versions = normalizeVersionRows(versionRows);
  const revisions = normalizeRevisionRows(revisionRows);

  const status = safeOrderStatus(
    order.status == null ? null : String(order.status),
  );
  const label =
    typeof order.track_name === "string" && order.track_name.trim()
      ? order.track_name.trim()
      : `Order ${orderId.slice(0, 8)}`;
  const service =
    typeof order.service === "string" && order.service.trim() ? order.service.trim() : "—";
  const latestVersion = versions[0];
  const mastered =
    typeof order.mastered_file === "string" && order.mastered_file.trim()
      ? order.mastered_file.trim()
      : null;

  const downloadHref = latestVersion
    ? `/api/delivery/${encodeURIComponent(token)}/download`
    : mastered
      ? `/api/delivery/${encodeURIComponent(token)}/download`
      : null;

  const deliveryDateLabel = latestVersion?.created_at
    ? safeFormatDate(latestVersion.created_at)
    : "—";

  const createdAt =
    typeof order.created_at === "string" && order.created_at.length > 0
      ? safeFormatDate(order.created_at)
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
              Service: <span className="font-medium text-black">{service}</span>
            </p>
            <p className="mt-1 text-[13px] text-gray-500 sm:text-sm">
              Status:{" "}
              <span className="font-medium text-black">{statusLabel(status)}</span>
            </p>
            <p className="mt-1 text-[13px] text-gray-500 sm:text-sm">
              Order placed: <span className="font-medium text-black">{createdAt}</span>
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
              Your master is not ready yet. You will receive an email when it is uploaded.
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
                      {basenameFromRef(v.storage_ref)} · {safeFormatDate(v.created_at)}
                    </span>
                  </div>
                  {idx === 0 ? null : (
                    <a
                      className="shrink-0 text-gray-600 underline decoration-gray-300 underline-offset-4 hover:text-black"
                      href={`/api/delivery/${encodeURIComponent(token)}/download?version=${encodeURIComponent(String(v.version))}`}
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
                    {safeFormatDate(r.created_at)}
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
          This delivery link is invalid. Please use the link from your email or contact us for
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

function deliveryUnavailable(title: string, body: string) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col px-5 pb-16 pt-12 sm:px-6 md:pt-16">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-xl font-semibold tracking-tight text-black sm:text-2xl">{title}</h1>
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

function statusLabel(status: OrderStatus): string {
  if (status === "new") return "New";
  if (status === "in_progress") return "In progress";
  if (status === "waiting_revision") return "Waiting revision";
  return "Completed";
}
