/**
 * Layout System — barrel export
 *
 * Import primitives from a single path:
 *
 *   import { Container, Section, PageHeader, ContentWrapper } from "@/components/layout";
 *   import { PublicLayout, AdminLayout } from "@/components/layout";
 *   import type { ContainerProps, SectionVariant } from "@/components/layout";
 */

// Primitives
export { default as Container } from "./Container";
export { default as Section } from "./Section";
export { default as PageHeader } from "./PageHeader";
export { default as ContentWrapper } from "./ContentWrapper";

// Shells
export { default as PublicLayout } from "./PublicLayout";
export { default as AdminLayout } from "./AdminLayout";

// Site wrappers
export { default as SiteNavbar } from "./SiteNavbar";
export { default as SiteFooter } from "./SiteFooter";

// Types
export type {
  ContainerProps,
  ContainerSize,
  SectionProps,
  SectionVariant,
  SectionBg,
  PageHeaderProps,
  ContentWrapperProps,
  PublicLayoutProps,
  AdminLayoutProps,
  AdminNavItem,
  PageLayoutProps,
} from "./types";
