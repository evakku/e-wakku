/**
 * Design Tokens — E-Wakku Layout System
 * ──────────────────────────────────────────────────────────────────────────
 * Re-exports the canonical token file from src/lib/tokens.ts and adds
 * layout-system-specific tokens (spacing scale, container sizes, etc.)
 * for use exclusively in the layout components.
 *
 * For component-level styling, always prefer the CSS utilities in globals.css.
 * Use these JS tokens only for Framer Motion, programmatic style props, and
 * TypeScript-typed configuration objects.
 */
export * from "@/src/lib/tokens";

// ─── Container size breakpoints ───────────────────────────────────────────────

/** Max-widths available on the <Container> component */
export const containerSizes = {
  xs:   "640px",
  sm:   "768px",
  md:   "1024px",
  lg:   "1280px",
  xl:   "1440px",
  full: "100%",
} as const;

export type ContainerSize = keyof typeof containerSizes;

// ─── Section spacing scale (vertical padding per variant) ─────────────────────

/**
 * Maps Section variants → Tailwind padding classes.
 * Expressed as [mobile, tablet, desktop] responsive classes.
 */
export const sectionSpacing = {
  hero:    "py-16 sm:py-24 lg:py-32",    // 64 / 96 / 128 px
  large:   "py-14 sm:py-20 lg:py-28",    // 56 / 80 / 112 px
  default: "py-10 sm:py-14 lg:py-20",    // 40 / 56 / 80 px
  compact: "py-6  sm:py-8  lg:py-12",    // 24 / 32 / 48 px
  footer:  "py-8  sm:py-10 lg:py-12",    // 32 / 40 / 48 px
} as const;

export type SectionVariant = keyof typeof sectionSpacing;

// ─── Section background variants ──────────────────────────────────────────────

export const sectionBg = {
  white:       "bg-white",
  surface:     "bg-[#F8FAFC]",
  muted:       "bg-[#F0F2F4]",
  accent:      "bg-[#059669]",
  transparent: "bg-transparent",
} as const;

export type SectionBg = keyof typeof sectionBg;

// ─── Framer Motion animation presets ──────────────────────────────────────────

type EasingTuple = [number, number, number, number];

const ease: EasingTuple = [0.4, 0, 0.2, 1];
const easeOut: EasingTuple = [0, 0, 0.2, 1];

export const motionPresets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3, ease },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease },
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4, ease },
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4, ease },
  },
  staggerChildren: {
    animate: {
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  },
  staggerItem: {
    initial: { opacity: 0, y: 12 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease },
    },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.97 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, ease: easeOut },
  },
} as const;
