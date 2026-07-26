import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client.
 *
 * Use this in Client Components whenever you need to interact with Supabase
 * from the browser (e.g. reading auth state, realtime subscriptions).
 *
 * Auth tokens are stored and refreshed automatically via cookies handled by
 * the @supabase/ssr package.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
