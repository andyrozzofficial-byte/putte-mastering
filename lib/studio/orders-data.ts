import type { OrderStatus } from "@/components/dashboard/order-status-badge";
import type { OrderRow } from "@/components/dashboard/orders-table";

import { createStudioServerClient } from "@/lib/supabase/studio-server";

/** Columns we read from `public.orders` (extends insert shape with id + timestamps). */
export type OrdersDbRow = {
  id: string;
  customer_name: string | null;
  track_name: string | null;
  service: string | null;
  status: string | null;
  /** Integer SEK from DB (`bigint`); PostgREST may return number or string. */
  price: string | number | null;
  notes: string | null;
  uploaded_file: string | null;
  mastered_file: string | null;
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
  revenueKr: number;
};

export function mapDbStatusToBadge(status: string | null): OrderStatus {
  const s = (status ?? "").toLowerCase().trim();
  if (s === "new" || s === "ny") return "ny";
  if (
    s === "in_progress" ||
    s === "in progress" ||
    s === "pågår" ||
    s === "pagar"
  )
    return "in_progress";
  if (
    s === "klar" ||
    s === "completed" ||
    s === "complete" ||
    s === "done"
  )
    return "klar";
  return "ny";
}

export function parsePriceToKr(
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
  if (typeof price === "number") return formatKr(price);
  const s = price.trim();
  if (!s) return "—";
  const n = parsePriceToKr(s);
  return n > 0 ? formatKr(n) : s;
}

export function formatKr(amount: number): string {
  return `${amount.toLocaleString("sv-SE")} kr`;
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
  let revenueKr = 0;

  for (const row of rows) {
    const badge = mapDbStatusToBadge(row.status);
    if (badge === "ny") newOrders += 1;
    if (badge === "klar") completed += 1;
    revenueKr += parsePriceToKr(row.price);
  }

  return {
    total: rows.length,
    newOrders,
    completed,
    revenueKr,
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
    customerEmail: "",
    orderedAt,
    dateRelative: formatOrderCreatedAt(row.created_at),
    service: (row.service ?? "").trim() || "—",
    price: displayPriceFromDb(row.price),
    customerNote: row.notes?.trim() ? row.notes : null,
    sourceFile: {
      name: fileName,
      sizeLabel: "—",
      durationLabel: "—",
      formatLabel: "—",
    },
  };
}

export async function fetchStudioOrders(): Promise<OrdersDbRow[]> {
  const supabase = await createStudioServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, customer_name, track_name, service, status, price, notes, uploaded_file, mastered_file, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as OrdersDbRow[];
}

export async function fetchStudioOrderById(
  id: string,
): Promise<OrdersDbRow | null> {
  const supabase = await createStudioServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, customer_name, track_name, service, status, price, notes, uploaded_file, mastered_file, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as OrdersDbRow | null;
}
