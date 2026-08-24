import type { Issue as MagazineIssue } from "@/components/magazine/types";
import type { Issue as DetailIssue } from "@/data/mockIssue";
import type { Issue as SupabaseIssueRow } from "./issue";

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
 * routing by id, not a real slug. Any component that does
 * `<Link href={`/issues/${issue.slug}`}>` will therefore correctly link to
 * `/issues/<uuid>`, matching the app/issues/[id]/ route — no component
 * changes needed for that either.
 */
export function toMagazineIssue(row: SupabaseIssueRow): MagazineIssue {
  return {
    _id: row.id,
    title: row.title,
    subtitle: `${row.month} ${row.year}`,
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
  return {
    id: row.id,
    title: row.title,
    issueNumber: String(row.year),
    season: row.month,
    year: String(row.year),
    description: row.description,
    coverImage: row.cover_image_url ?? "",
    pdfUrl: row.pdf_url || undefined,
    pageCount: 0,
  };
}