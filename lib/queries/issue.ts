import { createClient } from "@/lib/supabase/server";

export interface Issue {
  id: string;
  title: string;
  description: string;
  cover_image_url: string;
  pdf_url: string;
  month: string;
  year: number;
  is_draft: boolean;
  published_at: string | null;
  created_at: string;
}

const isUuid = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

/**
 * getLatestIssue
 * The single most recent published issue — used for the Home page hero.
 * Does not fall back to silent mock data on database error (CQ-03).
 */
export async function getLatestIssue(): Promise<Issue | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("issues")
    .select("*")
    .eq("is_draft", false)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getLatestIssue database error:", error.message);
    throw new Error(`Failed to load latest issue: ${error.message}`);
  }

  return data ?? null;
}

/**
 * getPastIssues
 * Published issues ordered by newest first.
 * Supports pagination via limit and offset (BE-05).
 * Throws on database failure instead of returning mock data (CQ-03).
 */
export async function getPastIssues(
  excludeId?: string,
  limit?: number,
  offset?: number
): Promise<Issue[]> {
  const supabase = await createClient();

  let query = supabase
    .from("issues")
    .select("*")
    .eq("is_draft", false)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (excludeId && isUuid(excludeId)) {
    query = query.neq("id", excludeId);
  }

  if (offset !== undefined && offset > 0) {
    const end = limit !== undefined ? offset + limit - 1 : offset + 49;
    query = query.range(offset, end);
  } else if (limit !== undefined) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getPastIssues database error:", error.message);
    throw new Error(`Failed to fetch published issues: ${error.message}`);
  }

  return data ?? [];
}

/**
 * getAllPublishedIssues
 * Every published issue — used for the All Issues page.
 * Supports pagination (BE-05).
 */
export async function getAllPublishedIssues(
  limit?: number,
  offset?: number
): Promise<Issue[]> {
  return getPastIssues(undefined, limit, offset);
}

/**
 * getIssueById
 * Single issue for the Issue Details page (app/issues/[slug] or app/(public)/issue/[slug]).
 * Returns null if not found OR if it's a draft.
 * Throws on database failure instead of returning mock data (CQ-03).
 */
export async function getIssueById(id: string): Promise<Issue | null> {
  if (!id) return null;

  const supabase = await createClient();

  let query = supabase
    .from("issues")
    .select("*")
    .eq("is_draft", false);

  if (isUuid(id)) {
    query = query.eq("id", id);
  } else {
    // If not a UUID, search title matching slug format
    query = query.ilike("title", id.replace(/-/g, " "));
  }

  const { data, error } = await query.limit(1).maybeSingle();

  if (error) {
    console.error("getIssueById database error:", error.message);
    throw new Error(`Failed to fetch issue: ${error.message}`);
  }

  return data ?? null;
}

/**
 * getIssueByIdAdmin
 * Same as above but does NOT filter out drafts — for the admin panel.
 */
export async function getIssueByIdAdmin(id: string): Promise<Issue | null> {
  const supabase = await createClient();

  let query = supabase.from("issues").select("*");

  if (isUuid(id)) {
    query = query.eq("id", id);
  } else {
    query = query.ilike("title", id.replace(/-/g, " "));
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("getIssueByIdAdmin failed:", error.message);
    return null;
  }
  return data ?? null;
}

/**
 * getAllIssuesAdmin
 * All issues (published + draft) — for the admin "Issues" list/dashboard.
 * Supports pagination (BE-05).
 */
export async function getAllIssuesAdmin(
  limit?: number,
  offset?: number
): Promise<Issue[]> {
  const supabase = await createClient();

  let query = supabase
    .from("issues")
    .select("*")
    .order("created_at", { ascending: false });

  if (offset !== undefined && offset > 0) {
    const end = limit !== undefined ? offset + limit - 1 : offset + 49;
    query = query.range(offset, end);
  } else if (limit !== undefined) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getAllIssuesAdmin failed:", error.message);
    return [];
  }
  return data ?? [];
}

export interface IssueStatsAdmin {
  total: number;
  published: number;
  draft: number;
  withPdf: number;
  withCover: number;
}

/**
 * getIssueStatsAdmin
 * Uses SQL COUNT(*) aggregations (head: true) to fetch total, published, draft,
 * and PDF counts without loading entire entity rows into Node.js server memory.
 */
export async function getIssueStatsAdmin(): Promise<IssueStatsAdmin> {
  const supabase = await createClient();

  const [totalRes, publishedRes, draftRes, pdfRes, coverRes] = await Promise.all([
    supabase.from("issues").select("id", { count: "exact", head: true }),
    supabase.from("issues").select("id", { count: "exact", head: true }).eq("is_draft", false),
    supabase.from("issues").select("id", { count: "exact", head: true }).eq("is_draft", true),
    supabase.from("issues").select("id", { count: "exact", head: true }).not("pdf_url", "is", null),
    supabase.from("issues").select("id", { count: "exact", head: true }).not("cover_image_url", "is", null),
  ]);

  return {
    total: totalRes.count ?? 0,
    published: publishedRes.count ?? 0,
    draft: draftRes.count ?? 0,
    withPdf: pdfRes.count ?? 0,
    withCover: coverRes.count ?? 0,
  };
}

export { getNewsletterSettings } from "./newsletter";