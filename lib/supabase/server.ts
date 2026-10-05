import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "./config";

/**
 * Server-side Supabase client.
 *
 * Use this in Server Components, Server Actions, and Route Handlers.
 * It reads and writes session cookies via Next.js's `cookies()` API so that
 * the Supabase session is securely stored as httpOnly cookies and automatically
 * refreshed on each server request.
 *
 * Awaiting `cookies()` is required for Next.js 15+ (async Dynamic APIs).
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseConfig();

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // `setAll` is called from Server Components where cookies cannot be
            // mutated. This is safe to ignore — the middleware handles session
            // refresh and the response cookies are set there.
          }
        },
      },
    }
  );
}
