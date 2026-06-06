import type { ReactNode } from "react";

/**
 * A single footer navigation link.
 */
export interface FooterLink {
  label: string;
  href: string;
}

/**
 * Root Footer component props.
 */
export interface FooterProps {
  /** Publication / brand name rendered in Noto Serif */
  brandName: string;
  /** Copyright line rendered in Inter italic below the brand name */
  copyrightText: string;
  /** Ordered list of footer navigation links */
  links: FooterLink[];
  /**
   * Optional slot for additional right-column content (social icons, newsletter
   * CTA, etc.). Rendered above the link row when provided.
   */
  rightSlot?: ReactNode;
  /**
   * Optional slot for additional left-column content (tagline, contact info,
   * etc.). Rendered between the brand name and copyright line when provided.
   */
  leftSlot?: ReactNode;
}

/**
 * Props for the isolated brand sub-component.
 */
export interface FooterBrandProps {
  /** Publication / brand name */
  brandName: string;
  /** Copyright line */
  copyrightText: string;
  /** Optional extra content below brand name */
  children?: ReactNode;
}

/**
 * Props for the isolated link list sub-component.
 */
export interface FooterLinksProps {
  /** Ordered list of links */
  links: FooterLink[];
  /** Optional extra content above the link list */
  children?: ReactNode;
}
