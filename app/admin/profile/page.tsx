import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdminAuth } from "@/lib/supabase/auth";
import { getAdminProfile, listAdministrators } from "./actions";
import AdminProfileView from "./AdminProfileView";

/**
 * Route Segment Configuration:
 * - `dynamic = "force-dynamic"`: Disables static page pre-rendering at build time.
 * - `revalidate = 0`: Disables Next.js Data Cache caching to guarantee that every
 *   navigation to /admin/profile authoritatively evaluates active session credentials
 *   and fetches the latest database directory records.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Admin Profile — Admin",
  description: "Manage your administrator profile, password, and authorized administrators.",
};

/**
 * Server Component for the Admin Profile & Administrator Management view.
 *
 * Data Flow & Security Architecture:
 * 1. Authentication Guard: Evaluates `requireAdminAuth()` server-side before rendering.
 *    If unauthenticated or not registered in `public.admins`, immediately issues an HTTP
 *    redirect to `/admin/login?error=unauthorized`.
 * 2. Parallel Pre-fetching: Concurrently executes `getAdminProfile()` and `listAdministrators()`
 *    via `Promise.all` to minimize SSR response latency.
 * 3. Fallback Integrity: If directory retrieval encounters an infrastructure glitch or
 *    missing RPC before migration, builds a safe single-admin fallback record bound to the
 *    authenticated session user.
 * 4. Hydration: Passes authoritative `initialProfile` and `initialAdmins` down to the
 *    interactive Client Component `<AdminProfileView />`.
 */
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
