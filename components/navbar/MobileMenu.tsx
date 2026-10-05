"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { MobileMenuProps } from "./types";

/**
 * MobileMenu
 *
 * Animated slide-down mobile navigation overlay.
 * Rendered below the navbar; closes automatically when a link is selected.
 *
 * Animation strategy:
 *  - Outer wrapper uses `AnimatePresence` so the exit animation plays before
 *    unmounting.
 *  - The panel slides in from y -8 → 0 and fades opacity 0 → 1 on open,
 *    reverses on close.
 *  - Each nav item staggers in with a small delay for a polished feel.
 */

const panelVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1] as [number, number, number, number],
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15 } },
};

export default function MobileMenu({
  isOpen,
  links,
  currentPath,
  onClose,
}: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.nav
          key="mobile-menu"
          id="mobile-navigation"
          aria-label="Mobile navigation"
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="md:hidden absolute top-full left-0 right-0 z-40 bg-white border-b border-[#E2E8F0] overflow-hidden"
          style={{ boxShadow: "0 8px 24px rgba(25, 28, 30, 0.06)" }}
        >
          <ul role="list" className="flex flex-col px-4 py-3 gap-0.5">
            {links.map((link) => {
              const isActive = currentPath === link.href;
              return (
                <motion.li
                  key={link.href}
                  variants={itemVariants}
                  role="none"
                >
                  <Link
                    href={link.href}
                    onClick={onClose}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "flex items-center w-full px-3 py-3",
                      "text-sm font-normal rounded-md",
                      "transition-colors duration-200 ease-in-out",
                      "outline-none focus-visible:ring-2 focus-visible:ring-[#059669]",
                      "focus-visible:ring-inset",
                      isActive
                        ? "text-[#059669] bg-[#059669]/5"
                        : "text-[#334155] hover:text-[#059669] hover:bg-[#F8FAFC]",
                    ].join(" ")}
                  >
                    {/* Active indicator dot */}
                    <motion.span
                      aria-hidden="true"
                      className="inline-block w-1.5 h-1.5 mr-2.5 shrink-0 rounded-full"
                      animate={{
                        backgroundColor: isActive ? "#059669" : "transparent",
                        scale: isActive ? 1 : 0.6,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                      }}
                    />
                    {link.label}
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
