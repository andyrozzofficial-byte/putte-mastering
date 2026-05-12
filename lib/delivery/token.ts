import { createHmac, timingSafeEqual } from "node:crypto";

function getDeliveryTokenSecret(): string {
  const secret = process.env.DELIVERY_TOKEN_SECRET?.trim();
  if (!secret) {
    throw new Error("Missing DELIVERY_TOKEN_SECRET");
  }
  return secret;
}

function toBase64Url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

export function createDeliveryToken(orderId: string): string {
  const mac = createHmac("sha256", getDeliveryTokenSecret()).update(orderId).digest();
  return toBase64Url(mac);
}

export function verifyDeliveryToken(orderId: string, token: string): boolean {
  try {
    const expected = createDeliveryToken(orderId);
    const a = Buffer.from(expected);
    const b = Buffer.from(token);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

