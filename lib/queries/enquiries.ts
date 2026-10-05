import { createClient } from "@/lib/supabase/server";

export type ContactEnquiry = {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
  is_read: boolean;
};

/**
 * Fetch all contact enquiries from the `contact_messages` table.
 * Ordered by most recent first. Admin-only — requires service role or RLS policy.
 */
export async function getEnquiries(): Promise<ContactEnquiry[]> {
  const supabase = await createClient();

  let { data, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, message, created_at, is_read")
    .order("created_at", { ascending: false });

  if (error && (error.code === "PGRST204" || error.code === "42703" || error.message?.includes("is_read"))) {
    console.warn("is_read column not found, falling back to query without it");
    const retryResult = await supabase
      .from("contact_messages")
      .select("id, name, email, message, created_at")
      .order("created_at", { ascending: false });

    if (retryResult.data) {
      data = retryResult.data.map((row: any) => ({
        ...row,
        is_read: false,
      }));
      error = null;
    } else {
      error = retryResult.error;
    }
  }

  if (error) {
    console.error("Failed to fetch enquiries:", error.message);
    return [];
  }

  return (data as ContactEnquiry[]) ?? [];
}
