/** Client: request server to raise Storage bucket limit (once per session). */
let syncPromise: Promise<void> | null = null;

export function ensureStorageLimitsSynced(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!syncPromise) {
    syncPromise = fetch("/api/storage/sync-limits", { method: "POST" })
      .then(() => undefined)
      .catch(() => undefined);
  }
  return syncPromise;
}
