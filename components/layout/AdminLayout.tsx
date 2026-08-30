"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/src/assets/logo.png";
import {
  LayoutDashboard,
  BookOpen,
  Archive,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  FilePlus,
  Files,
  BarChart3,
} from "lucide-react";
import type { AdminLayoutProps, AdminNavItem } from "./types";

/**
 * AdminLayout
 *
 * The shell for every admin page:
 *
 *   ┌──────────┬──────────────────────────────────┐
 *   │ Sidebar  │  Top bar              [Action]   │
 *   │  [logo]  ├──────────────────────────────────┤
 *   │  nav     │                                  │
 *   │  items   │         Page content             │
 *   │          │                                  │
 *   └──────────┴──────────────────────────────────┘
 *
 * Features:
 * - Collapsible sidebar (icon-only when collapsed)
 * - Responsive mobile drawer with overlay
 * - Active route detection via usePathname
 * - Role-based nav items passed via props
 *
 * Usage:
 * ```tsx
 * // app/admin/layout.tsx
 * import AdminLayout from "@/components/layout/AdminLayout";
 * export default function Layout({ children }) {
 *   return <AdminLayout pageTitle="Dashboard">{children}</AdminLayout>;
 * }
 * ```
 */

const DEFAULT_NAV: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={18} /> },
  { label: "Manage Issues", href: "/admin/issues/manage", icon: <Files size={18} /> },
  { label: "Analytics", href: "/admin/analytics", icon: <BarChart3 size={18} /> },
  { label: "Settings", href: "/admin/settings", icon: <Settings size={18} /> },
];

const sidebarEase = [0.4, 0, 0.2, 1] as [number, number, number, number];

export default function AdminLayout({
  children,
  navItems = DEFAULT_NAV,
  pageTitle = "Admin",
  headerAction,
}: AdminLayoutProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleCollapsed = useCallback(() => setCollapsed((p) => !p), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);

  return (
    <div className="flex min-h-svh bg-[#F8FAFC]">
      {/* ── Desktop sidebar ──────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ duration: 0.25, ease: sidebarEase }}
        className={[
          "hidden md:flex flex-col shrink-0",
          "bg-white border-r border-[#E2E8F0]",
          "overflow-hidden",
        ].join(" ")}
        aria-label="Admin navigation"
      >
        {/* Sidebar header */}
        <div
          className={[
            "flex h-[64px] items-center border-b border-[#E2E8F0] px-4",
            collapsed ? "justify-center" : "justify-between",
          ].join(" ")}
        >
          {!collapsed ? (
            <Link
              href="/admin"
              className="relative h-9 w-28 block outline-none focus-visible:ring-2 focus-visible:ring-[#059669] rounded-sm"
              aria-label="Admin Dashboard"
            >
              <Image
                src={logo}
                alt="E-Wakku Logo"
                fill
                priority
                sizes="112px"
                className="object-contain object-left select-none"
              />
            </Link>
          ) : (
            <Link
              href="/admin"
              className="relative h-7 w-7 block outline-none focus-visible:ring-2 focus-visible:ring-[#059669] rounded-sm"
              aria-label="Admin Dashboard"
            >
              <Image
                src={logo}
                alt="E-Wakku Logo"
                fill
                priority
                sizes="28px"
                className="object-contain select-none"
              />
            </Link>
          )}
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex items-center justify-center w-7 h-7 rounded-md text-[#64748B] hover:bg-[#F0F2F4] transition-colors duration-200 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <ul role="list" className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const isActive =
                item.isActive ?? (item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href));
              return (
                <li key={item.href} role="none">
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "flex items-center gap-3 px-3 py-2 rounded-md",
                      "text-sm transition-colors duration-200 outline-none",
                      "focus-visible:ring-2 focus-visible:ring-[#059669]",
                      collapsed ? "justify-center" : "",
                      isActive
                        ? "bg-[#059669]/8 text-[#059669] font-medium"
                        : "text-[#64748B] hover:bg-[#F0F2F4] hover:text-[#0F172A]",
                    ].join(" ")}
                    title={collapsed ? item.label : undefined}
                  >
                    {item.icon && (
                      <span className="shrink-0" aria-hidden>
                        {item.icon}
                      </span>
                    )}
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </motion.aside>

      {/* ── Mobile drawer ────────────────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeDrawer}
              aria-hidden
            />
            {/* Drawer panel */}
            <motion.aside
              key="drawer"
              className="md:hidden fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-white border-r border-[#E2E8F0] shadow-xl"
              initial={{ x: -264 }}
              animate={{ x: 0 }}
              exit={{ x: -264 }}
              transition={{ duration: 0.25, ease: sidebarEase }}
              aria-label="Admin navigation"
            >
              {/* Drawer header */}
              <div className="flex h-[64px] items-center justify-between border-b border-[#E2E8F0] px-4">
                <Link
                  href="/admin"
                  onClick={closeDrawer}
                  className="relative h-9 w-28 block outline-none focus-visible:ring-2 focus-visible:ring-[#059669] rounded-sm"
                  aria-label="Admin Dashboard"
                >
                  <Image
                    src={logo}
                    alt="E-Wakku Logo"
                    fill
                    priority
                    sizes="112px"
                    className="object-contain object-left select-none"
                  />
                </Link>
                <button
                  type="button"
                  onClick={closeDrawer}
                  aria-label="Close navigation"
                  className="flex items-center justify-center w-7 h-7 rounded-md text-[#64748B] hover:bg-[#F0F2F4] transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Drawer nav */}
              <nav className="flex-1 overflow-y-auto py-3 px-2">
                <ul role="list" className="flex flex-col gap-0.5">
                  {navItems.map((item) => {
                    const isActive =
                      item.isActive ?? (item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname.startsWith(item.href));
                    return (
                      <li key={item.href} role="none">
                        <Link
                          href={item.href}
                          onClick={closeDrawer}
                          aria-current={isActive ? "page" : undefined}
                          className={[
                            "flex items-center gap-3 px-3 py-2.5 rounded-md",
                            "text-sm transition-colors duration-200 outline-none",
                            "focus-visible:ring-2 focus-visible:ring-[#059669]",
                            isActive
                              ? "bg-[#059669]/8 text-[#059669] font-medium"
                              : "text-[#64748B] hover:bg-[#F0F2F4] hover:text-[#0F172A]",
                          ].join(" ")}
                        >
                          {item.icon && (
                            <span className="shrink-0" aria-hidden>
                              {item.icon}
                            </span>
                          )}
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main column ──────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-[64px] items-center gap-4 border-b border-[#E2E8F0] bg-white px-4 sm:px-6">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={openDrawer}
            aria-label="Open navigation"
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-md text-[#64748B] hover:bg-[#F0F2F4] transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
          >
            <Menu size={18} />
          </button>

          {/* Page title */}
          <h1 className="flex-1 font-sans text-base font-medium text-[#0F172A] tracking-tight truncate">
            {pageTitle}
          </h1>

          {/* Optional right action */}
          {headerAction && (
            <div className="flex items-center gap-2 shrink-0">{headerAction}</div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
