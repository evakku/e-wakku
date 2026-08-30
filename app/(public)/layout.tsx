import PublicLayout from "@/components/layout/PublicLayout";

/**
 * (public) Route Group Layout
 *
 * Wraps every public page — Home, About, Contact, Archive, Issue, Search,
 * Newsletter — in the PublicLayout shell (SiteNavbar + main + SiteFooter).
 *
 * The parentheses in "(public)" are a Next.js App Router convention: they
 * group routes together without affecting the URL path structure.
 *
 * Pages:
 *   /              → app/(public)/page.tsx
 *   /about         → app/(public)/about/page.tsx
 *   /contact       → app/(public)/contact/page.tsx
 *   /allIssues     → app/(public)/allIssues/page.tsx
 *   /issue/[slug]  → app/(public)/issue/[slug]/page.tsx
 *   /search        → app/(public)/search/page.tsx
 *   /newsletter    → app/(public)/newsletter/page.tsx
 */
export default function PublicGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicLayout>{children}</PublicLayout>;
}
