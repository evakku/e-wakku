import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

const ALLOWED_REDIRECT_PREFIXES = [
  "/admin",
  "/admin/profile",
  "/admin/reset-password",
  "/admin/issues/manage",
  "/admin/analytics",
];

const DEFAULT_REDIRECT = "/admin/reset-password";

/**
 * Validates and sanitizes destination paths to prevent open redirects (BE-03).
 * Rejects protocol-relative URLs (//evil.com), absolute external URLs, and non-whitelisted paths.
 */
export function getSafeRedirectPath(rawPath: string | null): string {
  if (!rawPath) return DEFAULT_REDIRECT;

  // Reject paths that don't start with a single slash, or start with double slash or backslash
  if (!rawPath.startsWith("/") || rawPath.startsWith("//") || rawPath.startsWith("/\\")) {
    return DEFAULT_REDIRECT;
  }

  // Parse relative to a fixed dummy origin to inspect pathname without protocol manipulation
  try {
    const parsed = new URL(rawPath, "http://localhost");
    const isAllowed = ALLOWED_REDIRECT_PREFIXES.some(
      (allowed) => parsed.pathname === allowed || parsed.pathname.startsWith(`${allowed}/`)
    );

    if (!isAllowed) {
      return DEFAULT_REDIRECT;
    }

    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return DEFAULT_REDIRECT;
  }
}

/**
 * Auth Callback Route Handler
 *
 * Handles the PKCE exchange for Supabase Auth redirect links
 * (e.g. Password Reset, Magic Link, Email Confirmation).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");
  const safeNext = getSafeRedirectPath(rawNext);
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Determine trusted origin using request.nextUrl.origin or configured site URL
  const trustedOrigin = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;

  if (error || errorDescription) {
    const errorMsg = errorDescription || error || "Authentication failed";
    return NextResponse.redirect(
      `${trustedOrigin}/admin/reset-password?error=${encodeURIComponent(errorMsg)}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      return NextResponse.redirect(`${trustedOrigin}${safeNext}`);
    } else {
      return NextResponse.redirect(
        `${trustedOrigin}/admin/reset-password?error=${encodeURIComponent(exchangeError.message)}`
      );
    }
  }

  // Fallback if accessed without code
  return NextResponse.redirect(`${trustedOrigin}${safeNext}`);
}
