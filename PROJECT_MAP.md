# PROJECT_MAP — First Listen Mastering

Implementation-focused index for AI agents and developers. Deep dives: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) (schema, RLS, clients) and [`docs/FLOWS.md`](docs/FLOWS.md) (step-by-step flows).

---

## Quick facts

| Item | Value |
|------|-------|
| Product | Manual mastering studio — public checkout, token delivery portal, admin dashboard |
| Framework | Next.js 16 App Router, React 19, TypeScript, Tailwind 4 |
| Backend | Supabase (Postgres + Auth + Storage), Stripe, Resend |
| Hosting | Vercel (no `vercel.json`) |
| Storage bucket | `uploads` (private), 500 MiB target |
| Studio auth | Supabase email/password, cookie session |
| Customer auth | None — opaque `delivery_access_token` |

---

## Database schema (all columns)

Types: `lib/supabase/database.types.ts`. Migrations: `supabase/migrations/*.sql`.

### `orders`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `created_at` | timestamptz | |
| `customer_name` | text | |
| `customer_email` | text | |
| `track_name` | text | Usually original filename |
| `service` | text | `"Standard Master"` or `"Express Master"` |
| `status` | text | `new` \| `in_progress` \| `waiting_revision` \| `completed` |
| `notes` | text | Customer message (UI calls it `customer_message`) |
| `uploaded_file` | text | `uploads/incoming/{uuid}-{name}` |
| `mastered_file` | text | `uploads/deliveries/{orderId}/{uuid}-{name}` |
| `price` | bigint | Whole USD dollars |
| `delivery_access_token` | text UNIQUE | 64-char hex portal token |
| `delivery_completed_at` | timestamptz | Set on deliver finalize |
| `delivery_download_count` | integer NOT NULL | Default 0; incremented on download |
| `delivery_last_downloaded_at` | timestamptz | |

⚠️ Migration adds unused `customer_message` column — app writes **`notes`** only.

### `order_master_versions`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `order_id` | uuid FK → orders | CASCADE delete |
| `storage_ref` | text NOT NULL | Full `uploads/deliveries/...` ref |
| `version` | integer NOT NULL | UNIQUE per `(order_id, version)` |
| `created_at` | timestamptz | |

### `order_revision_requests`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `order_id` | uuid FK → orders | CASCADE delete |
| `message` | text NOT NULL | 3–8000 chars (API validation) |
| `created_at` | timestamptz | |

### RPC

`increment_order_delivery_download(p_order_id uuid)` — service_role only, updates download audit columns.

---

## Upload flow (implementation)

### Customer: homepage → Storage → order

```
UploadDropzone
  → getUploadSizeValidationError (≤ 500 MiB)
  → ensureStorageLimitsSynced() → POST /api/storage/sync-limits
  → uploadCustomerTrack(file)
       path: incoming/{uuid}-{sanitize(name)}
       client: createSupabaseClient() [anon, no cookies]
       returns: storageRef = "uploads/incoming/..."
  → saveOrderUploadDraft → sessionStorage
  → /order/tjanst
```

**Files:** `components/landing/upload-dropzone.tsx`, `lib/upload-customer-track.ts`, `lib/order-flow-session.ts`

### Studio: sign → XHR → complete → download

```
DeliveryMasterUpload
  → POST .../deliver/sign [session auth, service role signs]
  → uploadFileToSupabaseSignedUrlWithProgress [anon key headers]
       path: deliveries/{orderId}/{uuid}-{sanitize(name)}
  → POST .../deliver/complete { objectPath }
       → finalizeDeliverMasterUpload
       → INSERT order_master_versions, UPDATE orders
  → Customer: GET /api/delivery/{token}/download
       → signed URL proxy + increment download counter
```

**Files:** `components/studio/delivery-master-upload.tsx`, `lib/studio/supabase-signed-upload-xhr.ts`, `lib/studio/deliver-master-workflow.ts`, `app/api/delivery/[token]/download/route.ts`

### File naming

| Flow | Pattern | Sanitizer | Max name len |
|------|---------|-----------|--------------|
| Customer | `incoming/{uuid}-{name}` | `[^a-zA-Z0-9._-] → _` | 180 chars |
| Studio master | `deliveries/{orderId}/{uuid}-{name}` | same | 180 chars |
| Allowed extensions (studio) | `.wav`, `.mp3` only | `assertAllowedDeliverFileName` | |

**DB storage refs:** always `uploads/{path-inside-bucket}` (bucket prefix included).

---

## Middleware flow

**File:** `middleware.ts`  
**Matcher:** excludes static assets and media extensions.

```
1. applyBetaGate
   IF NEXT_PUBLIC_SITE_PASSWORD set
   AND path not exempt AND not / AND not /api/*
   AND cookie flm_site_beta_access ≠ "1"
   → redirect /

2. IF path is /login OR /studio/*
   createServerClient (anon + cookies)
   getUser()

   IF /studio/* AND no user → /login?next={path}
   IF /login AND user → /studio

3. return response (with refreshed auth cookies)
```

**Exempt from beta:** `/login`, `/studio/*`, `/delivery/*`, `/terms`, `/privacy`, `/revisions`, `/api/*`

**Second auth check:** `app/studio/layout.tsx` redirects to `/login` if no user.

---

## Auth flow

| Actor | Mechanism | Login | Session storage |
|-------|-----------|-------|-----------------|
| Studio admin | Supabase Auth `signInWithPassword` | `/login` | HTTP cookies via `@supabase/ssr` |
| Customer | None | — | — |
| Delivery | Token in URL | — | — |

| Action | File |
|--------|------|
| Login form | `components/auth/login-form.tsx` |
| Logout | `components/dashboard/studio-logout-button.tsx` |
| API auth guard | `lib/supabase/studio-api-auth.ts` → `requireStudioSessionUser()` |
| Safe redirect | `app/login/page.tsx` → `safeStudioRedirect()` (must start `/studio`) |

---

## Stripe flow (checkout → webhook)

```
OrderPlansClient
  → POST /api/stripe/checkout
       createStripeCheckoutSession()
       metadata: customer_*, track_name, uploaded_file, service, price_label
       success_url: /?order=success&session_id={CHECKOUT_SESSION_ID}
  → redirect to session.url

[Customer pays on Stripe]

Stripe → POST /api/stripe/webhook
  → constructEvent (STRIPE_WEBHOOK_SECRET)
  → checkout.session.completed only
  → read session.metadata
  → service role INSERT orders (status: new, delivery_access_token)
  → email customer with portal link
```

**Test mode:** `NEXT_PUBLIC_TEST_MODE=true` skips Stripe; `submitOrderToSupabase` inserts directly.

**Files:** `components/order/order-plans-client.tsx`, `lib/stripe/checkout.ts`, `app/api/stripe/checkout/route.ts`, `app/api/stripe/webhook/route.ts`

---

## Delivery portal & token generation

**Generate:** `randomBytes(32).toString("hex")` → 64 hex chars (`lib/delivery/access-token.ts`)

**Set when:**
- Order insert (test mode + webhook)
- Backfill on `deliver/sign` or `finalize` if null (legacy orders)

**Portal URL:** `{NEXT_PUBLIC_APP_URL}/delivery/{token}` (`lib/delivery/app-url.ts`)

**Page:** `app/delivery/[token]/page.tsx` — service role loads order, versions, revisions; download via API proxy (not direct signed URLs to customer).

**Validate:** `eq("delivery_access_token", token)` in page + all `/api/delivery/[token]/*` routes.

---

## Studio workflow state machine

**Canonical values:** `new` → `in_progress` → `waiting_revision` → `completed`

**Not strictly enforced** — `OrderStatusActions` can jump to any non-current status.

| Status | Set by | Email |
|--------|--------|-------|
| `new` | INSERT (checkout) | Order received |
| `in_progress` | Status API / studio button | Customer: "We're working on your master" |
| `waiting_revision` | Revision API or studio button | Customer + notify (revision form only) |
| `completed` | Deliver complete API or studio button | Customer + notify (deliver only) |

**Badge mapping** accepts legacy strings (`ny`, `pågår`, `klar`, etc.): `lib/studio/orders-data.ts` → `mapDbStatusToBadge`.

---

## Email flow (all triggers)

| # | Trigger | File | Subject |
|---|---------|------|---------|
| 1 | Test order insert | `lib/submit-order.ts` | We received your mastering order |
| 2 | Stripe webhook | `app/api/stripe/webhook/route.ts` | We received your mastering order |
| 3 | Status → in_progress | `app/api/studio/orders/[id]/status/route.ts` | We're working on your master |
| 4 | Deliver finalize | `lib/studio/deliver-master-workflow.ts` | Your master is ready |
| 5 | Deliver finalize (internal) | same | Master uploaded — {track} |
| 6 | Revision form | `app/api/delivery/[token]/revision/route.ts` | We received your revision request |
| 7 | Revision (internal) | same | Revision request — {track} |

**Infra:** `lib/email/resend.ts` (skips if no `RESEND_API_KEY`), `lib/email/templates.ts`

---

## Supabase RLS + client usage

### Policies

| Table | anon | authenticated | service_role |
|-------|------|---------------|--------------|
| `orders` | INSERT only | full CRUD | bypass |
| `order_master_versions` | — | SELECT | bypass (INSERT in deliver API) |
| `order_revision_requests` | — | SELECT | bypass (INSERT in revision API) |

### Which client where

| Operation | Client |
|-----------|--------|
| Customer storage upload | `createSupabaseClient()` anon |
| Test order insert | `createSupabaseClient()` anon |
| Studio dashboard reads | `createStudioServerClient()` authenticated |
| Studio status update API | `requireStudioSessionUser()` authenticated |
| Deliver sign/complete | session auth + **service role** for Storage/DB |
| Delivery page + download + revision | **service role** |
| Stripe webhook insert | **service role** |
| Storage bucket limit sync | **service role** |
| Middleware / login session | `createServerClient` anon + cookies |

---

## Environment variables (actual code usages)

| Variable | Files that read it |
|----------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `lib/supabase/env.ts`, `lib/supabase/server-supabase-env.ts`, `scripts/verify-order-insert.mjs`, `scripts/verify-upload-size-limits.mjs` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `lib/supabase/env.ts`, `components/studio/delivery-master-upload.tsx`, `lib/supabase/server-supabase-env.ts`, `scripts/verify-order-insert.mjs`, `scripts/verify-upload-size-limits.mjs` |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/supabase/env.ts`, `lib/supabase/server-supabase-env.ts`, `scripts/verify-upload-size-limits.mjs` |
| `SUPABASE_DB_URL` | `scripts/supabase-remote.mjs` |
| `STRIPE_SECRET_KEY` | `lib/stripe/checkout.ts`, `app/api/stripe/webhook/route.ts` |
| `STRIPE_WEBHOOK_SECRET` | `app/api/stripe/webhook/route.ts` |
| `RESEND_API_KEY` | `lib/email/resend.ts` |
| `RESEND_FROM_EMAIL` | `lib/email/resend.ts` |
| `STUDIO_NOTIFY_EMAIL` | `lib/email/resend.ts` |
| `NEXT_PUBLIC_APP_URL` | `lib/delivery/app-url.ts` |
| `NEXT_PUBLIC_TEST_MODE` | `lib/test-mode.ts`, `app/api/stripe/checkout/route.ts`, `app/api/stripe/webhook/route.ts`, `components/order/order-plans-client.tsx` |
| `NEXT_PUBLIC_SITE_PASSWORD` | `lib/site-beta-gate.ts` |
| `VERCEL_ENV` | `lib/supabase/server-supabase-env.ts` (diagnostics) |
| `NODE_ENV` | `lib/supabase/server-supabase-env.ts` (diagnostics) |

---

## Folder ownership map

What files control which features — edit these when changing behavior.

### Public marketing & upload

| Feature | Primary files |
|---------|---------------|
| Homepage | `app/page.tsx`, `components/landing/*` |
| Track upload | `components/landing/upload-dropzone.tsx`, `lib/upload-customer-track.ts` |
| Beta password gate | `components/site-beta-gate.tsx`, `lib/site-beta-gate.ts`, `middleware.ts`, `app/layout.tsx` |

### Order / checkout

| Feature | Primary files |
|---------|---------------|
| Plan selection UI | `app/order/tjanst/page.tsx`, `components/order/order-plans-client.tsx` |
| Plans & pricing | `lib/order-plans.ts`, `components/order/pricing-card.tsx` |
| Session draft | `lib/order-flow-session.ts` |
| Test-mode submit | `lib/submit-order.ts`, `lib/supabase.ts` (`ORDERS_INSERT_COLUMNS`) |
| Stripe checkout | `lib/stripe/checkout.ts`, `app/api/stripe/checkout/route.ts` |
| Stripe webhook | `app/api/stripe/webhook/route.ts` |
| Confirmation page | `app/order/confirm/page.tsx` |

### Delivery portal (customer)

| Feature | Primary files |
|---------|---------------|
| Portal page | `app/delivery/[token]/page.tsx`, `app/delivery/[token]/error.tsx` |
| Download API | `app/api/delivery/[token]/download/route.ts`, `lib/delivery/download-headers.ts` |
| Revision form | `components/delivery/revision-request-form.tsx`, `app/api/delivery/[token]/revision/route.ts` |
| Token + URLs | `lib/delivery/access-token.ts`, `lib/delivery/app-url.ts` |

### Studio dashboard

| Feature | Primary files |
|---------|---------------|
| Layout + shell | `app/studio/layout.tsx`, `components/dashboard/dashboard-shell.tsx`, `sidebar.tsx` |
| Overview | `app/studio/page.tsx` |
| Order lists | `app/studio/ordrar/page.tsx`, `app/studio/nya-ordrar/page.tsx`, `components/dashboard/orders-table.tsx` |
| Order detail | `app/studio/orders/[id]/page.tsx` |
| Status actions | `components/studio/order-status-actions.tsx`, `app/api/studio/orders/[id]/status/route.ts` |
| Master upload | `components/studio/delivery-master-upload.tsx`, `app/api/studio/orders/[id]/deliver/*` |
| Deliver workflow | `lib/studio/deliver-master-workflow.ts`, `lib/studio/supabase-signed-upload-xhr.ts` |
| Data layer | `lib/studio/orders-data.ts` |
| Login / logout | `app/login/page.tsx`, `components/auth/login-form.tsx`, `studio-logout-button.tsx` |
| Placeholders | `app/studio/kunder/page.tsx`, `filer/page.tsx`, `installningar/page.tsx` |

### Shared infrastructure

| Feature | Primary files |
|---------|---------------|
| Middleware | `middleware.ts` |
| Supabase clients | `lib/supabase/*` |
| Upload limits | `lib/upload-limits.ts`, `lib/storage/*` |
| Email | `lib/email/*` |
| API JSON | `lib/api/json-response.ts`, `lib/api/client-parse.ts` |
| DB schema | `supabase/migrations/*`, `lib/supabase/database.types.ts` |
| Ops scripts | `scripts/*` |

---

## TROUBLESHOOTING

Common breakpoints, symptoms, and where to look in logs (Vercel → Functions / Runtime Logs).

### Customer upload fails

| Symptom | Likely cause | Log prefix | Fix |
|---------|--------------|------------|-----|
| "exceeds maximum allowed size" under 500 MB | Supabase 50 MB global cap (Free) | `[upload-limits]`, `[storage]` | Dashboard → Storage → Settings; run `POST /api/storage/sync-limits` or `supabase/sql/storage_uploads_500mb_limit.sql` |
| "row-level security" / "policy" | Storage RLS missing for anon INSERT on `incoming/` | client error mapped in `mapStorageUploadError` | Add Storage policy in Supabase Dashboard |
| "bucket not found" | `uploads` bucket missing | `[upload-limits]` | Create private `uploads` bucket |
| Upload works, order fails | Anon INSERT RLS on `orders` | `[submit-order]`, `[verify-order-insert]` | Apply `supabase/migrations/20260220120000_*` or `production_orders_rls.sql` |

### Checkout / Stripe

| Symptom | Likely cause | Log prefix | Fix |
|---------|--------------|------------|-----|
| "Stripe is disabled in test mode" | `NEXT_PUBLIC_TEST_MODE=true` | checkout route | Unset for prod or use test flow |
| Webhook 400 signature | Wrong `STRIPE_WEBHOOK_SECRET` | stripe webhook | Match Stripe Dashboard endpoint secret |
| Order missing after payment | Webhook not configured or metadata missing | `[stripe-webhook]` | Ensure webhook URL + `checkout.session.completed`; check metadata fields |
| Duplicate orders | Webhook replay | `[stripe-webhook]` | No idempotency key today — see TECH_DEBT |

### Studio master delivery

| Symptom | Likely cause | Log prefix | Fix |
|---------|--------------|------------|-----|
| 401 on sign/complete | Session expired | `[deliver-sign] unauthorized` | Re-login |
| 500 missing env | No service role on server | `[deliver-sign] missing server env` | Set `SUPABASE_SERVICE_ROLE_KEY` on Vercel, redeploy |
| Upload works, complete fails "not found in storage" | Eventual consistency / wrong path | `[deliver-complete]`, `[deliver-storage]` | Retry; verify `objectPath` matches sign response |
| "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY" | Build env | `[deliver-sign]` warning | Add anon key to Vercel, redeploy |
| HTML instead of JSON | Vercel body limit / route crash | `parseApiJsonBody` error | Smaller file or check function logs |

### Delivery portal

| Symptom | Likely cause | Log prefix | Fix |
|---------|--------------|------------|-----|
| Invalid link | Bad token or missing column | `[delivery-page]` | Ensure `delivery_access_token` migration applied |
| Download 502 | Signed URL or upstream fail | `[delivery-download]` | Check object exists in Storage; bucket/path parse |
| PGRST204 on token column | Schema cache stale | — | Run migration NOTIFY or redeploy; `production_orders_delivery.sql` |

### Email not sent

| Symptom | Likely cause | Log prefix | Fix |
|---------|--------------|------------|-----|
| No email, order OK | `RESEND_API_KEY` missing | `[resend] RESEND_API_KEY missing` | Set key on Vercel |
| API error | Resend domain/from issues | `[resend] send failed` | Verify `RESEND_FROM_EMAIL` domain in Resend |

### Studio dashboard empty

| Symptom | Likely cause | Log prefix | Fix |
|---------|--------------|------------|-----|
| No orders shown | RLS or not logged in | `[studio] fetchStudioOrders failed` | Login; check authenticated SELECT policy |
| Wrong status badges | Legacy DB values | — | `mapDbStatusToBadge` handles aliases |

### Useful verify commands

```bash
npm run verify:order-insert    # anon INSERT smoke test
npm run verify:upload-limits   # size limit + optional upload test
npm run db:sync                # push migrations + regen types
```

---

## DO NOT BREAK

Critical flows and invariants. Changing these without end-to-end testing will break production.

### 1. Order insert payload shape

`ORDERS_INSERT_COLUMNS` in `lib/supabase.ts` must match the Supabase `orders` table INSERT columns exactly. `submit-order.ts` validates key sets before insert. **Webhook and test insert must stay aligned.**

### 2. Storage ref format

Always `uploads/{path}` in DB (`uploaded_file`, `mastered_file`, `storage_ref`). Download API parses first `/` as bucket boundary. **Do not store bare paths without bucket prefix.**

### 3. Delivery token uniqueness

`delivery_access_token` has UNIQUE constraint. Generator must stay path-safe hex (`lib/delivery/access-token.ts`). **Do not switch to base64 or UUID without URL encoding audit.**

### 4. Deliver path validation

`assertValidDeliverObjectPath` requires `deliveries/{orderId}/` prefix and blocks `..`. **Prevents cross-order writes.** Sign and complete must use the same `objectPath`.

### 5. Three Supabase clients

- Public upload/order: anon, no cookies
- Studio reads: authenticated session
- Delivery + webhook + sign URL: service role server-only

**Never expose service role to the browser.**

### 6. Studio upload XHR headers

`uploadFileToSupabaseSignedUrlWithProgress` must send `apikey` + `Authorization: Bearer` with **anon key** (matches Supabase Storage JS client). Changing to service role in browser would be a critical security bug.

### 7. Stripe webhook metadata

Checkout session metadata keys (`customer_email`, `track_name`, `uploaded_file`, `service`, etc.) must match webhook reader in `app/api/stripe/webhook/route.ts`. **Renaming breaks paid orders.**

### 8. RLS: anon INSERT only

Public flow never SELECTs orders with anon key. Adding `.select()` after insert from browser **will fail** by design.

### 9. `notes` vs `customer_message`

App maps customer message to `notes` column. **Do not rename without migration + updating `submit-order.ts`, webhook, and types.**

### 10. Version monotonicity

`order_master_versions.version` is `max+1` with UNIQUE `(order_id, version)`. **Concurrent delivers can 409** (`VERSION_CONFLICT`) — handled, not a bug.

### 11. Email links depend on `NEXT_PUBLIC_APP_URL`

Wrong value sends customers to wrong domain. Default fallback is `https://firstlistenmastering.com`.

### 12. Middleware cookie forwarding

Auth redirects copy cookies/headers from the middleware response to the redirect response. **Breaking this causes session loss on redirect.**

---

## TECH_DEBT

From code search: **no `TODO`, `FIXME`, `XXX`, or `HACK` comments** in `.ts/.tsx/.mjs/.sql`.

### Incomplete features

| Item | Location | Notes |
|------|----------|-------|
| Customers page | `app/studio/kunder/page.tsx` | Placeholder only |
| Files page | `app/studio/filer/page.tsx` | Placeholder only |
| Settings page | `app/studio/installningar/page.tsx` | Placeholder only |
| Source file download/play | `components/studio/customer-source-file.tsx` | UI stub — Download button not wired; no signed URL fetch |
| Overview "New order" button | `app/studio/page.tsx` | Button has no handler |
| `customer_message` DB column | migration `20260210120000` | Added but unused; app uses `notes` |

### Reliability gaps

| Item | Risk | Location |
|------|------|----------|
| No Stripe webhook idempotency | Duplicate orders on replay | `app/api/stripe/webhook/route.ts` |
| No enforced status state machine | Studio can skip steps (e.g. `new` → `completed` without deliver) | `order-status-actions.tsx` |
| Manual "Mark completed" | No customer email | status API |
| Beta password in `NEXT_PUBLIC_*` | Visible in client bundle — obscurity only | `lib/site-beta-gate.ts` |
| Storage RLS not in repo | Policies must be configured manually in Supabase | — |

### `console.error` inventory (observability)

Grouped by subsystem — useful when tailing Vercel logs:

| Prefix | Files | Typical cause |
|--------|-------|---------------|
| `[submit-order]` | `lib/submit-order.ts` | RLS, payload mismatch, insert failure |
| `[order-plans]` | `components/order/order-plans-client.tsx` | Checkout API errors |
| `[stripe-checkout]` | `lib/stripe/checkout.ts`, checkout route | Stripe session errors |
| `[stripe-webhook]` | webhook route | Metadata missing, insert failure |
| `[deliver-sign]` | deliver sign route | Auth, signed URL, env |
| `[deliver-complete]` | deliver complete route | Storage verify, finalize |
| `[deliver-storage]` | `deliver-master-workflow.ts` | Object existence checks |
| `[finalize]` | `deliver-master-workflow.ts` | DB steps during delivery |
| `[delivery-page]` | delivery page | Token lookup, query errors |
| `[delivery-download]` | download route | Signed URL, upstream fetch |
| `[delivery-revision]` | revision route | Insert, status update |
| `[studio-status]` | status route | Status update failure |
| `[studio]` | `orders-data.ts` | Dashboard fetch failures |
| `[resend]` | `resend.ts` | Email API failures |
| `[EMAIL FAILED]` | multiple | Email threw after DB success |

### `console.warn` hotspots

| Prefix | Meaning |
|--------|---------|
| `[resend] RESEND_API_KEY missing` | Emails silently skipped |
| `[deliver-sign] NEXT_PUBLIC_SUPABASE_ANON_KEY missing` | Studio upload will fail in browser |
| `[upload-limits] storage sync-limits failed` | Bucket may still be 50 MB cap |
| `[storage] updateBucket fileSizeLimit failed` | Global Supabase cap blocking 500 MB |

---

## npm scripts

| Command | Action |
|---------|--------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run db:push` | Apply migrations to remote DB |
| `npm run db:types` | Regenerate `database.types.ts` |
| `npm run db:sync` | Push + types |
| `npm run verify:order-insert` | Anon insert smoke test |
| `npm run verify:upload-limits` | Upload size validation test |

---

## Related docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — schema, RLS, clients, middleware, email infra
- [`docs/FLOWS.md`](docs/FLOWS.md) — numbered step-by-step flows with file references
- [`AGENTS.md`](AGENTS.md) — Next.js 16 agent rules
