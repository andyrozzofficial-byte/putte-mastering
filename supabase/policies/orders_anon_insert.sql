-- Example RLS for anonymous customer order inserts (`submit-order.ts` uses the anon key).
-- Apply in Supabase SQL Editor if inserts fail with RLS / permission errors.
--
-- Prerequisites: table `public.orders` with columns matching the app insert payload:
-- customer_name, customer_email, track_name, service, status, notes, uploaded_file,
-- mastered_file, price (integer USD whole dollars / bigint), delivery_access_token (text),
-- plus DB defaults for delivery_download_count (0) and nullable delivery_* audit columns.

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow unauthenticated API role to create orders from the marketing site.
DROP POLICY IF EXISTS "Allow anon insert orders" ON public.orders;
CREATE POLICY "Allow anon insert orders"
  ON public.orders
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Studio/dashboard reads use the authenticated role; add separate SELECT policies for `authenticated`
-- (often restricted to your admin users), e.g.:
-- CREATE POLICY "Studio users read orders"
--   ON public.orders FOR SELECT TO authenticated USING (true);
