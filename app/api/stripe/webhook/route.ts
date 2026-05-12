import { NextResponse } from "next/server";

function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET");
  }
  return secret;
}

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (process.env.NEXT_PUBLIC_TEST_MODE === "true") {
    return NextResponse.json({ received: true });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Missing STRIPE_SECRET_KEY" },
      { status: 500 },
    );
  }

  const [{ createClient }, { getSupabaseServiceRoleKey, getSupabaseUrl }, { parseOrderPriceLabelToUsd }, { default: Stripe }] =
    await Promise.all([
      import("@supabase/supabase-js"),
      import("@/lib/supabase/env"),
      import("@/lib/supabase"),
      import("stripe"),
    ]);

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
  });
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 },
    );
  }

  const rawBody = await req.text();

  let event: InstanceType<typeof Stripe>["webhooks"] extends {
    constructEvent: (...a: any) => infer R;
  }
    ? R
    : never;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      getStripeWebhookSecret(),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as any;
  const meta = session.metadata ?? {};

  const customer_name = (meta.customer_name ?? "").trim();
  const customer_email = (meta.customer_email ?? "").trim();
  const customer_message = (meta.customer_message ?? "").trim();
  const track_name = (meta.track_name ?? "").trim();
  const uploaded_file = (meta.uploaded_file ?? "").trim();
  const service = (meta.service ?? "").trim();
  const price_label = (meta.price_label ?? "").trim();

  if (!customer_email || !track_name || !service || !uploaded_file) {
    console.error("[stripe-webhook] Missing required metadata", {
      customer_email,
      track_name,
      service,
      uploaded_file,
    });
    return NextResponse.json(
      { error: "Missing required metadata" },
      { status: 400 },
    );
  }

  const supabase = createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: { persistSession: false },
  });

  const price = parseOrderPriceLabelToUsd(price_label);

  const { error } = await supabase.from("orders").insert({
    customer_name: customer_name || null,
    customer_email,
    track_name,
    service,
    status: "new",
    notes: customer_message || null,
    uploaded_file,
    mastered_file: null,
    price,
  });

  if (error) {
    console.error("[stripe-webhook] Supabase insert failed", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

