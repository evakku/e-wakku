import type { ReactNode } from "react";

/**
 * A single navigation link definition.
 */
export interface NavLink {
  /** Display text for the navigation item */
  label: string;
  /** href the link navigates to */
  href: string;
}

/**
 * Props for the root Navbar component.
 */
export interface NavbarProps {
  /** Publication logo — any React node (image, SVG, styled text) */
  logo: ReactNode;
  /** Ordered list of navigation links rendered in the centre section */
  links: NavLink[];
  /**
   * The currently active pathname.
   * Pass `usePathname()` from `next/navigation` at the call-site
   * so the component stays portable across frameworks.
   */
  currentPath: string;
  /** Optional icon rendered inside the circular profile button */
  profileIcon?: ReactNode;
  /** Callback fired when the profile button is clicked */
  onProfileClick?: () => void;
  /**
   * Optional slot rendered between the desktop nav links and the right actions.
   * Used on /archive to inject the page-scoped search input.
   */
  searchSlot?: ReactNode;
}

/**
 * Props for an individual NavItem link.
 */
export interface NavItemProps extends NavLink {
  /** Whether this item matches the current route */
  isActive: boolean;
  /** Optional callback — used by MobileMenu to close itself on click */
  onClick?: () => void;
}

/**
 * Props for the animated mobile navigation overlay.
 */
export interface MobileMenuProps {
  /** Whether the mobile menu is open */
  isOpen: boolean;
  /** Navigation links to display */
  links: NavLink[];
  /** Current pathname for active-state detection */
  currentPath: string;
  /** Callback to close the menu */
  onClose: () => void;
}
