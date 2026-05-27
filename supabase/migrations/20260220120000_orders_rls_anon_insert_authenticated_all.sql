-- RLS on public.orders: anonymous checkout may INSERT only; studio (authenticated) has full CRUD.
-- Service role (server routes) bypasses RLS and is unchanged.
-- Safe to re-run (drops named policies first).

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

-- Public site: anon key may create rows only (no read/list/update/delete for anon).
CREATE POLICY "orders anon insert"
  ON public.orders
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Studio dashboard: logged-in Supabase users manage orders.
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

NOTIFY pgrst, 'reload schema';
