import { NextResponse } from "next/server";

import { fulfillCheckoutSession } from "@/lib/stripe/fulfill-checkout-session";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";

function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET");
  }
  return secret;
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  console.info("[stripe-webhook] POST received");

  if (process.env.NEXT_PUBLIC_TEST_MODE === "true") {
    console.warn(
      "[stripe-webhook] skipped — NEXT_PUBLIC_TEST_MODE=true (no order insert)",
    );
    return NextResponse.json({ received: true, skipped: "test_mode" });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("[stripe-webhook] missing STRIPE_SECRET_KEY");
    return NextResponse.json(
      { error: "Missing STRIPE_SECRET_KEY" },
      { status: 500 },
    );
  }

  const [{ default: Stripe }] = await Promise.all([import("stripe")]);

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
  });
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    console.warn("[stripe-webhook] missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 },
    );
  }

  const rawBody = await req.text();

  let event: Awaited<ReturnType<typeof stripe.webhooks.constructEvent>>;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      getStripeWebhookSecret(),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("[stripe-webhook] signature verification failed", { message });
    return NextResponse.json({ error: message }, { status: 400 });
  }

  console.info("[stripe-webhook] event", { type: event.type, id: event.id });

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const session = event.data.object;

  let supabase;
  try {
    supabase = createServiceRoleSupabaseClient();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Supabase init failed";
    console.error("[stripe-webhook] service client failed", { message: msg });
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const result = await fulfillCheckoutSession({
    session,
    supabase,
    logTag: "[stripe-webhook]",
    sendCustomerEmail: true,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: result.status });
  }

  return NextResponse.json({
    received: true,
    orderId: result.orderId,
    alreadyExisted: result.alreadyExisted,
  });
}
