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
 * Fetch contact enquiries from the `contact_messages` table.
 * Ordered by most recent first. Admin-only — requires service role or RLS policy.
 * Supports pagination via limit and offset (BE-05).
 */
export async function getEnquiries(
  limit: number = 50,
  offset: number = 0
): Promise<ContactEnquiry[]> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("contact_messages")
      .select("id, name, email, message, created_at, is_read")
      .order("created_at", { ascending: false });

    if (limit > 0) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Failed to fetch enquiries:", error.message);
      return [];
    }

    return (data as ContactEnquiry[]) ?? [];
  } catch (err) {
    console.error("Unexpected error in getEnquiries:", err);
    return [];
  }
}
