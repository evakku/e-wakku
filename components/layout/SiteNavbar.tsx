"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import { UserCircle } from "lucide-react";
import logo from "@/src/assets/logo.png";

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
      logo={<EWakkuLogo />}
      links={[...NAV_LINKS]}
      currentPath={pathname}
      profileIcon={<UserCircle size={18} strokeWidth={1.5} aria-hidden />}
      onProfileClick={() => router.push("/admin")}
    />
  );
}

/* ─── Publication logo ──────────────────────────────────────────────────── */

function EWakkuLogo() {
  return (
    <Image
      src={logo}
      alt="E-Wakku"
      height={36}
      priority
      className="h-9 w-auto object-contain select-none"
    />
  );
}
