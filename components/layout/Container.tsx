import { containerSizes } from "@/lib/layout-tokens";
import type { ContainerProps } from "./types";

/**
 * Container
 *
 * The standard content-width wrapper for the entire E-Wakku platform.
 * Centres content, constrains its maximum width to a named size, and
 * applies a consistent responsive horizontal padding scale.
 *
 * ┌──────────────────────────────────────────────────────────┐
 * │ Size     │ Max-width │ Best for                          │
 * ├──────────┼───────────┼───────────────────────────────────┤
 * │ xs       │ 640px     │ Narrow forms, modals, sign-in     │
 * │ sm       │ 768px     │ Article body, contact form, prose  │
 * │ md       │ 1024px    │ Mid-width content, PageHeader     │
 * │ lg       │ 1280px    │ Full-page grids (default)         │
 * │ xl       │ 1440px    │ Hero spans, image galleries       │
 * │ full     │ 100%      │ Edge-to-edge (use with care)      │
 * └──────────┴───────────┴───────────────────────────────────┘
 *
 * Responsive horizontal padding scale:
 *   Mobile  (< 640px)   → px-4   (16px)
 *   Tablet  (≥ 640px)   → px-6   (24px)
 *   Desktop (≥ 1024px)  → px-8   (32px)
 *   Wide    (≥ 1536px)  → px-10  (40px)
 *
 * Usage:
 * ```tsx
 * // Default (lg = 1280px)
 * <Container>…</Container>
 *
 * // Contact form
 * <Container size="sm">…</Container>
 *
 * // Hero full-bleed with controlled interior
 * <Container size="xl">…</Container>
 *
 * // Render as <article>
 * <Container size="sm" as="article">…</Container>
 *
 * // Custom className extension
 * <Container size="lg" className="py-16">…</Container>
 * ```
 */
export default function Container({
  size = "lg",
  className = "",
  children,
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag
      className={[
        "mx-auto w-full",
        // Responsive horizontal padding — shared across every page
        "px-4 sm:px-6 lg:px-8 2xl:px-10",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ maxWidth: containerSizes[size] }}
    >
      {children}
    </Tag>
  );
}
