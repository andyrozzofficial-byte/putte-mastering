/** Public site origin for absolute links in emails (no trailing slash). */
export function getPublicAppOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "https://firstlistenmastering.com";
}

/** Customer delivery portal URL for a given opaque token. */
export function deliveryPortalAbsoluteUrl(token: string): string {
  const origin = getPublicAppOrigin();
  const path = `/delivery/${token}`;
  return origin ? `${origin}${path}` : path;
}
