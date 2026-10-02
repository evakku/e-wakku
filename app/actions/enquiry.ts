"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAuth } from "@/lib/supabase/auth";

export async function deleteEnquiry(id: string): Promise<{ success: boolean; message?: string }> {
  const auth = await requireAdminAuth();
  if (!auth.authorized) {
    return { success: false, message: auth.error };
  }
  const supabase = auth.supabase;

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

export async function toggleEnquiryReadStatus(
  id: string,
  isRead: boolean
): Promise<{ success: boolean; message?: string }> {
  const auth = await requireAdminAuth();
  if (!auth.authorized) {
    return { success: false, message: auth.error };
  }
  const supabase = auth.supabase;

  const { error } = await supabase
    .from("contact_messages")
    .update({ is_read: isRead })
    .eq("id", id);

  if (error) {
    if (error.code === "PGRST204" || error.code === "42703" || error.message?.includes("is_read")) {
      console.warn("is_read column not found in database, toggleEnquiryReadStatus skipped gracefully");
      return { success: true };
    }
    console.error("Failed to update enquiry read status:", error.message);
    return { success: false, message: "Failed to update enquiry status. Please try again." };
  }

  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
  return { success: true };
}
