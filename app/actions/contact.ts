"use server";

import { createClient } from "@/lib/supabase/server";
import { contactSchema } from "@/validation/contactSchema";

export type SubmitContactState = {
  success: boolean;
  errors?: Record<string, string[] | undefined>;
  message?: string; // human-readable error, for the toast when success is false
};

export async function submitContactForm(formData: {
  name: string;
  email: string;
  message: string;
}): Promise<SubmitContactState> {
  // 1. Server-side validation using Zod
  const result = contactSchema.safeParse(formData);

  if (!result.success) {
    const errorMap = result.error.flatten().fieldErrors;
    return {
      success: false,
      errors: errorMap,
      message: "Please check the form for errors.",
    };
  }

  const { name, email, message } = result.data;

  // 2. Insert into Supabase — the anon role is allowed to INSERT (but not
  // SELECT) via RLS, since this is a public contact form with no login.
  const supabase = await createClient();

  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    message,
  });

  if (error) {
    console.error("Failed to save contact message:", error.message);
    return {
      success: false,
      message: "Something went wrong sending your message. Please try again.",
    };
  }

  return { success: true };
}