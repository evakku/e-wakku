import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

/**
 * Server-Only Supabase Admin Client.
 *
 * Exclusively instantiated in trusted server-side environments (Server Actions / Route Handlers)
 * for administrative operations that require service-role privileges (e.g. provisioning new admin
 * Auth users or managing privileged authorization records).
 *
 * CRITICAL SECURITY CONSTRAINTS:
 * 1. MUST NEVER be imported or used in Client Components ('use client').
 * 2. The SUPABASE_SERVICE_ROLE_KEY must remain strictly in server-side environment variables.
 * 3. Never exposed through logs, API responses, or NEXT_PUBLIC_* variables.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!serviceRoleKey) {
    throw new Error(
      "[Supabase Admin Error]: SUPABASE_SERVICE_ROLE_KEY is required for administrative provisioning operations."
    );
  }

  const { url } = getSupabaseConfig();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Checks whether the server environment currently has SUPABASE_SERVICE_ROLE_KEY configured.
 */
export function hasAdminServiceRoleKey(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}
