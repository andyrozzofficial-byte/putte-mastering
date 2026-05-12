import type { OrderStatus } from "@/components/dashboard/order-status-badge";
import type { OrderRow } from "@/components/dashboard/orders-table";
import { formatPrice } from "@/lib/currency";

import { createStudioServerClient } from "@/lib/supabase/studio-server";

/** Columns we read from `public.orders` (extends insert shape with id + timestamps). */
export type OrdersDbRow = {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  track_name: string | null;
  service: string | null;
  status: string | null;
  /** Integer USD (whole dollars) from DB (`bigint`); PostgREST may return number or string. */
  price: string | number | null;
  notes: string | null;
  uploaded_file: string | null;
  mastered_file: string | null;
  created_at: string;
  /** Opaque token for `/delivery/[token]` (may be null on legacy rows). */
  delivery_access_token: string | null;
};

export type OrderMasterVersionRow = {
  id: string;
  order_id: string;
  storage_ref: string;
  version: number;
  created_at: string;
};

export type OrderRevisionRequestRow = {
  id: string;
  order_id: string;
  message: string;
  created_at: string;
};

export type StudioOrderDetail = {
  id: string;
  label: string;
  status: OrderStatus;
  customerShort: string;
  customerName: string;
  customerEmail: string;
  orderedAt: string;
  dateRelative: string;
  service: string;
  price: string;
  customerNote: string | null;
  sourceFile: {
    name: string;
    sizeLabel: string;
    durationLabel: string;
    formatLabel: string;
  };
};

export type DashboardOrderStats = {
  total: number;
  newOrders: number;
  completed: number;
  revenueUsd: number;
};

export function mapDbStatusToBadge(status: string | null): OrderStatus {
  const s = (status ?? "").toLowerCase().trim();
  if (s === "new" || s === "ny") return "new";
  if (
    s === "in_progress" ||
    s === "in progress" ||
    s === "pågår" ||
    s === "pagar"
  )
    return "in_progress";
  if (
    s === "waiting_revision" ||
    s === "waiting revision" ||
    s === "revision" ||
    s === "needs_revision" ||
    s === "needs revision"
  )
    return "waiting_revision";
  if (
    s === "klar" ||
    s === "completed" ||
    s === "complete" ||
    s === "done"
  )
    return "completed";
  return "new";
}

/** Parse stored price as whole USD dollars. */
export function parsePriceUsd(
  price: string | number | null | undefined,
): number {
  if (price == null) return 0;
  if (typeof price === "number")
    return Number.isFinite(price) ? Math.trunc(price) : 0;
  const normalized = price.replace(/\u00a0/g, " ").replace(/\s/g, "");
  const digits = normalized.replace(/[^\d]/g, "");
  const n = Number.parseInt(digits, 10);
  return Number.isFinite(n) ? n : 0;
}

function displayPriceFromDb(
  price: string | number | null | undefined,
): string {
  if (price == null) return "—";
  if (typeof price === "number") return formatPrice(price);
  const s = price.trim();
  if (!s) return "—";
  const n = parsePriceUsd(s);
  return n > 0 ? formatPrice(n) : s;
}

export function displayCustomerName(name: string | null | undefined): string {
  const t = (name ?? "").trim();
  return t.length > 0 ? t : "Ej angivet";
}

function customerShort(name: string | null | undefined): string {
  const t = (name ?? "").trim();
  if (!t) return "Kund";
  const parts = t.split(/\s+/);
  if (parts.length === 1) return parts[0];
  const last = parts[parts.length - 1];
  const initial = last[0] ? `${last[0]}.` : "";
  return `${parts[0]} ${initial}`.trim();
}

function basenameFromStorageRef(ref: string | null): string {
  if (!ref) return "";
  const i = ref.lastIndexOf("/");
  return i >= 0 ? ref.slice(i + 1) : ref;
}

export function formatOrderCreatedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function computeDashboardStats(rows: OrdersDbRow[]): DashboardOrderStats {
  let newOrders = 0;
  let completed = 0;
  let revenueUsd = 0;

  for (const row of rows) {
    const badge = mapDbStatusToBadge(row.status);
    if (badge === "new") newOrders += 1;
    if (badge === "completed") completed += 1;
    if (badge === "completed") revenueUsd += parsePriceUsd(row.price);
  }

  return {
    total: rows.length,
    newOrders,
    completed,
    revenueUsd,
  };
}

export function dbRowToOrderRow(row: OrdersDbRow): OrderRow {
  return {
    id: row.id,
    customer: displayCustomerName(row.customer_name),
    trackName: (row.track_name ?? "").trim() || "—",
    service: (row.service ?? "").trim() || "—",
    status: mapDbStatusToBadge(row.status),
    price: displayPriceFromDb(row.price),
    date: formatOrderCreatedAt(row.created_at),
  };
}

export function dbRowToStudioDetail(row: OrdersDbRow): StudioOrderDetail {
  const track = (row.track_name ?? "").trim();
  const shortId = row.id.slice(0, 8);
  const label = track.length > 0 ? track : `Order ${shortId}`;
  const fileName =
    basenameFromStorageRef(row.uploaded_file) ||
    track ||
    "Uppladdad fil";

  const orderedDate = new Date(row.created_at);
  const orderedAt = Number.isNaN(orderedDate.getTime())
    ? ""
    : orderedDate.toISOString().slice(0, 10);

  return {
    id: row.id,
    label,
    status: mapDbStatusToBadge(row.status),
    customerShort: customerShort(row.customer_name),
    customerName: displayCustomerName(row.customer_name),
    customerEmail: (row.customer_email ?? "").trim(),
    orderedAt,
    dateRelative: formatOrderCreatedAt(row.created_at),
    service: (row.service ?? "").trim() || "—",
    price: displayPriceFromDb(row.price),
    customerNote: (() => {
      const legacy = (row.notes ?? "").trim();
      return legacy.length > 0 ? legacy : null;
    })(),
    sourceFile: {
      name: fileName,
      sizeLabel: "—",
      durationLabel: "—",
      formatLabel: "—",
    },
  };
}

export async function fetchStudioOrders(): Promise<OrdersDbRow[]> {
  try {
    const supabase = await createStudioServerClient();
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, customer_name, customer_email, track_name, service, status, price, notes, uploaded_file, mastered_file, created_at, delivery_access_token",
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[studio] fetchStudioOrders failed:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return [];
    }

    return (data ?? []) as OrdersDbRow[];
  } catch (e) {
    console.error("[studio] fetchStudioOrders threw:", e);
    return [];
  }
}

export async function fetchStudioOrderById(
  id: string,
): Promise<OrdersDbRow | null> {
  try {
    const supabase = await createStudioServerClient();
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, customer_name, customer_email, track_name, service, status, price, notes, uploaded_file, mastered_file, created_at, delivery_access_token",
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("[studio] fetchStudioOrderById failed:", {
        id,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return null;
    }

    return data as OrdersDbRow | null;
  } catch (e) {
    console.error("[studio] fetchStudioOrderById threw:", { id, error: e });
    return null;
  }
}

export async function fetchOrderMasterVersions(
  orderId: string,
): Promise<OrderMasterVersionRow[]> {
  try {
    const supabase = await createStudioServerClient();
    const { data, error } = await supabase
      .from("order_master_versions")
      .select("id, order_id, storage_ref, version, created_at")
      .eq("order_id", orderId)
      .order("version", { ascending: false });

    if (error) {
      console.error("[studio] fetchOrderMasterVersions failed:", {
        orderId,
        message: error.message,
      });
      return [];
    }
    return (data ?? []) as OrderMasterVersionRow[];
  } catch (e) {
    console.error("[studio] fetchOrderMasterVersions threw:", { orderId, e });
    return [];
  }
}

export async function fetchOrderRevisionRequests(
  orderId: string,
): Promise<OrderRevisionRequestRow[]> {
  try {
    const supabase = await createStudioServerClient();
    const { data, error } = await supabase
      .from("order_revision_requests")
      .select("id, order_id, message, created_at")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[studio] fetchOrderRevisionRequests failed:", {
        orderId,
        message: error.message,
      });
      return [];
    }
    return (data ?? []) as OrderRevisionRequestRow[];
  } catch (e) {
    console.error("[studio] fetchOrderRevisionRequests threw:", { orderId, e });
    return [];
  }
}
