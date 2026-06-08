# Flows — First Listen Mastering

Step-by-step implementation flows with file references. Architecture context: [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## 1. Customer upload → order creation

### Phase A: Upload on homepage

| Step | What happens | File(s) |
|------|--------------|---------|
| 1 | User accepts legal consent checkbox | `components/landing/upload-dropzone.tsx` |
| 2 | File picked/dropped; size validated ≤ 500 MiB | `lib/upload-limits.ts` → `getUploadSizeValidationError` |
| 3 | `ensureStorageLimitsSynced()` — once per session POST `/api/storage/sync-limits` | `lib/storage/sync-limits-client.ts` |
| 4 | `uploadCustomerTrack(file)` uploads to Storage | `lib/upload-customer-track.ts` |
| 5 | Object path: `incoming/{crypto.randomUUID()}-{sanitizeFileName(name)}` | Same file, `sanitizeFileName` |
| 6 | Supabase client: `createSupabaseClient()` (anon, no cookies) | `lib/supabase.ts` |
| 7 | Returns `storageRef`: `uploads/incoming/...` | Stored in session |
| 8 | `saveOrderUploadDraft({ storageRef, trackName, legalConsentAccepted })` | `lib/order-flow-session.ts` |
| 9 | Navigate to `/order/tjanst` | `upload-dropzone.tsx` |

**Session key:** `mastrad_order_upload_v1` in `sessionStorage`.

### Phase B: Choose plan + checkout

| Step | What happens | File(s) |
|------|--------------|---------|
| 1 | Load draft from session; require name + email | `components/order/order-plans-client.tsx` |
| 2 | Merge customer fields into draft on change | `mergeOrderUploadDraft()` |
| 3a | **Test mode** (`NEXT_PUBLIC_TEST_MODE=true`): | |
| | `submitOrderToSupabase(row)` | `lib/submit-order.ts` |
| | Build payload via `toOrdersInsertPayload()` | Maps `customer_message` → `notes` |
| | Generate `delivery_access_token` | `lib/delivery/access-token.ts` |
| | `createSupabaseClient().from("orders").insert(payload)` | Anon INSERT RLS |
| | Email customer with portal link | `sendResendEmail` |
| | Clear draft → `/order/confirm?mode=test` | |
| 3b | **Production:** POST `/api/stripe/checkout` | `app/api/stripe/checkout/route.ts` |
| | `createStripeCheckoutSession({ body, origin })` | `lib/stripe/checkout.ts` |
| | Validates plan against `ORDER_PLANS` | `lib/order-plans.ts` |
| | Stripe metadata: customer fields, `uploaded_file`, `service`, `price_label` | |
| | Redirect `window.location.href = session.url` | |
| | Clear draft before redirect | |

### Phase C: Stripe webhook → order row

| Step | What happens | File(s) |
|------|--------------|---------|
| 1 | Stripe POST raw body to `/api/stripe/webhook` | `app/api/stripe/webhook/route.ts` |
| 2 | Verify `stripe-signature` with `STRIPE_WEBHOOK_SECRET` | |
| 3 | Handle only `checkout.session.completed` | |
| 4 | Read metadata: `customer_*`, `track_name`, `uploaded_file`, `service`, `price_label` | |
| 5 | `createClient(url, SERVICE_ROLE_KEY)` — bypasses RLS | |
| 6 | INSERT `orders` with `status: "new"`, `delivery_access_token` | |
| 7 | Email customer | `deliveryPortalAbsoluteUrl(token)` |

**Idempotency:** No duplicate-session guard — replaying the same webhook event could insert duplicate orders.

---

## 2. Studio master delivery upload

Three-phase: **sign → XHR upload → complete**.

### Phase A: Sign (`POST /api/studio/orders/[id]/deliver/sign`)

| Step | What happens | File(s) |
|------|--------------|---------|
| 1 | `requireStudioSessionUser()` — 401 if no session | `lib/supabase/studio-api-auth.ts` |
| 2 | Validate `fileName` (WAV/MP3), `fileSizeBytes` ≤ 500 MiB | `deliver-master-workflow.ts`, `upload-limits.ts` |
| 3 | `getServiceRoleClientOrApiError()` | `lib/supabase/server-supabase-env.ts` |
| 4 | Load order; backfill `delivery_access_token` if null | `generateDeliveryAccessToken()` |
| 5 | `ensureUploadBucketLimit()` | `lib/storage/ensure-upload-bucket-limit.ts` |
| 6 | `objectPath = deliveries/{orderId}/{uuid}-{sanitized}` | `buildDeliverObjectPath()` |
| 7 | `supabase.storage.createSignedUploadUrl(objectPath)` | Service role |
| 8 | Return `{ signedUrl, objectPath, bucket }` | |

### Phase B: Browser XHR upload

| Step | What happens | File(s) |
|------|--------------|---------|
| 1 | Client: `DeliveryMasterUpload` | `components/studio/delivery-master-upload.tsx` |
| 2 | `ensureStorageLimitsSynced()` | |
| 3 | PUT multipart to `signedUrl` | `lib/studio/supabase-signed-upload-xhr.ts` |
| 4 | Headers: `x-upsert: false`, `apikey`, `Authorization: Bearer` = **anon key** | |
| 5 | Progress via `xhr.upload.onprogress` | |

### Phase C: Complete (`POST /api/studio/orders/[id]/deliver/complete`)

| Step | What happens | File(s) |
|------|--------------|---------|
| 1 | Session auth + validate `objectPath` under `deliveries/{orderId}/` | `assertValidDeliverObjectPath()` |
| 2 | `deliverMasterObjectExists()` — signed URL HEAD/GET, then list fallback | `deliver-master-workflow.ts` |
| 3 | `finalizeDeliverMasterUpload()` | Same file |
| 4 | `mastered_file = uploads/{objectPath}` | |
| 5 | INSERT `order_master_versions` with `version = max+1` | |
| 6 | UPDATE `orders`: `mastered_file`, `status: "completed"`, `delivery_completed_at` | |
| 7 | Email customer + `STUDIO_NOTIFY_EMAIL` | |
| 8 | Return `{ deliveryUrl, masteredFile, version }` | |

---

## 3. Customer download

| Step | What happens | File(s) |
|------|--------------|---------|
| 1 | Customer opens `/delivery/[token]` | `app/delivery/[token]/page.tsx` |
| 2 | Service role: `orders` WHERE `delivery_access_token = token` | |
| 3 | Load versions + revisions in parallel | |
| 4 | Download link: `/api/delivery/{token}/download` or `?version=N` | |
| 5 | API: resolve `storage_ref` (latest version or specific) | `app/api/delivery/[token]/download/route.ts` |
| 6 | Parse `bucket/path` from `storage_ref` | `parseStorageRef()` |
| 7 | `createSignedUrl(path, 600s)` | Service role |
| 8 | `rpc("increment_order_delivery_download")` | |
| 9 | Proxy upstream with Range support, set `Content-Disposition` | `lib/delivery/download-headers.ts` |

Token is **never** logged in full — only prefixes in error logs.

---

## 4. Delivery token lifecycle

```
generateDeliveryAccessToken()
  └─ randomBytes(32).toString("hex")  → 64 hex chars, path-safe
       │
       ├─ Set on order INSERT (submit-order, webhook)
       ├─ Backfilled on deliver/sign if null (legacy rows)
       └─ Backfilled on finalize if null
```

| Function | File |
|----------|------|
| Generate | `lib/delivery/access-token.ts` |
| Portal URL | `lib/delivery/app-url.ts` → `{NEXT_PUBLIC_APP_URL}/delivery/{token}` |
| Validate | Service role `eq("delivery_access_token", t)` in delivery page + APIs |

**No expiry, no rotation** — token is valid for the life of the order.

---

## 5. Revision request flow

| Step | What happens | File(s) |
|------|--------------|---------|
| 1 | Customer submits form on delivery page | `components/delivery/revision-request-form.tsx` |
| 2 | POST `/api/delivery/{token}/revision` `{ message }` | |
| 3 | Validate 3–8000 chars | `app/api/delivery/[token]/revision/route.ts` |
| 4 | INSERT `order_revision_requests` | Service role |
| 5 | UPDATE `orders.status = "waiting_revision"` | |
| 6 | Email customer + studio notify | |

Studio can also set `waiting_revision` manually via `OrderStatusActions` — no email on manual status change except `in_progress`.

---

## 6. Studio auth flow

```
Request /studio/ordrar
  │
  ▼
middleware.ts
  ├─ beta gate? (cookie check)
  ├─ createServerClient + getUser()
  └─ no user? → redirect /login?next=/studio/ordrar
  │
  ▼
app/studio/layout.tsx
  ├─ createStudioServerClient + getUser()
  └─ no user? → redirect /login
  │
  ▼
DashboardShell + page (Server Component)
  └─ fetchStudioOrders() via authenticated client
```

**Login:**
1. `LoginForm` → `signInWithPassword` (`studio-browser.ts`)
2. `router.replace(redirectTo)` + `refresh()`
3. Middleware sees session on next request

**Logout:**
1. `signOut()` → redirect `/`

---

## 7. Studio status state machine

Canonical DB values: `new` | `in_progress` | `waiting_revision` | `completed`

`mapDbStatusToBadge()` also accepts legacy/Swedish aliases (`ny`, `pågår`, `klar`, etc.) — `lib/studio/orders-data.ts`.

### Transitions (not enforced — studio UI allows jumps)

```
                    ┌─────────────────┐
                    │       new       │  ← default on INSERT
                    └────────┬────────┘
                             │ studio: "Start mastering" OR manual
                             ▼
                    ┌─────────────────┐
         ┌─────────│  in_progress    │─────────┐
         │         └────────┬────────┘         │
         │                  │                  │
  studio: "Request          │ deliver          │ studio: "Mark completed"
  revision" (manual)        │ complete API     │ (manual, no email)
         │                  ▼                  │
         │         ┌─────────────────┐         │
         └────────▶│ waiting_revision│         │
                   └────────┬────────┘         │
                            │ customer revision │
                            │ form (API)        │
                            └────────┬──────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │    completed    │
                            └─────────────────┘
```

| Transition | Mechanism | Email? |
|------------|-----------|--------|
| → `new` | INSERT | Order received (checkout path) |
| → `in_progress` | `OrderStatusActions` → status API | Yes — customer |
| → `waiting_revision` | Revision form API **or** studio manual | Yes — customer + notify (form only) |
| → `completed` | Deliver complete **or** studio manual | Yes — customer + notify (deliver only) |

**UI:** `components/studio/order-status-actions.tsx` shows buttons for every status except current.

---

## 8. Email flow matrix

| Event | Caller | To | Subject | CTA |
|-------|--------|-----|---------|-----|
| Order created (test) | `submit-order.ts` | `customer_email` | We received your mastering order | Open delivery page |
| Order created (Stripe) | `stripe/webhook` | `customer_email` | We received your mastering order | Open delivery page |
| In progress | `studio/.../status` | `customer_email` | We're working on your master | Open delivery page |
| Master ready | `finalizeDeliverMasterUpload` | `customer_email` | Your master is ready | Download master |
| Master uploaded (internal) | `finalizeDeliverMasterUpload` | `STUDIO_NOTIFY_EMAIL` | Master uploaded — {track} | Open delivery page |
| Revision received | `delivery/.../revision` | `customer_email` | We received your revision request | Open delivery page |
| Revision (internal) | `delivery/.../revision` | `STUDIO_NOTIFY_EMAIL` | Revision request — {track} | Open customer portal |

All use `renderBrandedEmail()` + `sendResendEmail()`. Failures log `[EMAIL FAILED]` but do not roll back DB writes.

---

## 9. Storage sync side flow

Runs before customer and studio uploads (once per browser session):

```
ensureStorageLimitsSynced()
  → POST /api/storage/sync-limits
    → ensureUploadBucketLimit()
      → service role updateBucket("uploads", { fileSizeLimit: "500MiB" })
```

If this fails, uploads may hit 50 MB Supabase Free global cap — see troubleshooting in PROJECT_MAP.

---

## 10. Beta gate flow

When `NEXT_PUBLIC_SITE_PASSWORD` is set:

1. **Middleware:** non-exempt paths without cookie → redirect `/`
2. **Layout:** `SiteBetaGate` shows password overlay on `/`
3. Correct password → `grantSiteBetaAccess()` sets cookie + localStorage for 30 days
4. Exempt: `/studio`, `/login`, `/delivery`, `/terms`, `/privacy`, `/revisions`, `/api/*`
