import { randomBytes } from "node:crypto";

/** URL-safe opaque token for customer delivery links (no login). */
export function generateDeliveryAccessToken(): string {
  return randomBytes(32).toString("base64url");
}
