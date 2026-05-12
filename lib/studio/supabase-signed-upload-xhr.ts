/**
 * Browser-only: PUT multipart body matching @supabase/storage-js uploadToSignedUrl,
 * with upload progress (not available on the stock Storage client).
 */
export function uploadFileToSupabaseSignedUrlWithProgress(options: {
  signedUrl: string;
  file: File;
  /** Public anon key — same headers the JS client sends to Storage. */
  supabaseAnonKey: string;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}): Promise<void> {
  const { signedUrl, file, supabaseAnonKey, onProgress, signal } = options;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const body = new FormData();
    body.append("cacheControl", "3600");
    body.append("", file);

    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.setRequestHeader("apikey", supabaseAnonKey);
    xhr.setRequestHeader("Authorization", `Bearer ${supabaseAnonKey}`);

    const onAbort = () => {
      xhr.abort();
    };
    if (signal) {
      if (signal.aborted) {
        reject(new Error("Aborted"));
        return;
      }
      signal.addEventListener("abort", onAbort, { once: true });
    }

    xhr.upload.onprogress = (e) => {
      const total = e.lengthComputable && e.total > 0 ? e.total : file.size;
      if (total > 0 && onProgress) {
        onProgress(Math.min(100, Math.round((e.loaded / total) * 100)));
      }
    };

    xhr.onload = () => {
      if (signal) signal.removeEventListener("abort", onAbort);
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }
      let msg = `Upload failed (HTTP ${xhr.status}).`;
      const raw = xhr.responseText?.trim();
      if (raw) {
        try {
          const j = JSON.parse(raw) as { message?: string; error?: string; msg?: string };
          const m = j.message ?? j.error ?? j.msg;
          if (typeof m === "string" && m.length > 0) msg = m;
        } catch {
          if (raw.length < 400) msg = raw;
        }
      }
      reject(new Error(msg));
    };

    xhr.onerror = () => {
      if (signal) signal.removeEventListener("abort", onAbort);
      reject(new Error("Network error during upload."));
    };

    xhr.onabort = () => {
      if (signal) signal.removeEventListener("abort", onAbort);
      reject(new Error("Aborted"));
    };

    xhr.send(body);
  });
}
