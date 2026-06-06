/**
 * E-Wakku Design Token System
 * ─────────────────────────────────────────────────────────────────────
 * TypeScript mirror of the CSS custom properties defined in globals.css.
 * Use these constants for:
 *  - JS-driven animation values (framer-motion, GSAP)
 *  - Programmatic style calculations
 *  - Autocomplete and type safety in component logic
 *
 * NOTE: These are NOT runtime values injected into CSS. The CSS variables
 * in globals.css are the true source of truth. This file is a reference
 * layer only.
 */

// ─── Colour Tokens ────────────────────────────────────────────────────────────

export const colorTokens = {
  /** Page canvas — #F7F9FB */
  background: 'var(--background)',
  /** Primary text — #191C1E */
  foreground: 'var(--foreground)',

  /** Card surface — #FFFFFF */
  card: 'var(--card)',
  /** Card text — #191C1E */
  cardForeground: 'var(--card-foreground)',

  /** Popover/dropdown surface */
  popover: 'var(--popover)',
  popoverForeground: 'var(--popover-foreground)',

  /** Brand black — #000000 */
  primary: 'var(--primary)',
  primaryForeground: 'var(--primary-foreground)',

  /** Tonal surface — #F0F2F4 */
  secondary: 'var(--secondary)',
  secondaryForeground: 'var(--secondary-foreground)',

  /** Subdued tonal surface — #F0F2F4 */
  muted: 'var(--muted)',
  /** Secondary text — #45464D */
  mutedForeground: 'var(--muted-foreground)',

  /** Emerald accent — #2B6954 */
  accent: 'var(--accent)',
  accentForeground: 'var(--accent-foreground)',
  /** Emerald accent light — #ADEDD3 */
  accentLight: 'var(--accent-light)',

  /** Error — #BA1A1A */
  destructive: 'var(--destructive)',
  /** Success — #2B6954 */
  success: 'var(--success)',

  /** Default border — #C6C6CD */
  border: 'var(--border)',
  /** Outline / secondary border — #76777D */
  outline: 'var(--outline)',
  /** Input background — #F0F2F4 */
  input: 'var(--input)',
  /** Focus ring — Emerald #2B6954 */
  ring: 'var(--ring)',
} as const

/** Raw hex values for use in JS contexts (canvas, SVG, etc.) */
export const colorHex = {
  background:   '#F7F9FB',
  foreground:   '#191C1E',
  card:         '#FFFFFF',
  muted:        '#F0F2F4',
  mutedFg:      '#45464D',
  primary:      '#000000',
  accent:       '#2B6954',
  accentLight:  '#ADEDD3',
  border:       '#C6C6CD',
  outline:      '#76777D',
  destructive:  '#BA1A1A',
  success:      '#2B6954',
} as const

// ─── Typography Tokens ────────────────────────────────────────────────────────

export const fontTokens = {
  heading: 'var(--font-heading)',
  body: 'var(--font-body)',
} as const

export const typeScale = {
  displayXl: {
    fontFamily: fontTokens.heading,
    /** Fluid: 40px → 64px */
    fontSize: 'clamp(2.5rem, 5vw + 1rem, 4rem)',
    fontWeight: 400,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    cssClass: 'type-display-xl',
  },
  headlineLg: {
    fontFamily: fontTokens.heading,
    /** Fluid: 30px → 48px */
    fontSize: 'clamp(1.875rem, 3.5vw + 0.75rem, 3rem)',
    fontWeight: 400,
    lineHeight: 1.2,
    letterSpacing: '-0.015em',
    cssClass: 'type-headline-lg',
  },
  headlineMd: {
    fontFamily: fontTokens.heading,
    /** Fluid: 22px → 32px */
    fontSize: 'clamp(1.375rem, 2vw + 0.5rem, 2rem)',
    fontWeight: 400,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
    cssClass: 'type-headline-md',
  },
  subheadline: {
    fontFamily: fontTokens.body,
    fontSize: '1.25rem', /* 20px */
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '-0.005em',
    cssClass: 'type-subheadline',
  },
  bodyLg: {
    fontFamily: fontTokens.body,
    fontSize: '1.125rem', /* 18px */
    fontWeight: 400,
    lineHeight: 1.7,
    letterSpacing: '0',
    cssClass: 'type-body-lg',
  },
  bodyMd: {
    fontFamily: fontTokens.body,
    fontSize: '1rem', /* 16px */
    fontWeight: 400,
    lineHeight: 1.6,
    letterSpacing: '0',
    cssClass: 'type-body-md',
  },
  labelCaps: {
    fontFamily: fontTokens.body,
    fontSize: '0.75rem', /* 12px */
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    cssClass: 'type-label-caps',
  },
} as const

// ─── Spacing Tokens ───────────────────────────────────────────────────────────

/** All values in pixels, matching globals.css */
export const spacingPx = {
  base:         8,
  /** Desktop horizontal margin */
  desktopMargin: 64,
  /** Mobile horizontal margin */
  mobileMargin:  24,
  /** Grid gutter */
  gutter:        32,
  /** Section gap */
  sectionGap:   120,
  /** Max container width */
  container:   1280,
} as const

/** CSS variable references */
export const spacingTokens = {
  container:  'var(--spacing-container)',
  section:    'var(--spacing-section)',
  gutter:     'var(--spacing-gutter)',
  pxDesktop:  'var(--spacing-px-desktop)',
  pxMobile:   'var(--spacing-px-mobile)',
} as const

// ─── Shape Tokens ─────────────────────────────────────────────────────────────

/** All values in pixels */
export const radiusPx = {
  /** Buttons, inputs, cards — soft-square language */
  button:  4,
  input:   4,
  card:    4,
  /** Images — context dependent */
  image:   0,
  /** Avatars only */
  avatar:  9999,
} as const

export const radiusTokens = {
  sm:   'var(--radius-sm)',   /* 2px  */
  md:   'var(--radius-md)',   /* 4px  */
  lg:   'var(--radius-lg)',   /* 8px  */
  xl:   'var(--radius-xl)',   /* 12px */
  '2xl': 'var(--radius-2xl)', /* 16px */
  full: 'var(--radius-full)', /* 9999px */
} as const

// ─── Elevation Tokens ─────────────────────────────────────────────────────────

/** Paper-like depth — CSS class names */
export const shadowClasses = {
  sm: 'shadow-paper-sm',
  md: 'shadow-paper-md',
  lg: 'shadow-paper-lg',
} as const

/** Raw box-shadow values for JS usage */
export const shadowValues = {
  sm: '0 1px 2px rgba(25,28,30,0.04), 0 2px 8px rgba(25,28,30,0.06)',
  md: '0 2px 4px rgba(25,28,30,0.04), 0 6px 20px rgba(25,28,30,0.07), 0 1px 2px rgba(25,28,30,0.04)',
  lg: '0 4px 8px rgba(25,28,30,0.04), 0 16px 40px rgba(25,28,30,0.08), 0 2px 4px rgba(25,28,30,0.04)',
} as const

// ─── Transition Tokens ────────────────────────────────────────────────────────

export const transitions = {
  fast:   'var(--transition-fast)',   /* 150ms */
  base:   'var(--transition-base)',   /* 200ms */
  slow:   'var(--transition-slow)',   /* 300ms */
  spring: 'var(--transition-spring)', /* 400ms spring */
} as const

/** Duration-only values for use with framer-motion / GSAP */
export const durations = {
  fast:   0.15,
  base:   0.20,
  slow:   0.30,
  spring: 0.40,
} as const

// ─── Consolidated Tokens Export ───────────────────────────────────────────────

export const tokens = {
  color:      colorTokens,
  colorHex,
  font:       fontTokens,
  typeScale,
  spacing:    spacingTokens,
  spacingPx,
  radius:     radiusTokens,
  radiusPx,
  shadow:     shadowClasses,
  shadowValues,
  transitions,
  durations,
} as const

export type Tokens = typeof tokens
