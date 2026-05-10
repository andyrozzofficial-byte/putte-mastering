import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });

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

  const path = request.nextUrl.pathname;

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
  matcher: ["/studio/:path*", "/login"],
};
