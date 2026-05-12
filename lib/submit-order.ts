import { PostgrestError } from "@supabase/supabase-js";

import {
  ORDERS_INSERT_COLUMNS,
  createSupabaseClient,
  parseOrderPriceLabelToKr,
  type OrderInsert,
} from "@/lib/supabase";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

function logEnvFingerprint(): void {
  const url = getSupabaseUrl();
  let host = url;
  try {
    host = new URL(url).host;
  } catch {
    /* leave raw */
  }
  const key = getSupabaseAnonKey();
  console.info("[submit-order] Env check:", {
    NEXT_PUBLIC_SUPABASE_URL_host: host,
    NEXT_PUBLIC_SUPABASE_ANON_KEY_length: key.length,
    NEXT_PUBLIC_SUPABASE_ANON_KEY_prefix: `${key.slice(0, 8)}…`,
  });
}

function payloadMatchesOrdersColumns(payload: OrdersInsertPayload): boolean {
  const keys = Object.keys(payload).sort();
  const expected = [...ORDERS_INSERT_COLUMNS].sort();
  const match =
    keys.length === expected.length &&
    keys.every((k, i) => k === expected[i]);
  if (!match) {
    console.error("[submit-order] Payload keys mismatch:", {
      expected,
      actual: keys,
    });
  }
  return match;
}

/** Matches `public.orders` INSERT columns (excluding defaults). */
export type OrdersInsertPayload = {
  customer_email: string;
  customer_name: string;
  track_name: string;
  service: string;
  status: string;
  notes: string | null;
  uploaded_file: string | null;
  mastered_file: string | null;
  /** Integer SEK (Supabase `bigint`). */
  price: number;
};

/** Empty strings → null for nullable text columns (avoids CHECK / NOT NULL edge cases). */
function toOrdersInsertPayload(row: OrderInsert): OrdersInsertPayload {
  const trimOrNull = (s: string) => {
    const t = s.trim();
    return t.length === 0 ? null : t;
  };

  const priceKr = parseOrderPriceLabelToKr(row.price);
  if (!Number.isFinite(priceKr) || priceKr <= 0) {
    console.warn(
      "[submit-order] Parsed price is missing or zero from label:",
      row.price,
    );
  }

  return {
    customer_email: row.customer_email.trim(),
    customer_name: row.customer_name.trim(),
    track_name: row.track_name.trim(),
    service: row.service.trim(),
    status: row.status.trim(),
    notes: trimOrNull(row.customer_message),
    uploaded_file: row.uploaded_file,
    mastered_file: row.mastered_file,
    price: priceKr,
  };
}

function serializePostgrestError(error: PostgrestError): Record<string, unknown> {
  return {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  };
}

export async function submitOrderToSupabase(row: OrderInsert): Promise<void> {
  logEnvFingerprint();

  const client = createSupabaseClient();

  const payload = toOrdersInsertPayload(row);
  payloadMatchesOrdersColumns(payload);

  console.info("[submit-order] Insert payload (sanitized):", {
    ...payload,
    customer_email: `${payload.customer_email.slice(0, 2)}…@${payload.customer_email.includes("@") ? payload.customer_email.split("@")[1] : "?"}`,
    price_raw_label: row.price,
    uploaded_file:
      typeof payload.uploaded_file === "string"
        ? `${payload.uploaded_file.slice(0, 48)}${payload.uploaded_file.length > 48 ? "…" : ""}`
        : payload.uploaded_file,
  });

  console.info("[submit-order] Calling insert into public.orders …");

  const { error } = await client.from("orders").insert(payload);

  if (error) {
    const serialized = serializePostgrestError(error);
    console.error("[submit-order] Supabase insert error:", serialized);
    console.error("[submit-order] Raw PostgrestError:", error);
    throw new Error(
      `[orders insert] ${error.code ?? "unknown"}: ${error.message}${error.hint ? ` — ${error.hint}` : ""}${error.details ? ` (${error.details})` : ""}`,
    );
  }

  console.info("[submit-order] Insert finished without error.");
}
