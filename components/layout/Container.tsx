import { containerSizes } from "@/lib/layout-tokens";
import type { ContainerProps } from "./types";

/**
 * Container
 *
 * Centres content and constrains its maximum width to one of four editorial
 * breakpoints. Applies consistent responsive horizontal padding.
 *
 * Sizes:
 *   sm  → 768px   (article body, narrow prose)
 *   md  → 1024px  (mid-width content)
 *   lg  → 1280px  (full-page grid — default)
 *   xl  → 1440px  (hero spans, max canvas)
 *
 * Usage:
 * ```tsx
 * <Container size="lg">…</Container>
 * <Container size="sm" as="article">…</Container>
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
        "px-4 sm:px-6 lg:px-8", // responsive horizontal padding
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
