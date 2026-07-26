"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginState = {
  error?: string;
  success?: boolean;
};

/**
 * loginAdmin
 *
 * Server Action called from the admin login form.
 * Validates inputs, then delegates to Supabase Auth's signInWithPassword.
 * On success the Supabase SSR client automatically sets the session cookies;
 * the client-side router.push("/admin") handles the redirect.
 */
export async function loginAdmin(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  // Client-side validation mirror (also validated on client, but guard here too)
  const parsed = loginSchema.safeParse({ email, password });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0].message,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  return { success: true };
}

/**
 * logoutAdmin
 *
 * Server Action called from the admin layout Sign Out button.
 * Calls Supabase Auth signOut to clear the session cookies, then redirects
 * to the login page.
 *
 * Note: redirect() throws internally, so no return is needed after it.
 */
export async function logoutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
