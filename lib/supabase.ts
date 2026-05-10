import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

/** Row shape for inserts into the public `orders` table (matches Supabase column names). */
export type OrderInsert = {
  customer_name: string;
  track_name: string;
  service: string;
  status: string;
  notes: string;
  /** Storage reference `bucket/path` (private buckets OK). */
  uploaded_file: string | null;
  mastered_file: string | null;
  price: string;
};

/**
 * Browser/client-side Supabase client (uses the anon key).
 * Only call from Client Components or client-side handlers.
 */
/** Anonymous/public flows (customer upload + order insert). Cookie-less browser client. */
export function createSupabaseClient(): SupabaseClient {
  return createClient(getSupabaseUrl(), getSupabaseAnonKey());
}
