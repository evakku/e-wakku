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
 *   /admin/archive      → app/admin/archive/page.tsx
 *   /admin/readers      → app/admin/readers/page.tsx
 *   /admin/settings     → app/admin/settings/page.tsx
 *
 * Note: AdminLayout is a Client Component (uses useState, usePathname).
 * Marking this layout "use client" is the simplest way to propagate that.
 * If Server Component data needs to flow in, wrap only AdminLayout in a
 * client boundary and keep this file as a Server Component.
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
