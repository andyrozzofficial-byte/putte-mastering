export function parseStorageRef(ref: string): { bucket: string; path: string } {
  const trimmed = ref.trim();
  const slash = trimmed.indexOf("/");
  const bucket = slash >= 0 ? trimmed.slice(0, slash) : "uploads";
  const path = slash >= 0 ? trimmed.slice(slash + 1) : trimmed;
  return { bucket, path };
}
