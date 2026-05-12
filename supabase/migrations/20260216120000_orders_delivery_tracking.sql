-- Orders: delivery token + completion/download audit (idempotent).
-- Apply via Supabase CLI or SQL Editor so PostgREST schema cache includes new columns.

-- ---------------------------------------------------------------------------
-- orders: columns (nullable / defaults keep existing rows valid)
-- ---------------------------------------------------------------------------
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_access_token text,
  ADD COLUMN IF NOT EXISTS delivery_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivery_download_count integer,
  ADD COLUMN IF NOT EXISTS delivery_last_downloaded_at timestamptz;

UPDATE public.orders
SET delivery_download_count = 0
WHERE delivery_download_count IS NULL;

ALTER TABLE public.orders
  ALTER COLUMN delivery_download_count SET DEFAULT 0;

ALTER TABLE public.orders
  ALTER COLUMN delivery_download_count SET NOT NULL;

-- Drop legacy unique indexes (partial or name collisions) before table UNIQUE constraint.
DROP INDEX IF EXISTS public.orders_delivery_access_token_key;
DROP INDEX IF EXISTS public.orders_delivery_access_token_uidx;
DROP INDEX IF EXISTS public.orders_delivery_access_token_unique;

-- Unique among all values; PostgreSQL allows multiple NULLs (legacy rows without a token).
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_delivery_access_token_uq;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_delivery_access_token_uq UNIQUE (delivery_access_token);

CREATE INDEX IF NOT EXISTS idx_orders_delivery_completed_at
  ON public.orders (delivery_completed_at DESC)
  WHERE delivery_completed_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_delivery_last_downloaded_at
  ON public.orders (delivery_last_downloaded_at DESC)
  WHERE delivery_last_downloaded_at IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Master versions + revision requests (safe if earlier migration already ran)
-- ---------------------------------------------------------------------------
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

DROP POLICY IF EXISTS "Studio read master versions" ON public.order_master_versions;
CREATE POLICY "Studio read master versions"
  ON public.order_master_versions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Studio read revision requests" ON public.order_revision_requests;
CREATE POLICY "Studio read revision requests"
  ON public.order_revision_requests FOR SELECT TO authenticated USING (true);

-- ---------------------------------------------------------------------------
-- Atomic download counter (called from service role after signed URL succeeds)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_order_delivery_download(p_order_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.orders
  SET
    delivery_download_count = COALESCE(delivery_download_count, 0) + 1,
    delivery_last_downloaded_at = now()
  WHERE id = p_order_id;
$$;

REVOKE ALL ON FUNCTION public.increment_order_delivery_download(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_order_delivery_download(uuid) TO service_role;
