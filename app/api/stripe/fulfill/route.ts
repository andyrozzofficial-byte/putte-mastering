import { NextResponse } from "next/server";

import { fulfillCheckoutSessionById } from "@/lib/stripe/fulfill-checkout-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Idempotent order fulfillment for a paid Checkout Session.
 * Used by /order/success and for manual recovery of missed webhooks.
 */
export async function POST(req: Request) {
  if (process.env.NEXT_PUBLIC_TEST_MODE === "true") {
    return NextResponse.json(
      { error: "Stripe fulfillment is disabled in test mode." },
      { status: 400 },
    );
  }

  let body: { session_id?: unknown };
  try {
    body = (await req.json()) as { session_id?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const sessionId =
    typeof body.session_id === "string" ? body.session_id.trim() : "";
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  const result = await fulfillCheckoutSessionById(sessionId, {
    logTag: "[stripe-fulfill-api]",
    sendCustomerEmail: true,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: result.status });
  }

  return NextResponse.json({
    success: true,
    orderId: result.orderId,
    alreadyExisted: result.alreadyExisted,
  });
}
