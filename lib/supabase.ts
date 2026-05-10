import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Row shape for inserts into the public `orders` table (matches Supabase column names). */
export type OrderInsert = {
  customer_name: string;
  track_name: string;
  service: string;
  status: string;
  notes: string;
  uploaded_file: string | null;
  mastered_file: string | null;
  price: string;
};

/**
 * Browser/client-side Supabase client (uses the anon key).
 * Only call from Client Components or client-side handlers.
 */
export function createSupabaseClient(): SupabaseClient {
  if (!url?.trim() || !anonKey?.trim()) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
  return createClient(url, anonKey);
}
