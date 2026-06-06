"use client";

import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import { UserCircle } from "lucide-react";

/**
 * SiteNavbar
 *
 * A thin client wrapper that:
 * 1. Reads the current pathname with `usePathname()` (requires Client Component)
 * 2. Wires up site-specific props (logo, links, profile action)
 * 3. Delegates rendering to the fully-reusable <Navbar> component
 *
 * This separation keeps layout.tsx a Server Component while isolating the
 * client-side routing dependency to just this file.
 *
 * To use the Navbar in a different project, copy only components/navbar/
 * and create a new wrapper like this one with project-specific configuration.
 */

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export default function SiteNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Navbar
      logo={<JournalLogo />}
      links={[...NAV_LINKS]}
      currentPath={pathname}
      profileIcon={<UserCircle size={18} strokeWidth={1.5} aria-hidden />}
      onProfileClick={() => router.push("/admin")}
    />
  );
}

/* ─── Publication wordmark ──────────────────────────────────────────────── */

function JournalLogo() {
  return (
    <span
      className="font-heading text-[1.125rem] tracking-tight text-[#191C1E] select-none"
      style={{ fontWeight: 400 }}
    >
      E-Wakku
    </span>
  );
}
