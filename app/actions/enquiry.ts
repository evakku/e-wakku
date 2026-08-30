"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteEnquiry(id: string): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Failed to delete enquiry:", error.message);
    return { success: false, message: "Failed to delete enquiry. Please try again." };
  }

  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
  return { success: true };
}
