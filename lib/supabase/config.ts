/**
 * Supabase environment variable validation.
 *
 * Validates required NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * variables safely across browser, server, middleware, and API environments
 * without exposing sensitive keys or relying on unsafe non-null assertions (!).
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * Validates and retrieves the Supabase public credentials.
 * Throws a clear, developer-friendly error if any required variable is missing or malformed.
 */
export function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  const missing: string[] = [];
  if (!url) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!anonKey) {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  if (missing.length > 0) {
    throw new Error(
      `[Supabase Configuration Error]: Missing required environment variable(s): ${missing.join(
        ", "
      )}. Please verify your .env.local or deployment environment configuration.`
    );
  }

  // Validate URL structure (without exposing secret token contents in errors)
  try {
    const parsedUrl = new URL(url!);
    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
      throw new Error("Protocol must be http: or https:");
    }
  } catch {
    throw new Error(
      "[Supabase Configuration Error]: NEXT_PUBLIC_SUPABASE_URL is not a valid HTTP or HTTPS URL. Please check your environment variables."
    );
  }

  return {
    url: url!,
    anonKey: anonKey!,
  };
}
