import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import {
  BETA_ACCESS_COOKIE,
  getSiteBetaPassword,
  isApiPath,
  isSiteBetaExemptPath,
} from "@/lib/site-beta-gate";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

function applyBetaGate(request: NextRequest, response: NextResponse): NextResponse | null {
  const betaPassword = getSiteBetaPassword();
  if (!betaPassword) return null;

  const path = request.nextUrl.pathname;
  if (isSiteBetaExemptPath(path)) return null;

  const hasAccess = request.cookies.get(BETA_ACCESS_COOKIE)?.value === "1";
  if (hasAccess) return null;

  // Homepage renders the password gate in layout; avoid redirect loops.
  if (path === "/") return null;

  const gateUrl = request.nextUrl.clone();
  gateUrl.pathname = "/";
  gateUrl.search = "";
  const redirectResponse = NextResponse.redirect(gateUrl);
  response.cookies.getAll().forEach((c) => {
    redirectResponse.cookies.set(c.name, c.value);
  });
  response.headers.forEach((value, key) => {
    redirectResponse.headers.set(key, value);
  });
  return redirectResponse;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Never run auth/beta logic on API routes (Stripe webhooks, delivery, etc.).
  if (isApiPath(path)) {
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request,
  });

  const betaRedirect = applyBetaGate(request, response);
  if (betaRedirect) return betaRedirect;

  const needsAuth = path === "/login" || path.startsWith("/studio");
  if (!needsAuth) {
    return response;
  }

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headersToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headersToSet).forEach(([key, value]) =>
          response.headers.set(key, value),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (path.startsWith("/studio") && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", path);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    response.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value);
    });
    response.headers.forEach((value, key) => {
      redirectResponse.headers.set(key, value);
    });
    return redirectResponse;
  }

  if (path === "/login" && user) {
    const redirectResponse = NextResponse.redirect(
      new URL("/studio", request.nextUrl.origin),
    );
    response.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value);
    });
    response.headers.forEach((value, key) => {
      redirectResponse.headers.set(key, value);
    });
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Exclude /api/* entirely so webhooks (e.g. POST /api/stripe/webhook) never
     * pass through middleware — beta gate uses 307 redirects that break Stripe
     * and static assets like site.webmanifest.
     */
    "/((?!api(?:/|$)|_next/static|_next/image|favicon.ico|site\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|wav|webmanifest)$).*)",
  ],
};
