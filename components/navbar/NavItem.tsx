"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { NavItemProps } from "./types";
import { useNavigationLoading } from "@/components/navigation/NavigationLoadingContext";
import Spinner from "@/components/ui/spinner";

/**
 * NavItem
 *
 * A single navigation link with:
 * - Emerald green active colour (#059669) and hover colour
 * - Animated underline that scales in from the left on hover / active / pending
 * - Zero-layout-shift inline mini-spinner when navigation is pending
 * - Smooth 300 ms colour transition
 * - `aria-current="page"` on the active route
 * - `aria-busy="true"` and accessible loading feedback when pending
 */
export default function NavItem({
  label,
  href,
  external,
  isActive,
  onClick,
}: NavItemProps) {
  const { isHrefPending, handleLinkClick } = useNavigationLoading();
  const isExternal = Boolean(external || href.startsWith("http://") || href.startsWith("https://"));
  const isPending = !isExternal && isHrefPending(href);

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={[
          "relative inline-flex flex-col items-center py-1",
          "text-sm font-normal text-[#334155] hover:text-[#059669]",
          "transition-colors duration-300 ease-in-out",
          "outline-none focus-visible:ring-2 focus-visible:ring-[#059669]",
          "focus-visible:ring-offset-2 rounded-sm",
        ].join(" ")}
      >
        <span className="relative">{label}</span>

        {/* Hover underline */}
        <motion.span
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-px bg-[#059669] origin-left pointer-events-none"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
        />
      </a>
    );
  }

  return (
    <Link
      href={href}
      onClick={(e) => handleLinkClick(e, href, onClick)}
      aria-current={isActive ? "page" : undefined}
      aria-busy={isPending ? "true" : undefined}
      aria-label={isPending ? `${label} (loading...)` : undefined}
      className={[
        "relative inline-flex flex-col items-center py-1",
        "text-sm",
        "transition-colors duration-300 ease-in-out",
        "outline-none focus-visible:ring-2 focus-visible:ring-[#059669]",
        "focus-visible:ring-offset-2 rounded-sm",
        isActive
          ? "text-[#059669] font-medium"
          : isPending
            ? "text-[#059669] opacity-90 cursor-wait font-medium"
            : "text-[#334155] hover:text-[#059669] font-normal",
      ].join(" ")}
    >
      <span className="relative">
        {label}

        {/* Zero-layout-shift inline spinner rendered in the gap between items */}
        {isPending && (
          <span
            className="absolute left-full ml-1.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          >
            <Spinner size="xs" color="emerald" className="size-3" />
          </span>
        )}
      </span>

      {/* Active / Pending underline — scales to 1 when active or pending */}
      <motion.span
        aria-hidden="true"
        className={[
          "absolute bottom-0 left-0 right-0 h-px bg-[#059669] origin-left pointer-events-none",
          isPending && !isActive ? "animate-pulse" : "",
        ].join(" ")}
        initial={false}
        animate={{ scaleX: isActive || isPending ? 1 : 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
      />

      {/* Hover underline — only when not active and not pending */}
      {!isActive && !isPending && (
        <motion.span
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-px bg-[#059669] origin-left pointer-events-none"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
        />
      )}

      {/* Screen reader announcement for loading state */}
      {isPending && (
        <span className="sr-only" role="status">
          Loading {label}...
        </span>
      )}
    </Link>
  );
}
