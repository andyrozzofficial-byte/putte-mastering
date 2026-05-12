/**
 * Parse JSON from a fetch response body; never throws raw `JSON.parse` errors.
 * Detects HTML/plain-text error pages (e.g. Vercel body limit: "Request …").
 */
export function parseApiJsonBody(
  raw: string,
  res: Response,
): Record<string, unknown> {
  const trimmed = raw.trim();
  if (!trimmed) {
    if (!res.ok) {
      throw new Error(`Request failed (HTTP ${res.status}).`);
    }
    return {};
  }
  const lower = trimmed.slice(0, 32).toLowerCase();
  if (
    lower.startsWith("<!doctype") ||
    lower.startsWith("<html") ||
    lower.startsWith("<head") ||
    lower.startsWith("<body")
  ) {
    throw new Error(
      `Server returned HTML instead of JSON (HTTP ${res.status}). Try a smaller file or contact support.`,
    );
  }
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    const preview = trimmed.slice(0, 200).replace(/\s+/g, " ");
    throw new Error(
      `Server did not return JSON (HTTP ${res.status}): ${preview}`,
    );
  }
  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    const preview = trimmed.slice(0, 200).replace(/\s+/g, " ");
    throw new Error(`Invalid JSON from server (HTTP ${res.status}): ${preview}`);
  }
}
