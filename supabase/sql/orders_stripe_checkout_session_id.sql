-- Idempotent Stripe Checkout fulfillment. Paste in Supabase SQL Editor if migrations not applied via CLI.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text;

CREATE UNIQUE INDEX IF NOT EXISTS orders_stripe_checkout_session_id_key
  ON public.orders (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;

NOTIFY pgrst, 'reload schema';
