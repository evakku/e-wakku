import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

/**
 * Server-Only Supabase Admin Client Factory.
 *
 * Exclusively instantiated in trusted server-side environments (Server Actions / Route Handlers)
 * for administrative operations that require service-role privileges (e.g. provisioning new admin
 * Auth users, modifying raw user metadata, or managing privileged authorization records).
 *
 * CRITICAL SECURITY CONSTRAINTS:
 * 1. MUST NEVER be imported or used in Client Components ('use client').
 * 2. The SUPABASE_SERVICE_ROLE_KEY must remain strictly in server-side environment variables.
 * 3. Never exposed through logs, API responses, or NEXT_PUBLIC_* variables.
 * 4. Disables session persistence and token auto-refresh so state is never leaked across concurrent requests.
 *
 * @returns A standalone SupabaseClient initialized with service-role permissions.
 * @throws {Error} If SUPABASE_SERVICE_ROLE_KEY is missing or blank in the runtime environment.
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
 *
 * Used by server actions to determine whether privileged provisioning and metadata
 * verification operations can be executed, or whether fallback handling must be employed.
 *
 * @returns `true` if SUPABASE_SERVICE_ROLE_KEY is present and non-empty; otherwise `false`.
 */
export function hasAdminServiceRoleKey(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}
