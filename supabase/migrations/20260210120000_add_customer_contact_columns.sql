-- Customer contact fields for public.orders (run in Supabase SQL Editor if not using CLI migrations).
-- Safe to run multiple times.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_name text,
  ADD COLUMN IF NOT EXISTS customer_email text,
  ADD COLUMN IF NOT EXISTS customer_message text;
