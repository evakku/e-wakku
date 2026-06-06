"use client";

import Link from "next/link";
import { useState, useCallback, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NavItem from "./NavItem";
import MobileMenu from "./MobileMenu";
import Container from "@/components/layout/Container";
import type { NavbarProps } from "./types";

/**
 * Navbar
 *
 * A sticky, fully-reusable editorial navbar for "E-Wakku" and any future
 * project that adopts the same design language.
 *
 * Layout:
 *   [Logo]  ────────────── [Nav links] ────────────── [Profile button]
 *
 * On mobile (< 768 px) the centre nav links are replaced with a hamburger
 * button that reveals an animated slide-down MobileMenu.
 *
 * Usage:
 * ```tsx
 * import Navbar from "@/components/navbar/Navbar";
 *
 * <Navbar
 *   logo={<YourLogo />}
 *   links={[
 *     { label: "Home",    href: "/" },
 *     { label: "About",   href: "/about" },
 *     { label: "Contact", href: "/contact" },
 *   ]}
 *   currentPath={pathname}          // from usePathname()
 *   profileIcon={<UserCircle />}
 *   onProfileClick={() => router.push("/admin")}
 * />
 * ```
 */
export default function Navbar({
  logo,
  links,
  currentPath,
  profileIcon,
  onProfileClick,
}: NavbarProps) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonId = useId();

  const toggleMenu = useCallback(() => setMobileMenuOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setMobileMenuOpen(false), []);

  return (
    /*
     * `relative` is needed so the absolutely-positioned MobileMenu panel
     * can position itself `top-full` relative to the navbar.
     */
    <header
      role="banner"
      className="relative sticky top-0 z-50 w-full bg-white border-b border-[#E5E7EB]"
      style={{ transition: "box-shadow 300ms ease" }}
    >
      {/* ── Inner layout ─────────────────────────────────────────────── */}
      <Container
        className="flex h-[72px] items-center justify-between"
        size="lg"
      >
        {/* ── LEFT — Logo ──────────────────────────────────────────── */}
        <Link
          href="/"
          aria-label="Go to homepage"
          className="shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#059669] focus-visible:ring-offset-2 rounded-sm"
        >
          {logo}
        </Link>

        {/* ── CENTER — Desktop navigation ──────────────────────────── */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex items-center gap-8"
        >
          <ul role="list" className="flex items-center gap-8">
            {links.map((link) => (
              <li key={link.href} role="none">
                <NavItem
                  label={link.label}
                  href={link.href}
                  isActive={currentPath === link.href}
                />
              </li>
            ))}
          </ul>
        </nav>

        {/* ── RIGHT — Profile button + hamburger ───────────────────── */}
        <div className="flex items-center gap-3">
          {/* Profile / admin button */}
          {profileIcon && (
            <button
              type="button"
              onClick={onProfileClick}
              aria-label="Open profile menu"
              className={[
                "flex items-center justify-center",
                "w-9 h-9 rounded-full",
                "border border-[#E2E8F0]",
                "transition-colors duration-300 ease-in-out",
                "hover:bg-[#F8FAFC]",
                "outline-none focus-visible:ring-2 focus-visible:ring-[#059669]",
                "focus-visible:ring-offset-2",
                "text-[#334155]",
              ].join(" ")}
            >
              {profileIcon}
            </button>
          )}

          {/* Hamburger button — mobile only */}
          <button
            id={menuButtonId}
            type="button"
            onClick={toggleMenu}
            aria-label={
              isMobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            className={[
              "md:hidden flex items-center justify-center",
              "w-9 h-9 rounded-md",
              "transition-colors duration-300 ease-in-out",
              "hover:bg-[#F8FAFC]",
              "outline-none focus-visible:ring-2 focus-visible:ring-[#059669]",
              "focus-visible:ring-offset-2",
            ].join(" ")}
          >
            <HamburgerIcon isOpen={isMobileMenuOpen} />
          </button>
        </div>
      </Container>

      {/* ── Mobile slide-down menu ────────────────────────────────────── */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        links={links}
        currentPath={currentPath}
        onClose={closeMenu}
      />
    </header>
  );
}

/* ─── Internal: animated hamburger icon ─────────────────────────────────── */

function HamburgerIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Top bar */}
      <motion.rect
        x="3"
        width="14"
        height="1.5"
        rx="0.75"
        fill="#334155"
        animate={
          isOpen
            ? { y: 9.25, rotate: 45, transformOrigin: "50% 50%" }
            : { y: 5, rotate: 0 }
        }
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      />
      {/* Middle bar */}
      <motion.rect
        x="3"
        y="9.25"
        width="14"
        height="1.5"
        rx="0.75"
        fill="#334155"
        animate={{ opacity: isOpen ? 0 : 1 }}
        transition={{ duration: 0.15 }}
      />
      {/* Bottom bar */}
      <motion.rect
        x="3"
        width="14"
        height="1.5"
        rx="0.75"
        fill="#334155"
        animate={
          isOpen
            ? { y: 9.25, rotate: -45, transformOrigin: "50% 50%" }
            : { y: 13.5, rotate: 0 }
        }
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      />
    </svg>
  );
}
