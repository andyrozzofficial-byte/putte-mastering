import { NextResponse } from "next/server";
import type { CheckoutBody } from "@/lib/stripe/checkout";

export async function POST(req: Request) {
  try {
    const TEST_MODE = process.env.NEXT_PUBLIC_TEST_MODE === "true";
    if (TEST_MODE) {
      return NextResponse.json(
        { error: "Stripe is disabled in test mode." },
        { status: 400 },
      );
    }

    let body: CheckoutBody;
    try {
      body = (await req.json()) as CheckoutBody;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const origin = req.headers.get("origin") ?? "http://localhost:3000";

    const { createStripeCheckoutSession } = await import("@/lib/stripe/checkout");
    const result = await createStripeCheckoutSession({ body, origin });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ url: result.url });
  } catch (e) {
    console.error("[stripe-checkout] Unhandled error", e);
    const message =
      e instanceof Error
        ? e.message
        : "Checkout failed. Please try again in a moment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

