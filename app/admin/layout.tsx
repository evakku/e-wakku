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
    <AdminLayout
      headerAction={
        <form action={logoutAdmin}>
          <button
            type="submit"
            className="text-sm font-medium text-red-600 hover:text-red-700 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
          >
            Sign Out
          </button>
        </form>
      }
    >
      {children}
    </AdminLayout>
  );
}
