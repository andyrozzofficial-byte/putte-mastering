export const ORDER_UPLOAD_SESSION_KEY = "mastrad_order_upload_v1";

export type OrderUploadDraft = {
  /** `{bucket}/{path}` e.g. `uploads/incoming/uuid-file.wav` */
  storageRef: string;
  /** Original file name for display / track_name. */
  trackName: string;
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
      return { storageRef: parsed.storageRef, trackName };
    }

    /* Legacy drafts stored path inside bucket only */
    if (typeof parsed.storagePath === "string") {
      const pathInsideBucket = parsed.storagePath;
      const storageRef = pathInsideBucket.startsWith("uploads/")
        ? pathInsideBucket
        : `uploads/${pathInsideBucket}`;
      return { storageRef, trackName };
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
