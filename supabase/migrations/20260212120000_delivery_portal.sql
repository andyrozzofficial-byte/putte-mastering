-- Delivery portal: opaque access token on orders + master versions + revision requests.
-- Run via Supabase CLI or SQL Editor.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_access_token text;

CREATE UNIQUE INDEX IF NOT EXISTS orders_delivery_access_token_key
  ON public.orders (delivery_access_token)
  WHERE delivery_access_token IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.order_master_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  storage_ref text NOT NULL,
  version integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_id, version)
);

CREATE INDEX IF NOT EXISTS idx_order_master_versions_order_id
  ON public.order_master_versions (order_id);

CREATE TABLE IF NOT EXISTS public.order_revision_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_revision_requests_order_id
  ON public.order_revision_requests (order_id);

ALTER TABLE public.order_master_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_revision_requests ENABLE ROW LEVEL SECURITY;

-- Studio uses Supabase Auth (authenticated). Single-admin assumption: full access for authenticated role.
DROP POLICY IF EXISTS "Studio read master versions" ON public.order_master_versions;
CREATE POLICY "Studio read master versions"
  ON public.order_master_versions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Studio read revision requests" ON public.order_revision_requests;
CREATE POLICY "Studio read revision requests"
  ON public.order_revision_requests FOR SELECT TO authenticated USING (true);
