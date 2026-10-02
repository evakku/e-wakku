import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";

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
  const { url, anonKey } = getSupabaseConfig();
  return createBrowserClient(url, anonKey);
}

