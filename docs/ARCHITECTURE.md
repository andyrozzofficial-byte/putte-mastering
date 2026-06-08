# Architecture — First Listen Mastering

Implementation-level architecture for the Next.js 16 app. For step-by-step flows see [`FLOWS.md`](./FLOWS.md). For a single-file agent index see [`../PROJECT_MAP.md`](../PROJECT_MAP.md).

---

## System context

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser    │────▶│  Vercel      │────▶│  Supabase    │
│  (customer   │     │  Next.js 16  │     │  Postgres +  │
│   + studio)  │     │  App Router  │     │  Auth +      │
└──────┬───────┘     └──────┬───────┘     │  Storage     │
       │                    │             └──────────────┘
       │                    │
       │                    ├────▶ Stripe (Checkout + Webhook)
       │                    └────▶ Resend (transactional email)
       │
       └──── direct Storage XHR (signed URLs, anon key headers)
```

| Concern | Implementation |
|---------|----------------|
| Routing | `app/` App Router; all studio + delivery pages `dynamic = "force-dynamic"` |
| UI | React 19 Client Components for interactivity; Server Components for data reads |
| Styling | Tailwind 4, CSS variables (`--accent-warm`), Geist fonts in root layout |
| Persistence | Supabase Postgres (`public.orders`, child tables) |
| Files | Supabase Storage bucket `uploads` (private) |
| Admin auth | Supabase Auth email/password, cookie session via `@supabase/ssr` |
| Customer access | Opaque `delivery_access_token` (64-char hex), no login |

---

## Supabase client matrix (critical)

The app uses **three distinct clients**. Using the wrong one breaks RLS or leaks privileges.

| Client factory | File | Key / session | RLS role | Used where |
|----------------|------|---------------|----------|------------|
| `createSupabaseClient()` | `lib/supabase.ts` | Anon, **no cookies** | `anon` | Customer upload (`uploadCustomerTrack`), test-mode order insert |
| `createStudioServerClient()` | `lib/supabase/studio-server.ts` | Anon + **cookie session** | `authenticated` when logged in | Studio Server Components, `requireStudioSessionUser()` |
| `createStudioBrowserClient()` | `lib/supabase/studio-browser.ts` | Anon + **cookie session** | `authenticated` | Login, logout |
| `createServiceRoleSupabaseClient()` | `lib/supabase/service-role.ts` | Service role, `persistSession: false` | **Bypasses RLS** | Delivery pages/APIs, Stripe webhook, signed URLs, bucket admin |

**Middleware** (`middleware.ts`) uses inline `createServerClient` (same as studio-server pattern) only for `/login` and `/studio/*`.

**Browser Storage XHR** (`lib/studio/supabase-signed-upload-xhr.ts`) sends `apikey` + `Authorization: Bearer` with `NEXT_PUBLIC_SUPABASE_ANON_KEY` — not the service role.

---

## Database schema (full columns)

Base `orders` table predates this repo's migrations; columns accumulated via `supabase/migrations/*.sql`. Canonical TypeScript shape: `lib/supabase/database.types.ts`.

### `public.orders`

| Column | Type | Nullable | Default | Written by | Notes |
|--------|------|----------|---------|------------|-------|
| `id` | `uuid` | NO | `gen_random_uuid()` | DB | PK |
| `created_at` | `timestamptz` | NO | `now()` | DB | |
| `customer_name` | `text` | YES | — | Checkout / webhook | Trimmed on insert |
| `customer_email` | `text` | YES | — | Checkout / webhook | Required for flow |
| `track_name` | `text` | YES | — | Upload draft `file.name` | |
| `service` | `text` | YES | — | Plan title e.g. `"Standard Master"` | |
| `status` | `text` | YES | — | Insert `"new"`; studio APIs | See state machine in PROJECT_MAP |
| `notes` | `text` | YES | — | Customer message | **App field** `customer_message` maps here |
| `uploaded_file` | `text` | YES | — | Customer upload | `uploads/incoming/...` ref |
| `mastered_file` | `text` | YES | — | Deliver complete | `uploads/deliveries/...` ref |
| `price` | `bigint` / integer | YES | — | Parsed from `"$60"` label | Whole USD dollars |
| `delivery_access_token` | `text` | YES | — | `generateDeliveryAccessToken()` | UNIQUE constraint; multiple NULLs allowed |
| `delivery_completed_at` | `timestamptz` | YES | — | `finalizeDeliverMasterUpload` | Set when master delivered |
| `delivery_download_count` | `integer` | NO | `0` | RPC `increment_order_delivery_download` | |
| `delivery_last_downloaded_at` | `timestamptz` | YES | — | Same RPC | |

**Legacy / unused:** migration `20260210120000` adds `customer_message text` — the app writes to `notes` instead. Do not assume `customer_message` is populated.

**Indexes / constraints:**
- `orders_delivery_access_token_uq` UNIQUE on `delivery_access_token`
- `idx_orders_delivery_completed_at`, `idx_orders_delivery_last_downloaded_at`

### `public.order_master_versions`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| `order_id` | `uuid` | NO | — | FK → `orders(id)` ON DELETE CASCADE |
| `storage_ref` | `text` | NO | — | `uploads/deliveries/{orderId}/...` |
| `version` | `integer` | NO | — | Monotonic per order; UNIQUE `(order_id, version)` |
| `created_at` | `timestamptz` | NO | `now()` | |

### `public.order_revision_requests`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `uuid` | NO | `gen_random_uuid()` | PK |
| `order_id` | `uuid` | NO | — | FK → `orders(id)` ON DELETE CASCADE |
| `message` | `text` | NO | — | 3–8000 chars enforced in API |
| `created_at` | `timestamptz` | NO | `now()` | |

### `public.increment_order_delivery_download(p_order_id uuid)`

- `SECURITY DEFINER`, `search_path = public`
- `GRANT EXECUTE` to `service_role` only
- Increments `delivery_download_count`, sets `delivery_last_downloaded_at = now()`

---

## Row Level Security (RLS)

### `orders`

| Policy | Role | Operation | Rule |
|--------|------|-----------|------|
| `orders anon insert` | `anon` | INSERT | `WITH CHECK (true)` |
| `orders authenticated select` | `authenticated` | SELECT | `USING (true)` |
| `orders authenticated insert` | `authenticated` | INSERT | `WITH CHECK (true)` |
| `orders authenticated update` | `authenticated` | UPDATE | `USING (true) WITH CHECK (true)` |
| `orders authenticated delete` | `authenticated` | DELETE | `USING (true)` |

**Table grants:**
- `anon`: INSERT only (no SELECT/UPDATE/DELETE)
- `authenticated`: SELECT, INSERT, UPDATE, DELETE

**Implication:** Public checkout never reads orders back via anon key (insert-only). Studio dashboard reads via authenticated session. Server routes that need token lookup or webhooks use **service role**.

Source: `supabase/migrations/20260220120000_orders_rls_anon_insert_authenticated_all.sql`

### `order_master_versions` / `order_revision_requests`

| Policy | Role | Operation |
|--------|------|-----------|
| `Studio read master versions` | `authenticated` | SELECT |
| `Studio read revision requests` | `authenticated` | SELECT |

**No anon/authenticated INSERT policies** — writes happen via **service role** in deliver/revision APIs.

### Storage (`uploads` bucket)

RLS policies are **not in this repo's migrations** — they must exist in Supabase Dashboard for:
- Anon INSERT under `incoming/` (customer upload via `createSupabaseClient().storage.upload`)
- Signed upload URLs for `deliveries/` (service role creates URL; browser PUT with anon headers)

If uploads fail with "row-level security" or "policy", fix policies in Supabase, not in app code.

---

## Storage layout

Single private bucket: **`uploads`** (`DELIVER_MASTER_BUCKET` / `CUSTOMER_UPLOAD_BUCKET`).

| Path prefix | Purpose | Created by | DB reference |
|-------------|---------|------------|--------------|
| `incoming/{uuid}-{sanitized}` | Customer source track | `lib/upload-customer-track.ts` | `orders.uploaded_file` = `uploads/incoming/...` |
| `deliveries/{orderId}/{uuid}-{sanitized}` | Finished master | `lib/studio/deliver-master-workflow.ts` | `orders.mastered_file` + `order_master_versions.storage_ref` |

**Sanitization** (both flows): `name.replace(/[^a-zA-Z0-9._-]+/g, "_")`, trim `_`, max 180 chars, fallback `"track"` or `"master"`.

**Size limit:** 500 MiB (`lib/upload-limits.ts` → `MAX_UPLOAD_BYTES`). Bucket limit synced via `ensureUploadBucketLimit()` / SQL `524288000` bytes.

---

## Middleware (`middleware.ts`)

**Matcher:** All paths except `_next/static`, `_next/image`, `favicon.ico`, static images/audio (`svg|png|jpg|jpeg|gif|webp|ico|mp3|wav`).

**Execution order:**

1. **`applyBetaGate`** — if `NEXT_PUBLIC_SITE_PASSWORD` set:
   - Skip: exempt paths, `/api/*`, `/` (homepage renders gate in layout)
   - If no cookie `flm_site_beta_access=1` → redirect to `/`
2. **Studio auth** — only for `/login` or `/studio/*`:
   - `createServerClient` + `auth.getUser()`
   - `/studio/*` without user → `/login?next={path}`
   - `/login` with user → `/studio`
3. Pass through with refreshed session cookies on response

**Not protected by middleware:** `/delivery/*`, `/order/*`, `/api/delivery/*`, `/api/stripe/*` (except beta gate on non-exempt pages).

---

## API layer conventions

- JSON helpers: `lib/api/json-response.ts` → `{ success: true, ... }` / `{ success: false, error }`
- Client parsing: `lib/api/client-parse.ts` — detects HTML error pages (Vercel body limits)
- Studio routes: `requireStudioSessionUser()` then often `getServiceRoleClientOrApiError()` for Storage
- Delivery routes: token validated against `orders.delivery_access_token` via service role

---

## Email system

- Transport: `lib/email/resend.ts` → `fetch("https://api.resend.com/emails")`
- Templates: `lib/email/templates.ts` → `renderBrandedEmail()` (inline HTML)
- Skips silently if `RESEND_API_KEY` missing (`console.warn`, returns `{ ok: false }`)
- Absolute links: `lib/delivery/app-url.ts` → `NEXT_PUBLIC_APP_URL` or `https://firstlistenmastering.com`

| Trigger | File | Recipient(s) | Subject |
|---------|------|--------------|---------|
| Test-mode order | `lib/submit-order.ts` | Customer | "We received your mastering order" |
| Stripe paid | `app/api/stripe/webhook/route.ts` | Customer | "We received your mastering order" |
| Status → in_progress | `app/api/studio/orders/[id]/status/route.ts` | Customer | "We're working on your master" |
| Master delivered | `lib/studio/deliver-master-workflow.ts` | Customer + `STUDIO_NOTIFY_EMAIL` | "Your master is ready" / "Master uploaded" |
| Revision submitted | `app/api/delivery/[token]/revision/route.ts` | Customer + notify | "We received your revision request" / "Revision request" |

**No email** when studio manually sets `completed` via status API without going through deliver workflow.

---

## Environment variables (code usages)

| Variable | Read in | Required when |
|----------|---------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `lib/supabase/env.ts`, `server-supabase-env.ts`, scripts | Always |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `env.ts`, `delivery-master-upload.tsx`, `server-supabase-env.ts` | Always (build + browser uploads) |
| `SUPABASE_SERVICE_ROLE_KEY` | `env.ts`, `server-supabase-env.ts` | Server: delivery, webhook, storage admin |
| `SUPABASE_DB_URL` | `scripts/supabase-remote.mjs` | Local `db:push` / `db:types` only |
| `STRIPE_SECRET_KEY` | `lib/stripe/checkout.ts`, webhook route | Production checkout |
| `STRIPE_WEBHOOK_SECRET` | `app/api/stripe/webhook/route.ts` | Production webhook |
| `RESEND_API_KEY` | `lib/email/resend.ts` | Emails (graceful skip if missing) |
| `RESEND_FROM_EMAIL` | `lib/email/resend.ts` | Email from address |
| `STUDIO_NOTIFY_EMAIL` | `lib/email/resend.ts` | Internal notify on deliver/revision |
| `NEXT_PUBLIC_APP_URL` | `lib/delivery/app-url.ts` | Correct email portal links |
| `NEXT_PUBLIC_TEST_MODE` | `lib/test-mode.ts`, checkout route, order-plans | `"true"` = skip Stripe |
| `NEXT_PUBLIC_SITE_PASSWORD` | `lib/site-beta-gate.ts` | Optional beta gate |
| `VERCEL_ENV` | `server-supabase-env.ts` | Diagnostics only |
| `NODE_ENV` | `server-supabase-env.ts` | Diagnostics only |

---

## Deployment

- **App:** Vercel, `npm run build` / `next start`, no `vercel.json`
- **DB:** `npm run db:push` or paste `supabase/sql/production_*.sql`
- **Types:** `npm run db:types` after schema changes
- **Stripe webhook:** `POST /api/stripe/webhook`, event `checkout.session.completed`
- **Post-deploy:** hit `POST /api/storage/sync-limits` once; create Auth user for studio

---

## Security model summary

| Surface | Trust boundary |
|---------|----------------|
| Public order insert | Anon key, INSERT-only RLS — cannot read other orders |
| Delivery token | 256-bit hex entropy; validated server-side with service role |
| Studio | Any authenticated Supabase user sees all orders (single-admin assumption) |
| Service role | Server-only; never in client bundle |
| Beta gate | Obscurity only (`NEXT_PUBLIC_SITE_PASSWORD` is in client bundle) |
