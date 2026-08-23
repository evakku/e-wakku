import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Auth Callback Route Handler
 *
 * Handles the PKCE exchange for Supabase Auth redirect links
 * (e.g. Password Reset, Magic Link, Email Confirmation).
 *
 * It takes the `code` parameter from the query string and exchanges it
 * for an authenticated session on the server, setting the session cookies
 * before redirecting the user to their target destination.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin/reset-password";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (error || errorDescription) {
    const errorMsg = errorDescription || error || "Authentication failed";
    return NextResponse.redirect(
      `${origin}/admin/reset-password?error=${encodeURIComponent(errorMsg)}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } else {
      return NextResponse.redirect(
        `${origin}/admin/reset-password?error=${encodeURIComponent(exchangeError.message)}`
      );
    }
  }

  // Fallback if accessed without code
  return NextResponse.redirect(`${origin}${next}`);
}
