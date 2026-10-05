/**
 * Navbar component barrel export.
 *
 * Import examples:
 *   import Navbar from "@/components/navbar";
 *   import { NavItem, MobileMenu } from "@/components/navbar";
 *   import type { NavbarProps, NavLink } from "@/components/navbar/types";
 */
export { default } from "./Navbar";
export { default as NavItem } from "./NavItem";
export { default as MobileMenu } from "./MobileMenu";
export type {
  NavbarProps,
  NavItemProps,
  MobileMenuProps,
  NavLink,
} from "./types";
