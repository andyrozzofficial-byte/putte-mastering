export const ORDER_UPLOAD_SESSION_KEY = "mastrad_order_upload_v1";

export type OrderUploadDraft = {
  /** Public or canonical URL/path for the uploaded source file (storage). */
  uploadedFile: string;
  /** Path inside the storage bucket. */
  storagePath: string;
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
    const parsed = JSON.parse(raw) as OrderUploadDraft;
    if (
      typeof parsed.uploadedFile === "string" &&
      typeof parsed.storagePath === "string" &&
      typeof parsed.trackName === "string"
    ) {
      return parsed;
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
