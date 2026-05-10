import { createSupabaseClient } from "@/lib/supabase";

const STORAGE_BUCKET = "uploads";

function sanitizeFileName(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_|_$/g, "");
  return base.slice(0, 180) || "track";
}

export type UploadCustomerTrackResult = {
  /** URL suitable for storing in `uploaded_file` (public URL if bucket is public). */
  uploadedFile: string;
  storagePath: string;
};

/**
 * Uploads the customer's audio file to Supabase Storage.
 * Requires a bucket named `uploads` and appropriate Storage policies for the anon role.
 */
export async function uploadCustomerTrack(
  file: File,
): Promise<UploadCustomerTrackResult> {
  const supabase = createSupabaseClient();
  const storagePath = `incoming/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  return {
    uploadedFile: data.publicUrl,
    storagePath,
  };
}
