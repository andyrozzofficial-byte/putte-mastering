import { CUSTOMER_UPLOAD_BUCKET } from "@/lib/upload-customer-track";
import { bytesToMebibytes, MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/upload-limits";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";

/** Matches `supabase/config.toml` and Storage API string parsing. */
const BUCKET_FILE_SIZE_LIMIT = "500MiB";

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
        file_size_limit_mib:
          before?.file_size_limit != null
            ? Number(bytesToMebibytes(before.file_size_limit).toFixed(3))
            : null,
      });
    }

    const { error } = await supabase.storage.updateBucket(CUSTOMER_UPLOAD_BUCKET, {
      public: false,
      fileSizeLimit: BUCKET_FILE_SIZE_LIMIT,
    });
    if (error) {
      const lower = error.message.toLowerCase();
      const globalCap =
        lower.includes("entity too large") ||
        lower.includes("file size limit") ||
        lower.includes("global");
      console.warn("[storage] updateBucket fileSizeLimit failed", {
        bucket: CUSTOMER_UPLOAD_BUCKET,
        requested: BUCKET_FILE_SIZE_LIMIT,
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
      requested: BUCKET_FILE_SIZE_LIMIT,
      file_size_limit: after?.file_size_limit ?? null,
      file_size_limit_mib:
        after?.file_size_limit != null
          ? Number(bytesToMebibytes(after.file_size_limit).toFixed(3))
          : null,
      label: MAX_UPLOAD_LABEL,
    });

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.warn("[storage] ensureUploadBucketLimit threw", { message });
    return { ok: false, message };
  }
}
