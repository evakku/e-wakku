import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Whitelist of permitted internal redirect destination prefixes.
 * Restricts post-authentication redirection strictly to verified administrative paths.
 */
const ALLOWED_REDIRECT_PREFIXES = [
  "/admin",
  "/admin/profile",
  "/admin/reset-password",
  "/admin/issues/manage",
  "/admin/analytics",
];

const DEFAULT_REDIRECT = "/admin/reset-password";

/**
 * Validates and sanitizes destination paths to prevent Open Redirect vulnerabilities (CWE-601).
 *
 * Security Constraints:
 * 1. Rejects null, empty, or whitespace inputs (defaults to `/admin/reset-password`).
 * 2. Rejects protocol-relative URLs (`//evil.com`) and backslash bypass attempts (`/\\evil.com`).
 * 3. Parses the target path against a fixed dummy origin (`http://localhost`) to accurately
 *    extract `pathname` and query parameters without protocol manipulation.
 * 4. Whitelist check: Compares the parsed pathname against `ALLOWED_REDIRECT_PREFIXES`.
 *    Any path not strictly matching or prefixed by a whitelisted directory is rejected.
 *
 * @param rawPath - The untrusted `next` query parameter value from the incoming request.
 * @returns A safe, internal relative URI with query string, or `DEFAULT_REDIRECT`.
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
 * Auth Callback Route Handler (PKCE Flow).
 *
 * Handles the Proof Key for Code Exchange (PKCE) exchange for Supabase Auth redirect links
 * (e.g. Password Reset, Magic Link, Email Confirmation).
 *
 * Flow:
 * 1. Extracts the authorization `code` and sanitized `next` destination from query parameters.
 * 2. Exchanges the short-lived code for a persistent session via `supabase.auth.exchangeCodeForSession(code)`.
 * 3. On success, redirects the authenticated user to `trustedOrigin + safeNext`.
 * 4. On exchange failure or auth provider error, redirects to password reset page with an error parameter.
 *
 * @param request - Incoming Next.js HTTP GET request.
 * @returns Next.js redirect response.
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
