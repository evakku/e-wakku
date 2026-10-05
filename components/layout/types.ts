import type { ReactNode } from "react";
import type {
  ContainerSize,
  SectionVariant,
  SectionBg,
} from "@/lib/layout-tokens";

// ─── Re-export token types so consumers import from one place ─────────────────
export type { ContainerSize, SectionVariant, SectionBg };

// ─── Container ────────────────────────────────────────────────────────────────

export interface ContainerProps {
  /**
   * Content max-width:
   *   xs   = 640px  (narrow forms, modals)
   *   sm   = 768px  (article body, narrow prose)
   *   md   = 1024px (mid-width content)
   *   lg   = 1280px (full-page grid — default)
   *   xl   = 1440px (hero spans, image galleries)
   *   full = 100%   (edge-to-edge — use with care)
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "full";
  /** Extra Tailwind classes */
  className?: string;
  children: ReactNode;
  /** Render as a different HTML element (default: "div") */
  as?: "div" | "section" | "article" | "main" | "aside" | "nav" | "header" | "footer";
}

// ─── Section ──────────────────────────────────────────────────────────────────

export interface SectionProps {
  /** Vertical spacing variant */
  variant?: SectionVariant;
  /** Background colour variant */
  bg?: SectionBg;
  /** Render a 1px border-top above the section */
  divider?: boolean;
  /** Extra Tailwind classes */
  className?: string;
  children: ReactNode;
  /** id for anchor navigation */
  id?: string;
}

// ─── PageHeader ───────────────────────────────────────────────────────────────

export interface PageHeaderProps {
  /** Main page title — rendered as h1 in Noto Serif */
  title: string;
  /** Optional short sub-label rendered above the title (e.g. "EST. 2024") */
  badge?: string;
  /** Subtitle / standfirst — rendered in Inter */
  description?: string;
  /** Right-aligned actions (buttons, links) */
  actions?: ReactNode;
  /** Visual alignment of the header block */
  align?: "left" | "center" | "right";
  /** Extra Tailwind classes on the outer wrapper */
  className?: string;
  /** Override the section variant (defaults to "hero") */
  sectionVariant?: SectionVariant;
}

// ─── ContentWrapper ───────────────────────────────────────────────────────────

export interface ContentWrapperProps {
  /** Content max-width size passed to inner Container */
  size?: ContainerSize;
  /** Animate content in on mount */
  animate?: boolean;
  /** Extra Tailwind classes */
  className?: string;
  children: ReactNode;
}

// ─── PublicLayout ─────────────────────────────────────────────────────────────

export interface PublicLayoutProps {
  children: ReactNode;
  /** Background colour of the page shell */
  bg?: SectionBg;
}

// ─── AdminLayout ──────────────────────────────────────────────────────────────

export interface AdminNavItem {
  label: string;
  href: string;
  /** Lucide icon node */
  icon?: ReactNode;
  /** Highlight as active — derived from current pathname outside the component */
  isActive?: boolean;
}

export interface AdminLayoutProps {
  children: ReactNode;
  /** Sidebar navigation items */
  navItems?: AdminNavItem[];
  /** Page title shown in the top bar */
  pageTitle?: string;
  /** Optional right-aligned action in the top bar */
  headerAction?: ReactNode;
}

// ─── PageLayout ───────────────────────────────────────────────────────────────

export interface PageLayoutProps {
  children: ReactNode;
  /** Which layout shell to use */
  variant?: "public" | "admin" | "minimal";
  /** Forwarded to PublicLayout / AdminLayout as appropriate */
  adminNavItems?: AdminNavItem[];
  adminPageTitle?: string;
}
