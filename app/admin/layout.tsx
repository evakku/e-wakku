"use client";

import AdminLayout from "@/components/layout/AdminLayout";
import { usePathname } from "next/navigation";
import { logoutAdmin } from "@/app/admin/actions/auth";

/**
 * Admin Route Layout
 *
 * Wraps every admin page in the AdminLayout shell
 * (collapsible sidebar + top bar).
 *
 * Admin pages:
 *   /admin              → app/admin/page.tsx
 *   /admin/issues       → app/admin/issues/page.tsx
 *   /admin/issues/manage→ app/admin/issues/manage/page.tsx
 *   /admin/analytics    → app/admin/analytics/page.tsx
 *   /admin/enquiries    → app/admin/enquiries/page.tsx
 *   /admin/profile      → app/admin/profile/page.tsx
 *   /admin/settings     → app/admin/settings/page.tsx
 *
 * State Architecture:
 * Wraps dashboard routes in `AdminProfileProvider` to provide reactive, client-side
 * administrator display name and email synchronization for the top navigation bar.
 * Authentication sub-pages (login, reset-password) bypass this shell layout.
 */
import SignOutButton from "@/components/admin/SignOutButton";
import { AdminProfileProvider } from "@/components/admin/AdminProfileContext";

export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/admin/login" ||
    pathname === "/admin/forgot-password" ||
    pathname === "/admin/reset-password";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <AdminProfileProvider>
      <AdminLayout
        headerAction={
          <form action={logoutAdmin}>
            <SignOutButton />
          </form>
        }
      >
        {children}
      </AdminLayout>
    </AdminProfileProvider>
  );
}
