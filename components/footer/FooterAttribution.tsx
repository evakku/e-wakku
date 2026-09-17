"use client";

import { motion } from "framer-motion";
import type { FooterAttributionProps } from "./types";

/**
 * FooterAttribution
 *
 * Renders an understated, elegant developer signature in the footer.
 *
 * Design guidelines:
 * - 11-12px font size with comfortable reading line-height
 * - Muted slate tone for "Developed by"
 * - Slightly darker/higher-contrast weight for "HexaKode"
 * - Accessible external link with target="_blank" and rel="noopener noreferrer"
 * - Subtle underline and color transition on hover/focus
 * - Fully accessible with keyboard ring and screen-reader context
 */
export default function FooterAttribution({
  label = "Developed by",
  developerName = "HexaKode",
  developerUrl = "https://hexakode.in",
  className = "",
}: FooterAttributionProps) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 4 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.4,
        delay: 0.15,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      }}
      className={[
        "font-sans text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 tracking-normal select-none pt-1 md:pt-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span>{label}</span>{" "}
      <a
        href={developerUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${developerName} (opens in a new tab)`}
        className={[
          "font-medium text-slate-700 dark:text-slate-200",
          "underline decoration-slate-300 dark:decoration-slate-600 underline-offset-2",
          "transition-colors duration-200 ease-in-out",
          "hover:text-slate-900 dark:hover:text-white hover:decoration-slate-700 dark:hover:decoration-slate-300",
          "outline-none focus-visible:ring-1 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-500",
          "focus-visible:ring-offset-1 rounded-sm",
        ].join(" ")}
      >
        {developerName}
      </a>
    </motion.p>
  );
}
