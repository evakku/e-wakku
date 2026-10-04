import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

/**
 * Middleware — runs on every request matching /admin/:path*
 *
 * Responsibilities:
 * 1. Instantiate a Supabase SSR client that can read/write cookies on the
 *    NextResponse (required so session tokens get refreshed on every request).
 * 2. Call `getUser()` — the only secure way to verify the session server-side.
 *    `getSession()` is NOT used because it trusts unvalidated client-side data.
 * 3. Protect /admin/* routes: redirect unauthenticated users to /admin/login.
 * 4. Prevent authenticated users from landing on /admin/login unnecessarily.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { url, anonKey } = getSupabaseConfig();

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // First apply to the request (so the Supabase client itself sees them)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Then rebuild the response so the refreshed tokens are sent to the
          // browser.
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: do NOT run any logic between createServerClient and getUser().
  // A subtle bug can make it difficult to debug issues with users being
  // randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute =
    pathname === "/admin/login" ||
    pathname === "/admin/forgot-password" ||
    pathname === "/admin/reset-password";

  // Unauthenticated user trying to access a protected admin route
  if (!user && !isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/login";
    return NextResponse.redirect(redirectUrl);
  }

  // Authenticated user visiting login or forgot-password — send them to the dashboard
  // (Keep /admin/reset-password accessible so users can update their password)
  if (user && (pathname === "/admin/login" || pathname === "/admin/forgot-password")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin";
    return NextResponse.redirect(redirectUrl);
  }

  // IMPORTANT: return supabaseResponse (not NextResponse.next()) so that the
  // refreshed session cookies are forwarded to the browser.
  return supabaseResponse;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
