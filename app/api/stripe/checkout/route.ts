import { NextResponse } from "next/server";
import { ORDER_PLANS } from "@/lib/order-plans";
import { getStripe } from "@/lib/stripe/server";

type CheckoutBody = {
  customer_name: string;
  customer_email: string;
  customer_message?: string | null;
  track_name: string;
  uploaded_file: string;
  service: string;
  /** e.g. "$60" */
  price_label: string;
};

function parseUsdLabelToCents(label: string): number {
  const digits = label.replace(/[^\d]/g, "");
  const dollars = Number.parseInt(digits, 10);
  if (!Number.isFinite(dollars) || dollars <= 0) return 0;
  return dollars * 100;
}

export async function POST(req: Request) {
  try {
    let body: CheckoutBody;
    try {
      body = (await req.json()) as CheckoutBody;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const service = (body.service ?? "").trim();
    const plan = ORDER_PLANS.find((p) => p.title === service);
    if (!plan) {
      return NextResponse.json({ error: "Invalid service" }, { status: 400 });
    }

    const priceCents = parseUsdLabelToCents(plan.price);
    if (priceCents <= 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    const origin = req.headers.get("origin") ?? "http://localhost:3000";
    const successUrl = `${origin}/?order=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/?order=cancelled`;

    console.info("[stripe-checkout] Create session", {
      service: plan.title,
      price: plan.price,
      track_name: (body.track_name ?? "").trim(),
      uploaded_file: (body.uploaded_file ?? "").trim().slice(0, 64),
      origin,
    });

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: priceCents,
            product_data: {
              name: plan.title,
              description: "Manual mastering service",
            },
          },
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: body.customer_email?.trim() || undefined,
      metadata: {
        customer_name: (body.customer_name ?? "").trim(),
        customer_email: (body.customer_email ?? "").trim(),
        customer_message: (body.customer_message ?? "").toString(),
        track_name: (body.track_name ?? "").trim(),
        uploaded_file: (body.uploaded_file ?? "").trim(),
        service: plan.title,
        price_label: plan.price,
      },
    });

    if (!session.url) {
      console.error("[stripe-checkout] Session missing url", { id: session.id });
      return NextResponse.json(
        { error: "Stripe session created without a redirect URL." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[stripe-checkout] Unhandled error", e);
    const message =
      e instanceof Error
        ? e.message
        : "Checkout failed. Please try again in a moment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

