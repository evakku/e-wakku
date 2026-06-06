"use client";

import AdminLayout from "@/components/layout/AdminLayout";

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
  return <AdminLayout>{children}</AdminLayout>;
}
