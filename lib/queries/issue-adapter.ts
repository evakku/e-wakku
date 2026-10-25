import type { Issue as MagazineIssue } from "@/components/magazine/types";
import type { Issue as DetailIssue } from "@/data/mockIssue";
import type { Issue as SupabaseIssueRow } from "./issue";
import { formatEditionName, MONTH_NAMES } from "@/lib/utils/edition";

/**
 * toMagazineIssue
 *
 * Reshapes a flat Supabase `issues` row into the `Issue` type your existing
 * components (HomeHero, IssueArchiveGrid, IssueHero, etc.) already expect —
 * the same shape they were built against for Sanity's mock data.
 *
 * This means those component files need ZERO changes. Only the data source
 * changed (Sanity -> Supabase); the shape handed to the UI stays identical.
 *
 * Note: `slug` is populated with the row's `id` (a UUID), since we're
 * routing by id/slug. Any component linking to `/issue/${issue.slug}` will
 * correctly link to `/issue/<uuid>`, matching the canonical app/issue/[slug]/
 * route.
 */
export function toMagazineIssue(row: SupabaseIssueRow): MagazineIssue {
  return {
    _id: row.id,
    title: row.title,
    subtitle: formatEditionName(row.month, row.year),
    description: row.description,
    coverImage: row.cover_image_url,
    pdfUrl: row.pdf_url,
    slug: row.id,
    publishedDate: row.published_at ?? row.created_at,
  };
}

/**
 * toDetailIssue
 *
 * Maps a Supabase row into the shape expected by the issue detail
 * components (IssueHero, IssueInformation, PDFViewerPlaceholder).
 */
export function toDetailIssue(row: SupabaseIssueRow): DetailIssue {
  const idx = parseInt(row.month, 10);
  const monthName =
    Number.isFinite(idx) && idx >= 1 && idx <= 12
      ? MONTH_NAMES[idx - 1]
      : row.month;

  return {
    id: row.id,
    title: row.title,
    issueNumber: String(row.year),
    season: monthName,
    year: String(row.year),
    description: row.description,
    coverImage: row.cover_image_url ?? "",
    pdfUrl: row.pdf_url || undefined,
    pageCount: 0,
  };
}