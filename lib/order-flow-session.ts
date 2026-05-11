export const ORDER_UPLOAD_SESSION_KEY = "mastrad_order_upload_v1";

export type OrderUploadDraft = {
  /** `{bucket}/{path}` e.g. `uploads/incoming/uuid-file.wav` */
  storageRef: string;
  /** Original file name for display / track_name. */
  trackName: string;
  customer_name?: string;
  customer_email?: string;
  customer_message?: string;
};

export function saveOrderUploadDraft(draft: OrderUploadDraft): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(ORDER_UPLOAD_SESSION_KEY, JSON.stringify(draft));
}

export function readOrderUploadDraft(): OrderUploadDraft | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(ORDER_UPLOAD_SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const trackName = parsed.trackName;
    if (typeof trackName !== "string") return null;

    if (typeof parsed.storageRef === "string") {
      const base = { storageRef: parsed.storageRef, trackName };
      return {
        ...base,
        ...readOptionalCustomerFields(parsed),
      };
    }

    /* Legacy drafts stored path inside bucket only */
    if (typeof parsed.storagePath === "string") {
      const pathInsideBucket = parsed.storagePath;
      const storageRef = pathInsideBucket.startsWith("uploads/")
        ? pathInsideBucket
        : `uploads/${pathInsideBucket}`;
      return {
        storageRef,
        trackName,
        ...readOptionalCustomerFields(parsed),
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function clearOrderUploadDraft(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(ORDER_UPLOAD_SESSION_KEY);
}

function readOptionalCustomerFields(parsed: Record<string, unknown>): Pick<
  OrderUploadDraft,
  "customer_name" | "customer_email" | "customer_message"
> {
  const out: Pick<
    OrderUploadDraft,
    "customer_name" | "customer_email" | "customer_message"
  > = {};
  if (typeof parsed.customer_name === "string")
    out.customer_name = parsed.customer_name;
  if (typeof parsed.customer_email === "string")
    out.customer_email = parsed.customer_email;
  if (typeof parsed.customer_message === "string")
    out.customer_message = parsed.customer_message;
  return out;
}

/** Persists customer fields into the same session draft as the upload (no-op if no draft). */
export function mergeOrderUploadDraft(
  patch: Partial<
    Pick<
      OrderUploadDraft,
      "customer_name" | "customer_email" | "customer_message"
    >
  >,
): void {
  const current = readOrderUploadDraft();
  if (!current) return;
  saveOrderUploadDraft({ ...current, ...patch });
}
