"use client";

import { motion } from "framer-motion";
import Container from "./Container";
import type { ContentWrapperProps } from "./types";

/**
 * ContentWrapper
 *
 * A thin animated wrapper around Container. Use it as the root element of a
 * page's main content region to get a consistent fade-up entrance.
 *
 * The `animate` prop (default: true) can be turned off for pages where
 * content arrives via streaming and should render without animation.
 *
 * Usage:
 * ```tsx
 * <ContentWrapper size="lg">
 *   <HeroSection />
 *   <PastIssues />
 * </ContentWrapper>
 * ```
 */

const wrapperEase = [0.4, 0, 0.2, 1] as [number, number, number, number];

export default function ContentWrapper({
  size = "lg",
  animate = true,
  className = "",
  children,
}: ContentWrapperProps) {
  if (!animate) {
    return (
      <Container size={size} className={className}>
        {children}
      </Container>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: wrapperEase }}
      className="w-full"
    >
      <Container size={size} className={className}>
        {children}
      </Container>
    </motion.div>
  );
}
