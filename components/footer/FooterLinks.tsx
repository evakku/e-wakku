"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { FooterLinksProps } from "./types";

/**
 * FooterLinks
 *
 * Renders the right column of the footer: an accessible, keyboard-navigable
 * list of navigation links.
 *
 * Each link:
 * - Uses Next.js <Link> for client-side navigation and prefetching
 * - Transitions from slate-500 → emerald (#059669) over 300 ms on hover/focus
 * - Has a visible focus-visible ring for keyboard accessibility
 *
 * The whole group animates in from below on first viewport entry, staggered
 * 80 ms per item for a subtle cascade effect.
 */

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
};

export default function FooterLinks({
  links,
  children,
  attribution,
}: FooterLinksProps) {
  return (
    <div className="flex flex-col items-start md:items-end gap-3 sm:gap-2.5">
      {/* Optional slot (social icons, newsletter CTA, etc.) */}
      {children}

      {/* Navigation links */}
      <motion.nav
        aria-label="Footer navigation"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
      >
        <ul
          role="list"
          className="flex flex-wrap gap-x-6 gap-y-2 md:justify-end"
        >
          {links.map((link) => (
            <motion.li key={link.href} variants={itemVariants} role="none">
              <Link
                href={link.href}
                className={[
                  "font-sans text-sm text-slate-500",
                  "transition-colors duration-300 ease-in-out",
                  "hover:text-[#059669]",
                  "outline-none focus-visible:ring-2 focus-visible:ring-[#059669]",
                  "focus-visible:ring-offset-2 rounded-sm",
                ].join(" ")}
              >
                {link.label}
              </Link>
            </motion.li>
          ))}
        </ul>
      </motion.nav>

      {/* Developer attribution signature */}
      {attribution}
    </div>
  );
}
