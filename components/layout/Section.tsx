import { sectionSpacing, sectionBg } from "@/lib/layout-tokens";
import type { SectionProps } from "./types";

/**
 * Section
 *
 * Provides consistent vertical rhythm between page sections.
 * Wraps content in a <section> element with a chosen spacing variant and
 * optional background / top divider.
 *
 * Variants (vertical padding):
 *   hero    → py-16 / py-24 / py-32   (64 / 96 / 128 px)
 *   large   → py-14 / py-20 / py-28   (56 / 80 / 112 px)
 *   default → py-10 / py-14 / py-20   (40 / 56 / 80 px)
 *   compact → py-6  / py-8  / py-12   (24 / 32 / 48 px)
 *   footer  → py-8  / py-10 / py-12   (32 / 40 / 48 px)
 *
 * Usage:
 * ```tsx
 * <Section variant="hero" bg="surface">…</Section>
 * <Section variant="compact" divider>…</Section>
 * ```
 */
export default function Section({
  variant = "default",
  bg = "transparent",
  divider = false,
  className = "",
  id,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      className={[
        sectionSpacing[variant],
        sectionBg[bg],
        divider ? "border-t border-[#E2E8F0]" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </section>
  );
}
