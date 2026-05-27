/** Binary mebibytes (1024²), matching Supabase `MiB` / `config.toml`. */
export const BYTES_PER_MIB = 1024 * 1024;

/** Maximum upload size for customer + studio master uploads (500 MiB). */
export const MAX_UPLOAD_BYTES = 500 * BYTES_PER_MIB;

export const MAX_UPLOAD_LABEL = "500 MB";

/** Supabase Free plan global storage cap (decimal MB on hosted). */
export const SUPABASE_FREE_GLOBAL_MAX_BYTES = 50 * 1_000_000;

export type UploadSizeValidationContext =
  | "customer-upload"
  | "upload-dropzone"
  | "studio-deliver-sign"
  | "studio-deliver-upload";

/** File size in mebibytes (bytes ÷ 1024²). */
export function bytesToMebibytes(bytes: number): number {
  return bytes / BYTES_PER_MIB;
}

export function formatUploadSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes >= 1024 * 1024 * 1024) {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb >= 10 ? Math.round(gb) : gb.toFixed(1)} GB`;
  }
  if (bytes >= BYTES_PER_MIB) {
    const mb = bytesToMebibytes(bytes);
    return `${mb >= 10 ? Math.round(mb) : mb.toFixed(1)} MB`;
  }
  if (bytes >= 1024) {
    const kb = bytes / 1024;
    return `${kb >= 10 ? Math.round(kb) : kb.toFixed(1)} KB`;
  }
  return `${Math.round(bytes)} B`;
}

export function isWithinUploadLimit(bytes: number): boolean {
  return Number.isFinite(bytes) && bytes >= 0 && bytes <= MAX_UPLOAD_BYTES;
}

export function logUploadSizeValidation(
  context: UploadSizeValidationContext,
  details: {
    fileName?: string;
    bytes: number;
    accepted: boolean;
    source?: "app" | "storage";
  },
): void {
  const mib = bytesToMebibytes(details.bytes);
  console.info("[upload-limits] size check", {
    context,
    fileName: details.fileName ?? null,
    bytes: details.bytes,
    mebibytes: Number.isFinite(mib) ? Number(mib.toFixed(3)) : null,
    formatted: formatUploadSize(details.bytes),
    maxBytes: MAX_UPLOAD_BYTES,
    maxMebibytes: bytesToMebibytes(MAX_UPLOAD_BYTES),
    accepted: details.accepted,
    source: details.source ?? "app",
  });
}

/** Returns a user-facing message if the file is too large, otherwise null. */
export function getUploadSizeValidationError(
  file: Pick<File, "size" | "name"> | null | undefined,
  context: UploadSizeValidationContext = "customer-upload",
): string | null {
  if (!file) return null;

  const bytes = file.size;
  if (!Number.isFinite(bytes) || bytes < 0) {
    logUploadSizeValidation(context, {
      fileName: file.name,
      bytes: Number(bytes),
      accepted: false,
    });
    return "Could not read file size. Try choosing the file again.";
  }

  const accepted = isWithinUploadLimit(bytes);
  logUploadSizeValidation(context, {
    fileName: file.name,
    bytes,
    accepted,
  });

  if (accepted) return null;

  return `This file is ${formatUploadSize(bytes)} (${bytes.toLocaleString()} bytes). Maximum upload size is ${MAX_UPLOAD_LABEL} (${MAX_UPLOAD_BYTES.toLocaleString()} bytes).`;
}

export function assertUploadSizeBytes(
  bytes: number,
  context: UploadSizeValidationContext = "studio-deliver-sign",
): void {
  if (!Number.isFinite(bytes) || bytes < 0) {
    logUploadSizeValidation(context, { bytes: Number(bytes), accepted: false });
    throw new Error("INVALID_FILE_SIZE");
  }

  const accepted = isWithinUploadLimit(bytes);
  logUploadSizeValidation(context, { bytes, accepted });

  if (!accepted) {
    throw new Error("FILE_TOO_LARGE");
  }
}

function looksLikeStorageSizeCap(lower: string): boolean {
  return (
    lower.includes("exceeded the maximum allowed size") ||
    lower.includes("maximum allowed size") ||
    lower.includes("entity too large") ||
    lower.includes("payload too large") ||
    lower.includes("file too large") ||
    lower.includes("413")
  );
}

/** Map Supabase Storage / network errors to clear copy for the UI. */
export function mapStorageUploadError(raw: string, fileSizeBytes?: number): string {
  const msg = raw.trim();
  const lower = msg.toLowerCase();

  if (looksLikeStorageSizeCap(lower)) {
    if (fileSizeBytes != null && Number.isFinite(fileSizeBytes)) {
      logUploadSizeValidation("customer-upload", {
        bytes: fileSizeBytes,
        accepted: isWithinUploadLimit(fileSizeBytes),
        source: "storage",
      });
    }

    const withinAppLimit =
      fileSizeBytes == null || !Number.isFinite(fileSizeBytes) || isWithinUploadLimit(fileSizeBytes);

    if (withinAppLimit) {
      return `Upload was blocked by storage (${formatUploadSize(fileSizeBytes ?? 0)} is under our ${MAX_UPLOAD_LABEL} limit). The Supabase project may still have a 50 MB global cap (Free plan) or the uploads bucket may need the 500 MB limit — run supabase/sql/storage_uploads_500mb_limit.sql or POST /api/storage/sync-limits, then check Storage → Settings → Global file size limit.`;
    }

    return `This file is ${formatUploadSize(fileSizeBytes!)}. Maximum upload size is ${MAX_UPLOAD_LABEL}.`;
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
