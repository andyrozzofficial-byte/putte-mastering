/** Safe single-line value for `filename="..."` in Content-Disposition. */
export function sanitizeContentDispositionFilename(name: string): string {
  const cleaned = name
    .replace(/[\r\n"]/g, "")
    .replace(/[/\\]/g, "-")
    .trim()
    .slice(0, 180);
  return cleaned || "master";
}

export function guessAudioContentType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".wav")) return "audio/wav";
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  return "application/octet-stream";
}

/**
 * `attachment; filename="..."` plus RFC 5987 `filename*` when the encoded form differs.
 */
export function buildContentDispositionAttachment(originName: string): string {
  const safe = sanitizeContentDispositionFilename(originName);
  const star = encodeURIComponent(originName);
  return `attachment; filename="${safe}"; filename*=UTF-8''${star}`;
}

export function basenameFromStoragePath(objectPath: string): string {
  const i = objectPath.lastIndexOf("/");
  return i >= 0 ? objectPath.slice(i + 1) : objectPath;
}
