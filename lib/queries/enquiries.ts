import { createClient } from "@/lib/supabase/server";

export type ContactEnquiry = {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

/**
 * Fetch all contact enquiries from the `contact_messages` table.
 * Ordered by most recent first. Admin-only — requires service role or RLS policy.
 */
export async function getEnquiries(): Promise<ContactEnquiry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, message, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch enquiries:", error.message);
    return [];
  }

  return data ?? [];
}
