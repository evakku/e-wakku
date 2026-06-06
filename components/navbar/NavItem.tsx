"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { NavItemProps } from "./types";

/**
 * NavItem
 *
 * A single navigation link with:
 * - Emerald green active colour (#059669) and hover colour
 * - Animated underline that scales in from the left on hover / active
 * - Smooth 300 ms colour transition
 * - `aria-current="page"` on the active route (accessibility)
 */
export default function NavItem({
  label,
  href,
  isActive,
  onClick,
}: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={[
        "relative inline-flex flex-col items-center py-1",
        "text-sm font-normal",
        "transition-colors duration-300 ease-in-out",
        "outline-none focus-visible:ring-2 focus-visible:ring-[#059669]",
        "focus-visible:ring-offset-2 rounded-sm",
        isActive
          ? "text-[#059669]"
          : "text-[#334155] hover:text-[#059669]",
      ].join(" ")}
    >
      {label}

      {/* Active underline — always mounted, scales to 1 when active */}
      <motion.span
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-px bg-[#059669] origin-left pointer-events-none"
        initial={false}
        animate={{ scaleX: isActive ? 1 : 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
      />

      {/* Hover underline — only when not active, driven by whileHover */}
      {!isActive && (
        <motion.span
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-px bg-[#059669] origin-left pointer-events-none"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
        />
      )}
    </Link>
  );
}
