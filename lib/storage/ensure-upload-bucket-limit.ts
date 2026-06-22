import { CUSTOMER_UPLOAD_BUCKET } from "@/lib/upload-customer-track";
import { bytesToMebibytes, MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/upload-limits";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";

/** Supabase Storage API expects `fileSizeLimit` in bytes (see storage-js docs). */
const BUCKET_FILE_SIZE_LIMIT_BYTES = MAX_UPLOAD_BYTES;

function fileSizeLimitToMebibytes(limit: unknown): number | null {
  if (typeof limit === "number" && Number.isFinite(limit)) {
    return Number(bytesToMebibytes(limit).toFixed(3));
  }
  if (typeof limit === "string" && /^\d+$/.test(limit.trim())) {
    return Number(bytesToMebibytes(Number(limit)).toFixed(3));
  }
  return null;
}

/**
 * Ensures the `uploads` bucket accepts files up to MAX_UPLOAD_BYTES.
 * Safe to call repeatedly (idempotent). Requires service role.
 * Capped by the project's global Storage file size limit in Supabase.
 */
export async function ensureUploadBucketLimit(): Promise<{ ok: boolean; message?: string }> {
  try {
    const supabase = createServiceRoleSupabaseClient();
    const { data: before, error: getErr } = await supabase.storage.getBucket(CUSTOMER_UPLOAD_BUCKET);
    if (getErr) {
      console.warn("[storage] getBucket before update failed", {
        bucket: CUSTOMER_UPLOAD_BUCKET,
        message: getErr.message,
      });
    } else {
      console.info("[storage] uploads bucket before limit sync", {
        file_size_limit: before?.file_size_limit ?? null,
        file_size_limit_mib: fileSizeLimitToMebibytes(before?.file_size_limit),
      });
    }

    const { error } = await supabase.storage.updateBucket(CUSTOMER_UPLOAD_BUCKET, {
      public: false,
      fileSizeLimit: BUCKET_FILE_SIZE_LIMIT_BYTES,
    });
    if (error) {
      const lower = error.message.toLowerCase();
      const globalCap =
        lower.includes("entity too large") ||
        lower.includes("file size limit") ||
        lower.includes("global");
      console.warn("[storage] updateBucket fileSizeLimit failed", {
        bucket: CUSTOMER_UPLOAD_BUCKET,
        requestedBytes: BUCKET_FILE_SIZE_LIMIT_BYTES,
        maxBytes: MAX_UPLOAD_BYTES,
        message: error.message,
        hint: globalCap
          ? "Project global Storage limit may be 50 MB (Supabase Free). Raise it in Dashboard → Storage → Settings."
          : undefined,
      });
      return { ok: false, message: error.message };
    }

    const { data: after } = await supabase.storage.getBucket(CUSTOMER_UPLOAD_BUCKET);
    console.info("[storage] uploads bucket limit synced", {
      requestedBytes: BUCKET_FILE_SIZE_LIMIT_BYTES,
      file_size_limit: after?.file_size_limit ?? null,
      file_size_limit_mib: fileSizeLimitToMebibytes(after?.file_size_limit),
      label: MAX_UPLOAD_LABEL,
    });

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.warn("[storage] ensureUploadBucketLimit threw", { message });
    return { ok: false, message };
  }
}
