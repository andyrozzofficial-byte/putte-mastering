import Stripe from "stripe";

function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  return key;
}

declare global {
  // eslint-disable-next-line no-var
  var __stripe__: Stripe | undefined;
}

export function getStripe(): Stripe {
  if (globalThis.__stripe__) return globalThis.__stripe__;
  const stripe = new Stripe(getStripeSecretKey(), {
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
  });
  globalThis.__stripe__ = stripe;
  return stripe;
}

