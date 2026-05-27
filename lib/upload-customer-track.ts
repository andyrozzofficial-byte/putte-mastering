import {
  getUploadSizeValidationError,
  mapStorageUploadError,
} from "@/lib/upload-limits";
import { createSupabaseClient } from "@/lib/supabase";

export const CUSTOMER_UPLOAD_BUCKET = "uploads";

function sanitizeFileName(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_|_$/g, "");
  return base.slice(0, 180) || "track";
}

export type UploadCustomerTrackResult = {
  /**
   * Stored in DB `uploaded_file`: `{bucket}/{path-inside-bucket}`.
   * Safe with a private bucket — resolve via signed URL server-side when needed.
   */
  storageRef: string;
};

/**
 * Uploads the customer's audio file to Supabase Storage (`uploads` bucket).
 * Policy should allow anon INSERT only under `incoming/`.
 */
export async function uploadCustomerTrack(
  file: File,
): Promise<UploadCustomerTrackResult> {
  const supabase = createSupabaseClient();
  const objectPath = `incoming/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;

  const { error } = await supabase.storage
    .from(CUSTOMER_UPLOAD_BUCKET)
    .upload(objectPath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

  if (error) {
    throw new Error(mapStorageUploadError(error.message));
  }

  return {
    storageRef: `${CUSTOMER_UPLOAD_BUCKET}/${objectPath}`,
  };
}
