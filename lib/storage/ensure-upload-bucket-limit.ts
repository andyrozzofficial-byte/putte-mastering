import { CUSTOMER_UPLOAD_BUCKET } from "@/lib/upload-customer-track";
import { MAX_UPLOAD_BYTES } from "@/lib/upload-limits";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";

/**
 * Ensures the `uploads` bucket accepts files up to MAX_UPLOAD_BYTES.
 * Safe to call repeatedly (idempotent). Requires service role.
 */
export async function ensureUploadBucketLimit(): Promise<{ ok: boolean; message?: string }> {
  try {
    const supabase = createServiceRoleSupabaseClient();
    const { error } = await supabase.storage.updateBucket(CUSTOMER_UPLOAD_BUCKET, {
      public: false,
      fileSizeLimit: MAX_UPLOAD_BYTES,
    });
    if (error) {
      console.warn("[storage] updateBucket fileSizeLimit failed", {
        bucket: CUSTOMER_UPLOAD_BUCKET,
        message: error.message,
      });
      return { ok: false, message: error.message };
    }
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.warn("[storage] ensureUploadBucketLimit threw", { message });
    return { ok: false, message };
  }
}
