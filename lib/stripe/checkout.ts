import { ORDER_PLANS } from "@/lib/order-plans";

export type CheckoutBody = {
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

export async function createStripeCheckoutSession(args: {
  body: CheckoutBody;
  origin: string;
}): Promise<{ url: string } | { error: string; status: number }> {
  const { body, origin } = args;

  if (!process.env.STRIPE_SECRET_KEY) {
    return { error: "Missing STRIPE_SECRET_KEY", status: 500 };
  }

  const service = (body.service ?? "").trim();
  const plan = ORDER_PLANS.find((p) => p.title === service);
  if (!plan) return { error: "Invalid service", status: 400 };

  const priceCents = parseUsdLabelToCents(plan.price);
  if (priceCents <= 0) return { error: "Invalid price", status: 400 };

  const successUrl = `${origin}/?order=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/?order=cancelled`;

  console.info("[stripe-checkout] Create session", {
    service: plan.title,
    price: plan.price,
    track_name: (body.track_name ?? "").trim(),
    uploaded_file: (body.uploaded_file ?? "").trim().slice(0, 64),
    origin,
  });

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
  });
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
    return {
      error: "Stripe session created without a redirect URL.",
      status: 500,
    };
  }

  return { url: session.url };
}

