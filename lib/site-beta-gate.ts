/**
 * Site-wide beta password gate. Remove later by deleting this file,
 * `components/site-beta-gate.tsx`, and the wrapper in `app/layout.tsx`.
 */

export const BETA_ACCESS_STORAGE_KEY = "flm_site_beta_access";
export const BETA_ACCESS_COOKIE = "flm_site_beta_access";

/** Client + build-time: gate is off when env var is unset. */
export function getSiteBetaPassword(): string | undefined {
  const value = process.env.NEXT_PUBLIC_SITE_PASSWORD?.trim();
  return value || undefined;
}

export function isSiteBetaGateEnabled(): boolean {
  return Boolean(getSiteBetaPassword());
}

/** API routes (webhooks, delivery downloads, storage sync) must never hit page middleware. */
export function isApiPath(pathname: string): boolean {
  return pathname === "/api" || pathname.startsWith("/api/");
}

/** Paths that skip the beta gate (studio admin remains reachable). */
export function isSiteBetaExemptPath(pathname: string): boolean {
  return (
    isApiPath(pathname) ||
    pathname === "/login" ||
    pathname.startsWith("/studio") ||
    pathname.startsWith("/delivery") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/revisions")
  );
}

export function grantSiteBetaAccess(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BETA_ACCESS_STORAGE_KEY, "1");
    sessionStorage.setItem(BETA_ACCESS_STORAGE_KEY, "1");
  } catch {
    // ignore private mode / quota
  }
  const maxAge = 60 * 60 * 24 * 30; // 30 days
  document.cookie = `${BETA_ACCESS_COOKIE}=1; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function hasSiteBetaAccess(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (localStorage.getItem(BETA_ACCESS_STORAGE_KEY) === "1") return true;
    if (sessionStorage.getItem(BETA_ACCESS_STORAGE_KEY) === "1") return true;
  } catch {
    // ignore
  }
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${BETA_ACCESS_COOKIE}=`));
}
