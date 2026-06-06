"use client";

import { motion } from "framer-motion";
import FooterBrand from "./FooterBrand";
import FooterLinks from "./FooterLinks";
import type { FooterProps } from "./types";

/**
 * Footer
 *
 * A minimal, editorial, reusable footer for "The Journal" / E-Wakku and any
 * future project that adopts the same design language.
 *
 * Layout (responsive):
 *
 *   Desktop / Tablet:
 *   ┌──────────────────────────────────────────────┐
 *   │ Brand Name               Links · Links · Links│
 *   │ © Copyright text                             │
 *   └──────────────────────────────────────────────┘
 *
 *   Mobile:
 *   ┌──────────────────┐
 *   │ Brand Name       │
 *   │ © Copyright text │
 *   │                  │
 *   │ Links            │
 *   │ Links            │
 *   └──────────────────┘
 *
 * Usage:
 * ```tsx
 * import Footer from "@/components/footer/Footer";
 *
 * <Footer
 *   brandName="The Journal"
 *   copyrightText="© 2024 The Journal. All rights reserved."
 *   links={[
 *     { label: "Privacy Policy", href: "/privacy" },
 *     { label: "Terms of Service", href: "/terms" },
 *     { label: "Archives",        href: "/archives" },
 *     { label: "Newsletter",      href: "/newsletter" },
 *   ]}
 * />
 * ```
 *
 * Future extensibility:
 * - `rightSlot` prop: render social icons, newsletter CTA, etc. above links
 * - `leftSlot` prop: render tagline, contact info, etc. below brand name
 */
export default function Footer({
  brandName,
  copyrightText,
  links,
  rightSlot,
  leftSlot,
}: FooterProps) {
  return (
    <footer
      role="contentinfo"
      aria-label="Site footer"
      className="w-full bg-white border-t border-[#E2E8F0]"
    >
      {/* ── Animated border-top line ──────────────────────────────────── */}
      <motion.div
        aria-hidden="true"
        className="h-px w-full bg-[#E2E8F0]"
        initial={{ scaleX: 0, transformOrigin: "left" }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-20px" }}
        transition={{
          duration: 0.6,
          ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
        }}
      />

      {/* ── Content container ─────────────────────────────────────────── */}
      <div
        className={[
          "mx-auto w-full",
          "max-w-[1280px]",
          "px-4 py-8",           // mobile
          "sm:px-6 sm:py-10",    // tablet
          "lg:px-8 lg:py-12",    // desktop
          "flex flex-col gap-8", // mobile: stacked
          "md:flex-row md:items-center md:justify-between md:gap-16", // desktop: two-column
        ].join(" ")}
      >
        {/* ── LEFT — Brand + copyright ──────────────────────────────── */}
        <FooterBrand brandName={brandName} copyrightText={copyrightText}>
          {leftSlot}
        </FooterBrand>

        {/* ── RIGHT — Links (+ optional slot) ──────────────────────── */}
        <FooterLinks links={links}>{rightSlot}</FooterLinks>
      </div>
    </footer>
  );
}
