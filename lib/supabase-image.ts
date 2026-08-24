/** Supabase storage URLs must bypass Next.js image optimization (SSRF / private-IP block). */
export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes(".supabase.co/storage/");
}
