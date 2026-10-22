"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminAuth } from "@/lib/supabase/auth";
import { removeIssueAnalytics } from "@/lib/analytics";
import { validateCoverImageFile, validatePdfDocumentFile } from "@/lib/validation/file-upload";

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
  const auth = await requireAdminAuth();
  if (!auth.authorized) {
    return { issues: [], total: 0, error: auth.error };
  }
  const supabase = auth.supabase;
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
  const auth = await requireAdminAuth();
  if (!auth.authorized) {
    return { error: auth.error };
  }
  const supabase = auth.supabase;
  const newDraft = !currentDraft;

  // When moving to draft, preserve existing published_at history.
  // When publishing from draft, assign new published_at timestamp.
  const updatePayload: { is_draft: boolean; published_at?: string } = {
    is_draft: newDraft,
  };

  if (!newDraft) {
    updatePayload.published_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("issues")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/issues/manage");
  revalidatePath("/admin/issues");
  revalidatePath("/allIssues");
  revalidatePath("/archive");
  revalidatePath("/archives");
  revalidatePath("/issues");
  revalidatePath("/about");
  revalidatePath("/");
  return {
    success: true,
    message: newDraft ? "Issue set to draft" : "Issue published successfully",
  };
}

// ─── Delete an issue (+ clean up Supabase Storage) ───────────────────────────

export async function deleteIssue(id: string): Promise<ActionResult> {
  const auth = await requireAdminAuth();
  if (!auth.authorized) {
    return { error: auth.error };
  }
  const supabase = auth.supabase;

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

  // 3. Remove issue entry from analytics (totals are preserved)
  await removeIssueAnalytics(id);

  // 4. Remove files from Supabase Storage buckets (best-effort)
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
  revalidatePath("/allIssues");
  revalidatePath("/archive");
  revalidatePath("/archives");
  revalidatePath("/issues");
  revalidatePath("/about");
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

function sanitizeStorageFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function updateIssue(
  prevState: UpdateIssueState,
  formData: FormData
): Promise<UpdateIssueState> {
  const auth = await requireAdminAuth();
  if (!auth.authorized) {
    return { error: auth.error };
  }
  const supabase = auth.supabase;

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

  // Fetch current issue row for storage file comparisons
  const { data: currentIssue, error: currentErr } = await supabase
    .from("issues")
    .select("*")
    .eq("id", id)
    .single();

  if (currentErr || !currentIssue) {
    return { error: "Issue not found." };
  }

  const updates: Record<string, unknown> = {
    title: parsed.data.title,
    description: parsed.data.description,
    month: parsed.data.month,
    year: parsed.data.year,
    is_draft: parsed.data.isDraft,
  };

  // If status changed from draft to published, ensure published_at is set.
  // When moving to draft, preserve existing published_at history.
  if (currentIssue.is_draft && !parsed.data.isDraft) {
    updates.published_at = new Date().toISOString();
  }

  let newCoverPathToRollback: string | null = null;
  let newPdfPathToRollback: string | null = null;
  let oldCoverPathToDelete: string | null = null;
  let oldPdfPathToDelete: string | null = null;

  // Handle optional new cover image
  const coverImage = formData.get("coverImage") as File | null;
  if (coverImage && coverImage.size > 0) {
    const coverValidation = await validateCoverImageFile(coverImage);
    if (!coverValidation.valid) {
      return { error: coverValidation.error || "Invalid cover image." };
    }
    const safeCoverName = sanitizeStorageFileName(coverImage.name);
    const coverPath = `${crypto.randomUUID()}-${safeCoverName}`;
    const { error: coverErr } = await supabase.storage
      .from("covers")
      .upload(coverPath, coverImage, {
        contentType: coverImage.type || "image/png",
        upsert: false,
      });

    if (coverErr) {
      return { error: `Cover image upload failed: ${coverErr.message}` };
    }

    newCoverPathToRollback = coverPath;
    const { data: coverUrlData } = supabase.storage
      .from("covers")
      .getPublicUrl(coverPath);
    updates.cover_image_url = coverUrlData.publicUrl;

    if (currentIssue.cover_image_url) {
      oldCoverPathToDelete = extractStoragePath(currentIssue.cover_image_url, "covers");
    }
  }

  // Handle optional new PDF file
  const pdfFile = formData.get("pdfFile") as File | null;
  if (pdfFile && pdfFile.size > 0) {
    const pdfValidation = await validatePdfDocumentFile(pdfFile);
    if (!pdfValidation.valid) {
      if (newCoverPathToRollback) {
        await supabase.storage.from("covers").remove([newCoverPathToRollback]);
      }
      return { error: pdfValidation.error || "Invalid PDF file." };
    }
    const safePdfName = sanitizeStorageFileName(pdfFile.name);
    const pdfPath = `${crypto.randomUUID()}-${safePdfName}`;
    const { error: pdfErr } = await supabase.storage
      .from("issue-pdfs")
      .upload(pdfPath, pdfFile, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (pdfErr) {
      if (newCoverPathToRollback) {
        await supabase.storage.from("covers").remove([newCoverPathToRollback]);
      }
      return { error: `PDF upload failed: ${pdfErr.message}` };
    }

    newPdfPathToRollback = pdfPath;
    const { data: pdfUrlData } = supabase.storage
      .from("issue-pdfs")
      .getPublicUrl(pdfPath);
    updates.pdf_url = pdfUrlData.publicUrl;

    if (currentIssue.pdf_url) {
      oldPdfPathToDelete = extractStoragePath(currentIssue.pdf_url, "issue-pdfs");
    }
  }

  // Update in database
  const { error: updateErr } = await supabase
    .from("issues")
    .update(updates)
    .eq("id", id);

  if (updateErr) {
    // Rollback any newly uploaded files
    if (newCoverPathToRollback) {
      await supabase.storage.from("covers").remove([newCoverPathToRollback]);
    }
    if (newPdfPathToRollback) {
      await supabase.storage.from("issue-pdfs").remove([newPdfPathToRollback]);
    }
    return { error: `Database update failed: ${updateErr.message}` };
  }

  // Clean up old files only after database write succeeds
  if (oldCoverPathToDelete) {
    await supabase.storage.from("covers").remove([oldCoverPathToDelete]);
  }
  if (oldPdfPathToDelete) {
    await supabase.storage.from("issue-pdfs").remove([oldPdfPathToDelete]);
  }

  revalidatePath("/admin/issues/manage");
  revalidatePath("/admin/issues");
  revalidatePath("/allIssues");
  revalidatePath("/archive");
  revalidatePath("/archives");
  revalidatePath("/issues");
  revalidatePath("/about");
  revalidatePath("/");

  return { success: true, message: "Issue updated successfully!" };
}
