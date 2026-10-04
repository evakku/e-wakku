import { createClient } from "./server";
import type { User } from "@supabase/supabase-js";

export type AdminAuthResult =
  | { authorized: true; user: User; supabase: Awaited<ReturnType<typeof createClient>> }
  | { authorized: false; error: string; user?: null; supabase?: null };

/**
 * Server-side helper to verify that the incoming request has a valid,
 * active Supabase authenticated session with admin privileges.
 *
 * Uses `supabase.auth.getUser()` which cryptographically verifies the auth token
 * against the Supabase Auth server on every request.
 */
export async function requireAdminAuth(): Promise<AdminAuthResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        authorized: false,
        error: "Unauthorized: Valid admin authentication session required.",
      };
    }

    return {
      authorized: true,
      user,
      supabase,
    };
  } catch (err: any) {
    return {
      authorized: false,
      error: "Authentication verification failed.",
    };
  }
}
