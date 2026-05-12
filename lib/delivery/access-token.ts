import { randomBytes } from "node:crypto";

/**
 * URL-safe opaque token for customer delivery links (no login).
 * Uses hex (0–9a-f) so it stays path-safe on all Node/Vercel runtimes.
 */
export function generateDeliveryAccessToken(): string {
  return randomBytes(32).toString("hex");
}
