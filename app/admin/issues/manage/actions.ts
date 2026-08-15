"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type Issue = {
  id: string;
  title: string;
  description: string;
  cover_image_url: string | null;
  pdf_url: string | null;
  month: string;
  year: number;
  is_draft: boolean;
  published_at: string | null;
  created_at: string;
};

export type ActionResult = { error?: string; success?: boolean; message?: string };

// Helper to extract storage path from public URL
function extractStoragePath(url: string | null, bucket: string): string | null {
  if (!url) return null;
  const marker = `/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const rawPath = url.substring(idx + marker.length);
  try {
    return decodeURIComponent(rawPath);
  } catch {
    return rawPath;
  }
}

// ─── Fetch all issues (paginated with optional search & filter) ───────────────

export async function getIssues(
  page = 1,
  pageSize = 8,
  search = "",
  statusFilter: "all" | "published" | "draft" = "all"
): Promise<{ issues: Issue[]; total: number; error?: string }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("issues")
    .select("*", { count: "exact" });

  if (search.trim()) {
    query = query.ilike("title", `%${search.trim()}%`);
  }

  if (statusFilter === "published") {
    query = query.eq("is_draft", false);
  } else if (statusFilter === "draft") {
    query = query.eq("is_draft", true);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return { issues: [], total: 0, error: error.message };
  }

  return { issues: (data as Issue[]) ?? [], total: count ?? 0 };
}

// ─── Toggle draft / published ─────────────────────────────────────────────────

export async function toggleDraftStatus(
  id: string,
  currentDraft: boolean
): Promise<ActionResult> {
  const supabase = await createClient();
  const newDraft = !currentDraft;

  const { error } = await supabase
    .from("issues")
    .update({
      is_draft: newDraft,
      published_at: newDraft ? null : new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/issues/manage");
  revalidatePath("/admin/issues");
  revalidatePath("/archive");
  revalidatePath("/");
  return {
    success: true,
    message: newDraft ? "Issue set to draft" : "Issue published successfully",
  };
}

// ─── Delete an issue (+ clean up Supabase Storage) ───────────────────────────

export async function deleteIssue(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  // 1. Fetch to get storage file URLs
  const { data: issue, error: fetchErr } = await supabase
    .from("issues")
    .select("cover_image_url, pdf_url")
    .eq("id", id)
    .single();

  if (fetchErr) {
    return { error: fetchErr.message };
  }

  // 2. Delete database row
  const { error: deleteErr } = await supabase
    .from("issues")
    .delete()
    .eq("id", id);

  if (deleteErr) {
    return { error: deleteErr.message };
  }

  // 3. Remove files from Supabase Storage buckets (best-effort)
  if (issue?.cover_image_url) {
    const coverPath = extractStoragePath(issue.cover_image_url, "covers");
    if (coverPath) {
      await supabase.storage.from("covers").remove([coverPath]);
    }
  }

  if (issue?.pdf_url) {
    const pdfPath = extractStoragePath(issue.pdf_url, "issue-pdfs");
    if (pdfPath) {
      await supabase.storage.from("issue-pdfs").remove([pdfPath]);
    }
  }

  revalidatePath("/admin/issues/manage");
  revalidatePath("/admin/issues");
  revalidatePath("/archive");
  revalidatePath("/");
  return { success: true, message: "Issue deleted successfully" };
}

// ─── Update issue metadata and optional files ────────────────────────────────

const updateSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  month: z.string().min(1, "Month is required."),
  year: z.coerce.number().min(2000, "Year is required."),
  isDraft: z.string().transform((v) => v === "true"),
});

export type UpdateIssueState = ActionResult;

export async function updateIssue(
  prevState: UpdateIssueState,
  formData: FormData
): Promise<UpdateIssueState> {
  const id = formData.get("id") as string;
  if (!id) return { error: "Missing issue ID." };

  const parsed = updateSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    month: formData.get("month"),
    year: formData.get("year"),
    isDraft: formData.get("isDraft"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  // Fetch current issue row for storage file comparisons
  const { data: currentIssue, error: currentErr } = await supabase
    .from("issues")
    .select("*")
    .eq("id", id)
    .single();

  if (currentErr || !currentIssue) {
    return { error: "Issue not found." };
  }

  const updates: Record<string, any> = {
    title: parsed.data.title,
    description: parsed.data.description,
    month: parsed.data.month,
    year: parsed.data.year,
    is_draft: parsed.data.isDraft,
  };

  // If status changed from draft to published, ensure published_at is set
  if (currentIssue.is_draft && !parsed.data.isDraft) {
    updates.published_at = new Date().toISOString();
  } else if (!currentIssue.is_draft && parsed.data.isDraft) {
    updates.published_at = null;
  }

  // Handle optional new cover image
  const coverImage = formData.get("coverImage") as File | null;
  if (coverImage && coverImage.size > 0) {
    if (coverImage.type !== "image/png") {
      return { error: "Cover image must be a .png file." };
    }
    const coverPath = `${crypto.randomUUID()}-${coverImage.name}`;
    const { error: coverErr } = await supabase.storage
      .from("covers")
      .upload(coverPath, coverImage);

    if (coverErr) {
      return { error: `Cover image upload failed: ${coverErr.message}` };
    }

    const { data: coverUrlData } = supabase.storage
      .from("covers")
      .getPublicUrl(coverPath);
    updates.cover_image_url = coverUrlData.publicUrl;

    // Clean up old cover
    if (currentIssue.cover_image_url) {
      const oldCover = extractStoragePath(currentIssue.cover_image_url, "covers");
      if (oldCover) await supabase.storage.from("covers").remove([oldCover]);
    }
  }

  // Handle optional new PDF file
  const pdfFile = formData.get("pdfFile") as File | null;
  if (pdfFile && pdfFile.size > 0) {
    if (pdfFile.type !== "application/pdf") {
      return { error: "PDF file must be a .pdf document." };
    }
    const pdfPath = `${crypto.randomUUID()}-${pdfFile.name}`;
    const { error: pdfErr } = await supabase.storage
      .from("issue-pdfs")
      .upload(pdfPath, pdfFile);

    if (pdfErr) {
      return { error: `PDF upload failed: ${pdfErr.message}` };
    }

    const { data: pdfUrlData } = supabase.storage
      .from("issue-pdfs")
      .getPublicUrl(pdfPath);
    updates.pdf_url = pdfUrlData.publicUrl;

    // Clean up old PDF
    if (currentIssue.pdf_url) {
      const oldPdf = extractStoragePath(currentIssue.pdf_url, "issue-pdfs");
      if (oldPdf) await supabase.storage.from("issue-pdfs").remove([oldPdf]);
    }
  }

  // Update in database
  const { error: updateErr } = await supabase
    .from("issues")
    .update(updates)
    .eq("id", id);

  if (updateErr) {
    return { error: `Database update failed: ${updateErr.message}` };
  }

  revalidatePath("/admin/issues/manage");
  revalidatePath("/admin/issues");
  revalidatePath("/archive");
  revalidatePath("/");

  return { success: true, message: "Issue updated successfully!" };
}
