"use client";

import { motion } from "framer-motion";
import type { FooterBrandProps } from "./types";

/**
 * FooterBrand
 *
 * Renders the left column of the footer:
 * - Publication name in Noto Serif
 * - Copyright line in Inter italic
 * - Optional extra slot (tagline, contact info, social links…)
 *
 * Animates in from below on first viewport entry via Framer Motion.
 * Respects `prefers-reduced-motion` through the global CSS rule in globals.css.
 */
export default function FooterBrand({
  brandName,
  copyrightText,
  children,
}: FooterBrandProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      }}
      className="flex flex-col gap-2"
    >
      {/* Brand / publication name — Noto Serif */}
      <p
        className="font-heading text-xl font-medium text-slate-900 tracking-tight select-none"
        aria-label={`${brandName} — return to homepage`}
      >
        {brandName}
      </p>

      {/* Optional extra slot — sits between brand name and copyright */}
      {children}

      {/* Copyright line — Inter italic */}
      <p className="font-sans text-sm text-slate-500 italic">
        {copyrightText}
      </p>
    </motion.div>
  );
}
