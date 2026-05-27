/** Client: request server to raise Storage bucket limit (once per session). */
let syncPromise: Promise<void> | null = null;

export function ensureStorageLimitsSynced(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!syncPromise) {
    syncPromise = fetch("/api/storage/sync-limits", { method: "POST" })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.warn("[upload-limits] storage sync-limits failed", {
            status: res.status,
            body: text.slice(0, 200),
          });
        }
      })
      .catch((e) => {
        console.warn("[upload-limits] storage sync-limits request error", {
          message: e instanceof Error ? e.message : String(e),
        });
      });
  }
  return syncPromise;
}
