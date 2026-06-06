import SiteNavbar from "./SiteNavbar";
import SiteFooter from "./SiteFooter";
import type { PublicLayoutProps } from "./types";

/**
 * PublicLayout
 *
 * The shell for every public-facing page:
 *   SiteNavbar (sticky)
 *   ↓
 *   <main> — flex-1 so it fills the remaining viewport height
 *   ↓
 *   SiteFooter
 *
 * Consumed by app/(public)/layout.tsx. Can be swapped or extended without
 * touching any individual page component.
 *
 * Note: SiteNavbar / SiteFooter are themselves thin wrappers around the
 * fully-reusable Navbar and Footer primitives in components/navbar/ and
 * components/footer/. Swap those props to adapt to another brand.
 */
export default function PublicLayout({ children, bg }: PublicLayoutProps) {
  const bgClass =
    bg === "white"
      ? "bg-white"
      : bg === "muted"
        ? "bg-[#F0F2F4]"
        : bg === "accent"
          ? "bg-[#059669]"
          : "bg-[#F8FAFC]"; // surface — default

  return (
    <div className={`flex min-h-svh flex-col ${bgClass}`}>
      <SiteNavbar />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </div>
  );
}
