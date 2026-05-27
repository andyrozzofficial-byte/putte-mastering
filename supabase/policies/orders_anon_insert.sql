-- RLS for `public.orders`: anon INSERT-only; authenticated full access.
-- Applied via migration `20260220120000_orders_rls_anon_insert_authenticated_all.sql`
-- or paste `supabase/sql/production_orders_rls.sql` in Dashboard → SQL Editor.
--
-- App uses anon key without login for checkout (`submit-order.ts`) — INSERT only, no `.select()` after insert.
-- Studio uses authenticated role for SELECT/UPDATE; service role APIs bypass RLS.

GRANT USAGE ON SCHEMA public TO anon, authenticated;

REVOKE ALL ON TABLE public.orders FROM anon;
GRANT INSERT ON TABLE public.orders TO anon;

REVOKE ALL ON TABLE public.orders FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.orders TO authenticated;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon insert orders" ON public.orders;
DROP POLICY IF EXISTS "orders anon insert" ON public.orders;
DROP POLICY IF EXISTS "orders authenticated select" ON public.orders;
DROP POLICY IF EXISTS "orders authenticated insert" ON public.orders;
DROP POLICY IF EXISTS "orders authenticated update" ON public.orders;
DROP POLICY IF EXISTS "orders authenticated delete" ON public.orders;

CREATE POLICY "orders anon insert"
  ON public.orders
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "orders authenticated select"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "orders authenticated insert"
  ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "orders authenticated update"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "orders authenticated delete"
  ON public.orders
  FOR DELETE
  TO authenticated
  USING (true);
