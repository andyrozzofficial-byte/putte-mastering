/**
 * One-shot anon INSERT against `public.orders` using the same env vars as the app.
 * Run: npm run verify:order-insert
 *
 * Does not use `.select()` after insert, so it succeeds even when anon lacks SELECT on `orders`.
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY (use .env.local via npm script).",
  );
  process.exit(1);
}

const payload = {
  customer_name: null,
  track_name: "verify-script-test",
  service: "Standard Master",
  status: "new",
  notes: null,
  uploaded_file: null,
  mastered_file: null,
  price: 1500,
};

const supabase = createClient(url, key);

console.info("[verify-order-insert] URL host:", new URL(url).host);
console.info("[verify-order-insert] Payload:", payload);

const { error } = await supabase.from("orders").insert(payload);

if (error) {
  console.error("[verify-order-insert] Failed:", {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });
  console.error("[verify-order-insert] Raw:", error);
  process.exit(1);
}

console.info("[verify-order-insert] Insert OK (no error returned). Check Supabase Table Editor for the row).");
