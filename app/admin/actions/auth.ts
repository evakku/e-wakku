"use server";

import { cookies } from "next/headers";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginState = {
  error?: string;
  success?: boolean;
};

export async function loginAdmin(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  const parsed = loginSchema.safeParse({ email, password });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0].message,
    };
  }

  // Hardcoded check or env variable check (fallback to 'admin@thejournal.com' / 'password')
  const validEmail = process.env.ADMIN_EMAIL || "admin@thejournal.com";
  const validPassword = process.env.ADMIN_PASSWORD || "password";

  if (parsed.data.email === validEmail && parsed.data.password === validPassword) {
    const cookieStore = await cookies();
    cookieStore.set({
      name: "admin_session",
      value: "authenticated",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    return { success: true };
  }

  return {
    error: "Invalid email or password",
  };
}

import { redirect } from "next/navigation";

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin/login");
}
