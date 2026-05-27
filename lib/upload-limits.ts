/** Maximum upload size for customer + studio master uploads (500 MB). */
export const MAX_UPLOAD_BYTES = 500 * 1024 * 1024;

export const MAX_UPLOAD_LABEL = "500 MB";

export function formatUploadSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes >= 1024 * 1024 * 1024) {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb >= 10 ? Math.round(gb) : gb.toFixed(1)} GB`;
  }
  if (bytes >= 1024 * 1024) {
    const mb = bytes / (1024 * 1024);
    return `${mb >= 10 ? Math.round(mb) : mb.toFixed(1)} MB`;
  }
  if (bytes >= 1024) {
    const kb = bytes / 1024;
    return `${kb >= 10 ? Math.round(kb) : kb.toFixed(1)} KB`;
  }
  return `${Math.round(bytes)} B`;
}

/** Returns a user-facing message if the file is too large, otherwise null. */
export function getUploadSizeValidationError(
  file: Pick<File, "size"> | null | undefined,
): string | null {
  if (!file) return null;
  if (file.size <= MAX_UPLOAD_BYTES) return null;
  return `This file is ${formatUploadSize(file.size)}. Maximum upload size is ${MAX_UPLOAD_LABEL}.`;
}

export function assertUploadSizeBytes(bytes: number): void {
  if (!Number.isFinite(bytes) || bytes < 0) {
    throw new Error("INVALID_FILE_SIZE");
  }
  if (bytes > MAX_UPLOAD_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }
}

/** Map Supabase Storage / network errors to clear copy for the UI. */
export function mapStorageUploadError(raw: string): string {
  const msg = raw.trim();
  const lower = msg.toLowerCase();

  if (
    lower.includes("exceeded the maximum allowed size") ||
    lower.includes("maximum allowed size") ||
    lower.includes("entity too large") ||
    lower.includes("payload too large") ||
    lower.includes("file too large") ||
    lower.includes("413")
  ) {
    return `This file exceeds the ${MAX_UPLOAD_LABEL} upload limit. If this keeps happening, the storage bucket may still be capped in Supabase — run the storage limit SQL in the Supabase dashboard, or try a shorter export.`;
  }

  if (lower.includes("bucket not found")) {
    return "Upload storage is not configured yet. Please contact the studio.";
  }

  if (lower.includes("row-level security") || lower.includes("policy")) {
    return "Upload was blocked by storage permissions. Please contact the studio.";
  }

  if (lower.includes("network error") || lower.includes("failed to fetch")) {
    return "Network error during upload. Check your connection and try again.";
  }

  if (lower.includes("aborted")) {
    return "Upload cancelled.";
  }

  return msg || "Upload failed. Please try again.";
}
