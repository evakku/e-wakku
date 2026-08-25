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

/**
 * getLatestIssue
 * The single most recent published issue — used for the Home page hero.
 */
export async function getLatestIssue(): Promise<Issue | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("issues")
    .select("*")
    .eq("is_draft", false)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getLatestIssue failed:", error.message);
    return null;
  }
  return data;
}

/**
 * getPastIssues
 * Published issues ordered by newest first.
 * Pass `excludeId` to omit one issue (e.g. the home hero).
 * Pass `limit` to cap results (e.g. 3 on the home page).
 */
export async function getPastIssues(excludeId?: string, limit?: number): Promise<Issue[]> {
  const supabase = await createClient();

  let query = supabase
    .from("issues")
    .select("*")
    .eq("is_draft", false)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  if (limit !== undefined) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getPastIssues failed:", error.message);
    return [];
  }
  return data ?? [];
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
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("issues")
    .select("*")
    .eq("id", id)
    .eq("is_draft", false)
    .maybeSingle();

  if (error) {
    console.error("getIssueById failed:", error.message);
    return null;
  }
  return data;
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