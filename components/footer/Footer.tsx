"use client";

import { motion } from "framer-motion";
import FooterBrand from "./FooterBrand";
import FooterLinks from "./FooterLinks";
import FooterAttribution from "./FooterAttribution";
import Container from "@/components/layout/Container";
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
 *   │ © Copyright text         Developed by HexaKode│
 *   └──────────────────────────────────────────────┘
 *
 *   Mobile:
 *   ┌──────────────────┐
 *   │ Brand Name       │
 *   │ © Copyright text │
 *   │                  │
 *   │ Links            │
 *   │ Links            │
 *   │                  │
 *   │ Developed by     │
 *   │ HexaKode         │
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
 * - `attribution` prop: customize or disable developer signature
 */
export default function Footer({
  brandName,
  copyrightText,
  links,
  rightSlot,
  leftSlot,
  attribution = <FooterAttribution />,
}: FooterProps) {
  return (
    <footer
      role="contentinfo"
      aria-label="Site footer"
      className="w-full bg-white border-t border-[#E2E8F0] mt-16 sm:mt-24 lg:mt-5"
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

      {/* ── Content container ───────────────────────────────────── */}
      <Container
        size="lg"
        className={[
          "py-8 sm:py-10 lg:py-12",
          "flex flex-col gap-8",
          "md:flex-row md:items-center md:justify-between md:gap-16",
        ].join(" ")}
      >
        {/* ── LEFT — Brand + copyright ────────────────────────── */}
        <FooterBrand brandName={brandName} copyrightText={copyrightText}>
          {leftSlot}
        </FooterBrand>

        {/* ── RIGHT — Links (+ optional slot & attribution) ──── */}
        <FooterLinks links={links} attribution={attribution}>
          {rightSlot}
        </FooterLinks>
      </Container>
    </footer>
  );
}
