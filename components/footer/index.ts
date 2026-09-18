/**
 * Footer component barrel export.
 *
 * Import examples:
 *   import Footer from "@/components/footer";
 *   import { FooterBrand, FooterLinks } from "@/components/footer";
 *   import type { FooterProps, FooterLink } from "@/components/footer/types";
 */
export { default } from "./Footer";
export { default as FooterBrand } from "./FooterBrand";
export { default as FooterLinks } from "./FooterLinks";
export { default as FooterAttribution } from "./FooterAttribution";
export type {
  FooterProps,
  FooterBrandProps,
  FooterLinksProps,
  FooterAttributionProps,
  FooterLink,
} from "./types";
