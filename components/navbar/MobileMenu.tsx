"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { MobileMenuProps } from "./types";
import { useNavigationLoading } from "@/components/navigation/NavigationLoadingContext";
import Spinner from "@/components/ui/spinner";

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
 *  - When tapped, displays inline loading spinner on the active row before closing.
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
  const { isHrefPending, handleLinkClick } = useNavigationLoading();

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
              const isExternal = Boolean(
                link.external ||
                link.href.startsWith("http://") ||
                link.href.startsWith("https://")
              );
              const isActive = !isExternal && currentPath === link.href;
              const isPending = !isExternal && isHrefPending(link.href);

              return (
                <motion.li
                  key={link.href}
                  variants={itemVariants}
                  role="none"
                >
                  {isExternal ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onClose}
                      className={[
                        "flex items-center justify-between w-full px-3 py-3",
                        "text-sm font-normal rounded-md",
                        "transition-colors duration-200 ease-in-out",
                        "outline-none focus-visible:ring-2 focus-visible:ring-[#059669]",
                        "focus-visible:ring-inset",
                        "text-[#334155] hover:text-[#059669] hover:bg-[#F8FAFC]",
                      ].join(" ")}
                    >
                      <div className="flex items-center">
                        {/* Dot spacer matching inactive state */}
                        <span
                          aria-hidden="true"
                          className="inline-block w-1.5 h-1.5 mr-2.5 shrink-0 rounded-full bg-transparent"
                        />
                        <span>{link.label}</span>
                      </div>
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      onClick={(e) => {
                        if (isActive) {
                          onClose();
                          return;
                        }
                        handleLinkClick(e, link.href, () => {
                          // Brief delay allows the user to see the loading feedback before closing
                          setTimeout(onClose, 120);
                        });
                      }}
                      aria-current={isActive ? "page" : undefined}
                      aria-busy={isPending ? "true" : undefined}
                      aria-label={isPending ? `${link.label} (loading...)` : undefined}
                      className={[
                        "flex items-center justify-between w-full px-3 py-3",
                        "text-sm font-normal rounded-md",
                        "transition-colors duration-200 ease-in-out",
                        "outline-none focus-visible:ring-2 focus-visible:ring-[#059669]",
                        "focus-visible:ring-inset",
                        isActive
                          ? "text-[#059669] bg-[#059669]/5 font-medium"
                          : isPending
                            ? "text-[#059669] bg-[#059669]/5 font-medium"
                            : "text-[#334155] hover:text-[#059669] hover:bg-[#F8FAFC]",
                      ].join(" ")}
                    >
                      <div className="flex items-center">
                        {/* Active indicator dot */}
                        <motion.span
                          aria-hidden="true"
                          className="inline-block w-1.5 h-1.5 mr-2.5 shrink-0 rounded-full"
                          animate={{
                            backgroundColor:
                              isActive || isPending
                                ? "rgba(5, 150, 105, 1)"
                                : "rgba(5, 150, 105, 0)",
                            scale: isActive || isPending ? 1 : 0.6,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 20,
                          }}
                        />
                        <span>{link.label}</span>
                      </div>

                      {/* Inline spinner for pending state */}
                      {isPending && (
                        <span className="flex items-center text-[#059669] shrink-0" aria-hidden="true">
                          <Spinner size="xs" color="emerald" />
                        </span>
                      )}
                    </Link>
                  )}
                </motion.li>
              );
            })}
          </ul>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
