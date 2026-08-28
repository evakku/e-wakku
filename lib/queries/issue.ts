import { createClient } from "@/lib/supabase/server";
import { mockIssue, mockIssuesList } from "@/data/mockIssue";

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
 */
export async function getLatestIssue(): Promise<Issue | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .eq("is_draft", false)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      return data;
    }
  } catch (err) {
    console.error("getLatestIssue database error:", err);
  }

  // Fallback to mock issue if database returns empty or fails
  return {
    id: mockIssue.id,
    title: mockIssue.title,
    description: mockIssue.description,
    cover_image_url: mockIssue.coverImage,
    pdf_url: mockIssue.pdfUrl || "",
    month: mockIssue.season,
    year: parseInt(mockIssue.year, 10) || 2024,
    is_draft: false,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
}

/**
 * getPastIssues
 * Published issues ordered by newest first.
 * Pass `excludeId` to omit one issue (e.g. the home hero).
 * Pass `limit` to cap results (e.g. 3 on the home page).
 */
export async function getPastIssues(excludeId?: string, limit?: number): Promise<Issue[]> {
  try {
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

    if (limit !== undefined) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.error("getPastIssues database error:", err);
  }

  // Fallback to mock issues
  let fallback = mockIssuesList.map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    cover_image_url: m.coverImage,
    pdf_url: m.pdfUrl || "",
    month: m.season,
    year: parseInt(m.year, 10) || 2024,
    is_draft: false,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }));

  if (excludeId) {
    fallback = fallback.filter((item) => item.id !== excludeId);
  }

  if (limit !== undefined) {
    fallback = fallback.slice(0, limit);
  }

  return fallback;
}

/**
 * getAllPublishedIssues
 * Every published issue — used for the All Issues page.
 */
export async function getAllPublishedIssues(): Promise<Issue[]> {
  return getPastIssues();
}

/**
 * getIssueById
 * Single issue for the Issue Details page (app/.../issues/[id]/page.tsx).
 * Returns null if not found OR if it's a draft (drafts are only visible
 * to authenticated admins — use getIssueByIdAdmin for the admin panel).
 */
export async function getIssueById(id: string): Promise<Issue | null> {
  if (!id) return null;

  try {
    const supabase = await createClient();

    if (isUuid(id)) {
      const { data, error } = await supabase
        .from("issues")
        .select("*")
        .eq("id", id)
        .eq("is_draft", false)
        .maybeSingle();

      if (!error && data) {
        return data;
      }
    }
  } catch (err) {
    console.error("getIssueById database error:", err);
  }

  // Fallback: search mock issues by ID, title slug, or partial match
  const foundMock = mockIssuesList.find(
    (m) =>
      m.id === id ||
      m.id.toLowerCase() === id.toLowerCase() ||
      m.title.toLowerCase().replace(/\s+/g, "-") === id.toLowerCase()
  );

  if (foundMock) {
    return {
      id: foundMock.id,
      title: foundMock.title,
      description: foundMock.description,
      cover_image_url: foundMock.coverImage,
      pdf_url: foundMock.pdfUrl || "",
      month: foundMock.season,
      year: parseInt(foundMock.year, 10) || 2024,
      is_draft: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
  }

  return null;
}

/**
 * getIssueByIdAdmin
 * Same as above but does NOT filter out drafts — for the admin panel,
 * where you need to preview/edit unpublished issues too. Relies on the
 * "Authenticated can view all issues" RLS policy, so this only works
 * when called with a logged-in admin session.
 */
export async function getIssueByIdAdmin(id: string): Promise<Issue | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("issues")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getIssueByIdAdmin failed:", error.message);
    return null;
  }
  return data;
}

/**
 * getAllIssuesAdmin
 * All issues (published + draft) — for the admin "Issues" list/dashboard.
 */
export async function getAllIssuesAdmin(): Promise<Issue[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("issues")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllIssuesAdmin failed:", error.message);
    return [];
  }
  return data ?? [];
}

export { getNewsletterSettings } from "./newsletter";