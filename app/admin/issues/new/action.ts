"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminAuth } from "@/lib/supabase/auth";

const issueSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  month: z.string().min(1, "Select a month."),
  year: z.coerce.number().min(2000, "Select a year."),
  isDraft: z.string().transform((v) => v === "true"),
});

export type CreateIssueState = {
  error?: string;
  success?: boolean;
};

/**
 * createIssue
 *
 * Server Action called from the Add Issue form.
 * Validates admin authorization, validates fields, uploads the cover image + PDF
 * to Supabase Storage, then inserts the issue row. Rolls back uploaded files if any step fails.
 */
export async function createIssue(
  prevState: CreateIssueState,
  formData: FormData
): Promise<CreateIssueState> {
  // 1. Enforce Server Action authorization independently
  const auth = await requireAdminAuth();
  if (!auth.authorized) {
    return { error: auth.error };
  }
  const supabase = auth.supabase;
  const parsed = issueSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    month: formData.get("month"),
    year: formData.get("year"),
    isDraft: formData.get("isDraft"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const coverImage = formData.get("coverImage") as File | null;
  const pdfFile = formData.get("pdfFile") as File | null;

  if (!coverImage || coverImage.size === 0) {
    return { error: "Cover image is required." };
  }
  const isPng =
    coverImage.type === "image/png" ||
    coverImage.type === "image/x-png" ||
    coverImage.name.toLowerCase().endsWith(".png");
  if (!isPng) {
    return { error: "Cover image must be a .png file." };
  }
  if (!pdfFile || pdfFile.size === 0) {
    return { error: "PDF file is required." };
  }
  const isPdf =
    pdfFile.type === "application/pdf" ||
    pdfFile.type === "application/x-pdf" ||
    pdfFile.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    return { error: "File must be a .pdf." };
  }

  const coverPath = `${crypto.randomUUID()}-${coverImage.name}`;
  const pdfPath = `${crypto.randomUUID()}-${pdfFile.name}`;

  // 1. Upload cover image
  const { error: coverErr } = await supabase.storage.from("covers").upload(coverPath, coverImage);
  if (coverErr) {
    return { error: `Cover upload failed: ${coverErr.message}` };
  }
  const { data: coverUrlData } = supabase.storage.from("covers").getPublicUrl(coverPath);

  // 2. Upload PDF
  const { error: pdfErr } = await supabase.storage.from("issue-pdfs").upload(pdfPath, pdfFile);
  if (pdfErr) {
    await supabase.storage.from("covers").remove([coverPath]); // rollback
    return { error: `PDF upload failed: ${pdfErr.message}` };
  }
  const { data: pdfUrlData } = supabase.storage.from("issue-pdfs").getPublicUrl(pdfPath);

  // 3. Insert the issue row
  const { error: insertErr } = await supabase.from("issues").insert({
    title: parsed.data.title,
    description: parsed.data.description,
    cover_image_url: coverUrlData.publicUrl,
    pdf_url: pdfUrlData.publicUrl,
    month: parsed.data.month,
    year: parsed.data.year,
    is_draft: parsed.data.isDraft,
    published_at: parsed.data.isDraft ? null : new Date().toISOString(),
  });

  if (insertErr) {
    // rollback both uploads
    await supabase.storage.from("covers").remove([coverPath]);
    await supabase.storage.from("issue-pdfs").remove([pdfPath]);
    return { error: `Failed to save issue: ${insertErr.message}` };
  }

  revalidatePath("/admin/issues");
  revalidatePath("/admin/issues/manage");
  revalidatePath("/allIssues");
  revalidatePath("/archive");
  revalidatePath("/archives");
  revalidatePath("/issues");
  revalidatePath("/");
  return { success: true };
}
