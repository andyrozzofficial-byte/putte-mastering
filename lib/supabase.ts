import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

/**
 * Columns sent on INSERT into `public.orders` (excluding DB defaults: `id`, `created_at`).
 * Must stay in sync with the Supabase table definition.
 */
/** INSERT columns on `public.orders` (excluding defaults), sorted for payload checks. */
export const ORDERS_INSERT_COLUMNS = [
  "customer_email",
  "customer_name",
  "mastered_file",
  "notes",
  "price",
  "service",
  "status",
  "track_name",
  "uploaded_file",
] as const;

/** Row shape for inserts into the public `orders` table (matches Supabase column names). */
export type OrderInsert = {
  customer_name: string;
  customer_email: string;
  /** Optional note from customer; stored in `notes` for current schema compatibility. */
  customer_message: string;
  track_name: string;
  service: string;
  status: string;
  /** Storage reference `bucket/path` (private buckets OK). */
  uploaded_file: string | null;
  mastered_file: string | null;
  /** Display label from UI (e.g. `"$60"`); stored as integer USD dollars in `orders.price`. */
  price: string;
};

/** Maps plan labels like `"$60"` → `60` for `bigint` / integer `price` column (whole USD). */
export function parseOrderPriceLabelToUsd(label: string): number {
  const normalized = label.replace(/\u00a0/g, " ").replace(/\s/g, "");
  const digits = normalized.replace(/[^\d]/g, "");
  const n = Number.parseInt(digits, 10);
  return Number.isFinite(n) ? n : 0;
}
/**
 * Browser/client-side Supabase client (uses the anon key).
 * Only call from Client Components or client-side handlers.
 */
/** Anonymous/public flows (customer upload + order insert). Cookie-less browser client. */
export function createSupabaseClient(): SupabaseClient {
  return createClient(getSupabaseUrl(), getSupabaseAnonKey());
}
