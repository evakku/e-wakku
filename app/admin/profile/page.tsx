import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdminAuth } from "@/lib/supabase/auth";
import { getAdminProfile, listAdministrators } from "./actions";
import AdminProfileView from "./AdminProfileView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Admin Profile — Admin",
  description: "Manage your administrator profile, password, and authorized administrators.",
};

export default async function AdminProfilePage() {
  const auth = await requireAdminAuth();
  if (!auth.authorized || !auth.user) {
    redirect("/admin/login?error=unauthorized");
  }

  const [profileResult, adminsResult] = await Promise.all([
    getAdminProfile(),
    listAdministrators(),
  ]);

  const profile = profileResult.profile || {
    id: auth.user.id,
    email: auth.user.email || "",
    name:
      (auth.user.user_metadata?.name as string) ||
      (auth.user.user_metadata?.full_name as string) ||
      (auth.user.user_metadata?.display_name as string) ||
      "",
  };

  const admins = adminsResult.admins || [
    {
      id: auth.user.id,
      name: profile.name || "Admin",
      email: auth.user.email || "",
      status: "active" as const,
      createdAt: auth.user.created_at,
      isCurrentAdmin: true,
      isPrimaryAdmin: true,
    },
  ];

  return (
    <AdminProfileView
      initialProfile={profile}
      initialAdmins={admins}
    />
  );
}
