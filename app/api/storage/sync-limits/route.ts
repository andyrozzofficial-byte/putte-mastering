import { apiJsonError, apiJsonSuccess } from "@/lib/api/json-response";
import { ensureUploadBucketLimit } from "@/lib/storage/ensure-upload-bucket-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Idempotent: set `uploads` bucket file size limit to 500MB (hosted Supabase). */
export async function POST() {
  try {
    const result = await ensureUploadBucketLimit();
    if (!result.ok) {
      return apiJsonError(
        result.message?.trim() ||
          "Could not update storage limits. Apply supabase/sql/storage_uploads_500mb_limit.sql in Supabase.",
        500,
      );
    }
    return apiJsonSuccess({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return apiJsonError(message, 500);
  }
}
