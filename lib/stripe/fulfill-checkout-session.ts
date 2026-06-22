import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

import { deliveryPortalAbsoluteUrl } from "@/lib/delivery/app-url";
import { generateDeliveryAccessToken } from "@/lib/delivery/access-token";
import { dateFromUnixSeconds, formatStockholmDate } from "@/lib/datetime";
import { sendResendEmail } from "@/lib/email/resend";
import { renderBrandedEmail } from "@/lib/email/templates";
import { parseOrderPriceLabelToUsd } from "@/lib/supabase";
import type { Database } from "@/lib/supabase/database.types";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/supabase/env";

export type CheckoutSessionMetadata = {
  customer_name: string;
  customer_email: string;
  customer_message: string;
  track_name: string;
  uploaded_file: string;
  service: string;
  price_label: string;
};

export type FulfillCheckoutResult =
  | {
      ok: true;
      alreadyExisted: boolean;
      deliveryAccessToken: string;
      orderId: string;
    }
  | { ok: false; reason: string; status: number };

type SessionLike = Pick<Stripe.Checkout.Session, "id" | "payment_status" | "created" | "metadata">;

export function parseCheckoutSessionMetadata(session: SessionLike): CheckoutSessionMetadata {
  const meta = session.metadata ?? {};
  return {
    customer_name: (meta.customer_name ?? "").trim(),
    customer_email: (meta.customer_email ?? "").trim(),
    customer_message: (meta.customer_message ?? "").trim(),
    track_name: (meta.track_name ?? "").trim(),
    uploaded_file: (meta.uploaded_file ?? "").trim(),
    service: (meta.service ?? "").trim(),
    price_label: (meta.price_label ?? "").trim(),
  };
}

type ExistingOrder = { id: string; delivery_access_token: string };

function serializeSupabaseError(err: unknown): {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
} {
  if (err && typeof err === "object") {
    const e = err as {
      code?: string;
      message?: string;
      details?: string;
      hint?: string;
    };
    return {
      message: e.message ?? JSON.stringify(err),
      code: e.code,
      details: e.details,
      hint: e.hint,
    };
  }
  if (err instanceof Error) return { message: err.message };
  return { message: String(err) };
}

function isMissingStripeSessionColumnError(error: {
  code?: string;
  message?: string;
}): boolean {
  const message = error.message ?? "";
  return (
    error.code === "PGRST204" ||
    error.code === "42703" ||
    message.includes("stripe_checkout_session_id")
  );
}

function buildOrderInsertRow(options: {
  sessionId: string;
  fields: CheckoutSessionMetadata;
  delivery_access_token: string;
  price: number;
  includeStripeSessionId: boolean;
}): Database["public"]["Tables"]["orders"]["Insert"] {
  const row: Database["public"]["Tables"]["orders"]["Insert"] = {
    customer_name: options.fields.customer_name || null,
    customer_email: options.fields.customer_email,
    track_name: options.fields.track_name,
    service: options.fields.service,
    status: "new",
    notes: options.fields.customer_message || null,
    uploaded_file: options.fields.uploaded_file,
    mastered_file: null,
    price: options.price,
    delivery_access_token: options.delivery_access_token,
  };

  if (options.includeStripeSessionId) {
    row.stripe_checkout_session_id = options.sessionId;
  }

  return row;
}

async function insertCheckoutOrder(
  supabase: SupabaseClient<Database>,
  options: {
    sessionId: string;
    fields: CheckoutSessionMetadata;
    delivery_access_token: string;
    price: number;
    logTag: string;
  },
): Promise<
  | { ok: true; orderId: string }
  | { ok: false; error: { code?: string; message: string; details?: string; hint?: string } }
> {
  const { sessionId, fields, delivery_access_token, price, logTag } = options;

  const attempt = async (includeStripeSessionId: boolean) =>
    supabase
      .from("orders")
      .insert(
        buildOrderInsertRow({
          sessionId,
          fields,
          delivery_access_token,
          price,
          includeStripeSessionId,
        }),
      )
      .select("id")
      .single();

  let { data: inserted, error } = await attempt(true);

  if (error && isMissingStripeSessionColumnError(error)) {
    console.warn(`${logTag} stripe_checkout_session_id column unavailable; retrying insert without it`, {
      sessionId,
      ...serializeSupabaseError(error),
    });
    ({ data: inserted, error } = await attempt(false));
  }

  if (error) {
    return { ok: false, error };
  }

  const orderId = inserted?.id;
  if (!orderId) {
    return {
      ok: false,
      error: { message: "Insert returned no order id" },
    };
  }

  return { ok: true, orderId };
}

function toExistingOrder(
  data: { id: string; delivery_access_token: string | null } | null,
): ExistingOrder | null {
  const token = data?.delivery_access_token;
  if (!data?.id || typeof token !== "string" || !token.trim()) {
    return null;
  }
  return { id: data.id, delivery_access_token: token };
}

async function findOrderByCheckoutSessionId(
  supabase: SupabaseClient<Database>,
  sessionId: string,
): Promise<ExistingOrder | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("id, delivery_access_token")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return toExistingOrder(data);
}

async function findOrderByCheckoutMetadata(
  supabase: SupabaseClient<Database>,
  fields: CheckoutSessionMetadata,
): Promise<ExistingOrder | null> {
  if (!fields.customer_email || !fields.track_name || !fields.uploaded_file) {
    return null;
  }

  const { data, error } = await supabase
    .from("orders")
    .select("id, delivery_access_token")
    .eq("customer_email", fields.customer_email)
    .eq("track_name", fields.track_name)
    .eq("uploaded_file", fields.uploaded_file)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return toExistingOrder(data);
}

async function findExistingOrderForSession(
  supabase: SupabaseClient<Database>,
  sessionId: string,
  fields: CheckoutSessionMetadata,
  logTag: string,
): Promise<ExistingOrder | null> {
  try {
    const bySession = await findOrderByCheckoutSessionId(supabase, sessionId);
    if (bySession) return bySession;
  } catch (err) {
    console.warn(`${logTag} session id lookup unavailable`, {
      sessionId,
      ...serializeSupabaseError(err),
    });
  }

  try {
    const byMetadata = await findOrderByCheckoutMetadata(supabase, fields);
    if (byMetadata) {
      console.info(`${logTag} order matched by checkout metadata`, {
        sessionId,
        orderId: byMetadata.id,
      });
      return byMetadata;
    }
  } catch (err) {
    console.error(`${logTag} metadata order lookup failed`, {
      sessionId,
      ...serializeSupabaseError(err),
    });
  }

  return null;
}

async function sendOrderReceivedEmail(options: {
  customerEmail: string;
  trackName: string;
  service: string;
  deliveryAccessToken: string;
  orderPlacedAt: Date;
  logTag: string;
}): Promise<void> {
  const portal = deliveryPortalAbsoluteUrl(options.deliveryAccessToken);
  try {
    const result = await sendResendEmail({
      to: options.customerEmail,
      subject: "We received your mastering order",
      html: renderBrandedEmail({
        title: "Order received",
        intro: `We’ve received your payment and files for ${options.trackName}.`,
        ctaLabel: "Open delivery page",
        ctaUrl: portal,
        meta: [
          { label: "Service", value: options.service },
          { label: "Status", value: "New" },
          { label: "Date", value: formatStockholmDate(options.orderPlacedAt) },
        ],
        footerEmail: "studio@firstlistenmastering.com",
      }),
    });
    console.info(`[EMAIL SENT] ${options.logTag}`, {
      ok: result.ok,
      reason: result.ok ? undefined : result.reason,
      to: `${options.customerEmail.slice(0, 2)}…`,
    });
  } catch (err) {
    console.error(`[EMAIL FAILED] ${options.logTag}`, err);
  }
}

export async function fulfillCheckoutSession(options: {
  session: SessionLike;
  supabase: SupabaseClient<Database>;
  logTag: string;
  sendCustomerEmail?: boolean;
}): Promise<FulfillCheckoutResult> {
  const { session, supabase, logTag, sendCustomerEmail = true } = options;
  const sessionId = session.id?.trim();
  if (!sessionId) {
    return { ok: false, reason: "Missing session id", status: 400 };
  }

  if (session.payment_status !== "paid") {
    console.warn(`${logTag} session not paid`, {
      sessionId,
      payment_status: session.payment_status,
    });
    return { ok: false, reason: "Payment not completed", status: 400 };
  }

  const fields = parseCheckoutSessionMetadata(session);

  const existing = await findExistingOrderForSession(
    supabase,
    sessionId,
    fields,
    logTag,
  );
  if (existing) {
    console.info(`${logTag} order already exists`, {
      sessionId,
      orderId: existing.id,
    });
    return {
      ok: true,
      alreadyExisted: true,
      deliveryAccessToken: existing.delivery_access_token,
      orderId: existing.id,
    };
  }
  if (!fields.customer_email || !fields.track_name || !fields.service || !fields.uploaded_file) {
    console.error(`${logTag} missing required metadata`, {
      sessionId,
      has_customer_email: Boolean(fields.customer_email),
      has_track_name: Boolean(fields.track_name),
      has_service: Boolean(fields.service),
      has_uploaded_file: Boolean(fields.uploaded_file),
    });
    return { ok: false, reason: "Missing checkout metadata", status: 400 };
  }

  const delivery_access_token = generateDeliveryAccessToken();
  const price = parseOrderPriceLabelToUsd(fields.price_label);

  const insertResult = await insertCheckoutOrder(supabase, {
    sessionId,
    fields,
    delivery_access_token,
    price,
    logTag,
  });

  if (!insertResult.ok) {
    const error = insertResult.error;
    if (error.code === "23505") {
      const concurrent = await findExistingOrderForSession(
        supabase,
        sessionId,
        fields,
        logTag,
      );
      if (concurrent) {
        console.info(`${logTag} order created concurrently`, {
          sessionId,
          orderId: concurrent.id,
        });
        return {
          ok: true,
          alreadyExisted: true,
          deliveryAccessToken: concurrent.delivery_access_token,
          orderId: concurrent.id,
        };
      }
    }

    console.error(`${logTag} Supabase insert failed`, {
      sessionId,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return { ok: false, reason: "Insert failed", status: 500 };
  }

  const orderId = insertResult.orderId;

  const portal = deliveryPortalAbsoluteUrl(delivery_access_token);
  const orderPlacedAt = dateFromUnixSeconds(session.created ?? 0) ?? new Date();
  console.info(`${logTag} order created`, { sessionId, orderId, portal });

  if (sendCustomerEmail) {
    await sendOrderReceivedEmail({
      customerEmail: fields.customer_email,
      trackName: fields.track_name,
      service: fields.service,
      deliveryAccessToken: delivery_access_token,
      orderPlacedAt,
      logTag,
    });
  }

  return {
    ok: true,
    alreadyExisted: false,
    deliveryAccessToken: delivery_access_token,
    orderId,
  };
}

export async function fulfillCheckoutSessionById(
  sessionId: string,
  options?: { logTag?: string; sendCustomerEmail?: boolean },
): Promise<FulfillCheckoutResult> {
  const logTag = options?.logTag ?? "[stripe-fulfill]";
  const trimmed = sessionId.trim();
  if (!trimmed) {
    return { ok: false, reason: "Missing session_id", status: 400 };
  }

  if (!process.env.STRIPE_SECRET_KEY?.trim()) {
    return { ok: false, reason: "Missing STRIPE_SECRET_KEY", status: 500 };
  }

  try {
    getSupabaseUrl();
    getSupabaseServiceRoleKey();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Missing Supabase server env";
    console.error(`${logTag} env error`, { message: msg });
    return { ok: false, reason: msg, status: 500 };
  }

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
  });

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(trimmed);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not load checkout session";
    console.error(`${logTag} sessions.retrieve failed`, { sessionId: trimmed, message: msg });
    return { ok: false, reason: msg, status: 400 };
  }

  const supabase = createServiceRoleSupabaseClient();
  return fulfillCheckoutSession({
    session,
    supabase,
    logTag,
    sendCustomerEmail: options?.sendCustomerEmail,
  });
}
