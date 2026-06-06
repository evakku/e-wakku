import type { Variants } from 'framer-motion';

/**
 * Reusable Framer Motion Variants
 * ─────────────────────────────────────────────────────────────────────
 * Durations are set between 300ms and 500ms (0.3s - 0.5s) to match the
 * premium, editorial feeling.
 */

export const fadeUpVariants = (shouldReduceMotion: boolean): Variants => ({
  hidden: {
    opacity: 0,
    y: shouldReduceMotion ? 0 : 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.215, 0.61, 0.355, 1], // easeOutCubic
    },
  },
});

export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};
