"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminAuth } from "@/lib/supabase/auth";
import {
  MAX_FILE_SIZE_BYTES,
  validateCoverImageFile,
  validatePdfDocumentFile,
  isPdfHeader,
  detectCoverImageFormat,
} from "@/lib/validation/file-upload";

const issueSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(255, "Title must be at most 255 characters."),
  description: z
    .string()
    .trim()
    .min(1, "Description is required."),
  month: z
    .string()
    .regex(/^(0[1-9]|1[0-2])$/, "Select a valid month (01-12)."),
  year: z.coerce
    .number()
    .int()
    .min(2000, "Select a valid year.")
    .max(2100, "Select a valid year."),
  isDraft: z.string().transform((v) => v === "true"),
  coverUrl: z.string().url().optional(),
  pdfUrl: z.string().url().optional(),
  coverStoragePath: z.string().optional(),
  pdfStoragePath: z.string().optional(),
});

export type CreateIssueState = {
  error?: string;
  success?: boolean;
  issueId?: string;
};

function sanitizeStorageFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/**
 * createIssue
 *
 * Server Action to create a new magazine issue.
 * Supports:
 * 1. Direct-to-Supabase Storage uploaded assets (preferred: avoids 413 server body limits).
 * 2. Direct FormData file uploads with server-side validation and rollback.
 *
 * Both paths strictly enforce:
 * - Admin authorization
 * - Maximum file size of 7.5 MiB (7,864,320 bytes) per file
 * - File header magic bytes inspection
 * - Safe rollback / deletion of uploaded files on DB failure
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
    coverUrl: formData.get("coverUrl") || undefined,
    pdfUrl: formData.get("pdfUrl") || undefined,
    coverStoragePath: formData.get("coverStoragePath") || undefined,
    pdfStoragePath: formData.get("pdfStoragePath") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  let finalCoverUrl = parsed.data.coverUrl;
  let finalPdfUrl = parsed.data.pdfUrl;
  let coverPathToDelete: string | null = parsed.data.coverStoragePath || null;
  let pdfPathToDelete: string | null = parsed.data.pdfStoragePath || null;

  // Path A: Direct-to-Storage upload was used (client uploaded to covers and issue-pdfs)
  if (coverPathToDelete && pdfPathToDelete && finalCoverUrl && finalPdfUrl) {
    // Server-side verification of storage objects (zero-trust client URLs)
    try {
      // 1. Verify Cover in Supabase Storage
      const { data: coverBlob, error: coverFetchErr } = await supabase.storage
        .from("covers")
        .download(coverPathToDelete);

      if (coverFetchErr || !coverBlob) {
        return { error: "Failed to verify uploaded cover image in storage." };
      }

      if (coverBlob.size === 0) {
        await supabase.storage.from("covers").remove([coverPathToDelete]);
        if (pdfPathToDelete) await supabase.storage.from("issue-pdfs").remove([pdfPathToDelete]);
        return { error: "The selected file is empty." };
      }

      if (coverBlob.size > MAX_FILE_SIZE_BYTES) {
        await supabase.storage.from("covers").remove([coverPathToDelete]);
        if (pdfPathToDelete) await supabase.storage.from("issue-pdfs").remove([pdfPathToDelete]);
        return { error: "The maximum file size is 7.5 MiB per file." };
      }

      const coverHeader = new Uint8Array(await coverBlob.slice(0, 16).arrayBuffer());
      if (!detectCoverImageFormat(coverHeader)) {
        await supabase.storage.from("covers").remove([coverPathToDelete]);
        if (pdfPathToDelete) await supabase.storage.from("issue-pdfs").remove([pdfPathToDelete]);
        return { error: "Please select a supported cover image format." };
      }

      // 2. Verify PDF in Supabase Storage
      const { data: pdfBlob, error: pdfFetchErr } = await supabase.storage
        .from("issue-pdfs")
        .download(pdfPathToDelete);

      if (pdfFetchErr || !pdfBlob) {
        await supabase.storage.from("covers").remove([coverPathToDelete]);
        return { error: "Failed to verify uploaded PDF document in storage." };
      }

      if (pdfBlob.size === 0) {
        await supabase.storage.from("covers").remove([coverPathToDelete]);
        await supabase.storage.from("issue-pdfs").remove([pdfPathToDelete]);
        return { error: "The selected file is empty." };
      }

      if (pdfBlob.size > MAX_FILE_SIZE_BYTES) {
        await supabase.storage.from("covers").remove([coverPathToDelete]);
        await supabase.storage.from("issue-pdfs").remove([pdfPathToDelete]);
        return { error: "The maximum file size is 7.5 MiB per file." };
      }

      const pdfHeader = new Uint8Array(await pdfBlob.slice(0, 5).arrayBuffer());
      if (!isPdfHeader(pdfHeader)) {
        await supabase.storage.from("covers").remove([coverPathToDelete]);
        await supabase.storage.from("issue-pdfs").remove([pdfPathToDelete]);
        return { error: "Please select a valid PDF file." };
      }
    } catch {
      if (coverPathToDelete) await supabase.storage.from("covers").remove([coverPathToDelete]);
      if (pdfPathToDelete) await supabase.storage.from("issue-pdfs").remove([pdfPathToDelete]);
      return { error: "Failed to verify uploaded files." };
    }
  } else {
    // Path B: Server-side FormData upload (used for fallback or testing)
    const coverImage = formData.get("coverImage") as File | null;
    const pdfFile = formData.get("pdfFile") as File | null;

    const coverValidation = await validateCoverImageFile(coverImage);
    if (!coverValidation.valid || !coverImage) {
      return { error: coverValidation.error || "Cover image is required." };
    }

    const pdfValidation = await validatePdfDocumentFile(pdfFile);
    if (!pdfValidation.valid || !pdfFile) {
      return { error: pdfValidation.error || "The issue PDF is required." };
    }

    const safeCoverName = sanitizeStorageFileName(coverImage.name);
    const safePdfName = sanitizeStorageFileName(pdfFile.name);
    const coverPath = `${crypto.randomUUID()}-${safeCoverName}`;
    const pdfPath = `${crypto.randomUUID()}-${safePdfName}`;

    // Upload cover image
    const { error: coverErr } = await supabase.storage.from("covers").upload(coverPath, coverImage, {
      contentType: coverImage.type || "image/png",
      upsert: false,
    });
    if (coverErr) {
      return { error: `Cover upload failed: ${coverErr.message}` };
    }
    coverPathToDelete = coverPath;
    const { data: coverUrlData } = supabase.storage.from("covers").getPublicUrl(coverPath);
    finalCoverUrl = coverUrlData.publicUrl;

    // Upload PDF
    const { error: pdfErr } = await supabase.storage.from("issue-pdfs").upload(pdfPath, pdfFile, {
      contentType: "application/pdf",
      upsert: false,
    });
    if (pdfErr) {
      await supabase.storage.from("covers").remove([coverPath]); // rollback cover
      return { error: `PDF upload failed: ${pdfErr.message}` };
    }
    pdfPathToDelete = pdfPath;
    const { data: pdfUrlData } = supabase.storage.from("issue-pdfs").getPublicUrl(pdfPath);
    finalPdfUrl = pdfUrlData.publicUrl;
  }

  // Insert the issue row into public.issues.
  // Security Guarantee: `created_by` is strictly obtained from the verified server-side session (`auth.user.id`).
  // It cannot be supplied, spoofed, or overridden by client parameters or FormData fields.
  const { data: insertedData, error: insertErr } = await supabase
    .from("issues")
    .insert({
      title: parsed.data.title,
      description: parsed.data.description,
      cover_image_url: finalCoverUrl,
      pdf_url: finalPdfUrl,
      month: parsed.data.month,
      year: parsed.data.year,
      is_draft: parsed.data.isDraft,
      published_at: parsed.data.isDraft ? null : new Date().toISOString(),
      created_by: auth.user.id,
    })
    .select("id")
    .single();

  if (insertErr) {
    // Rollback both uploads on database failure
    if (coverPathToDelete) await supabase.storage.from("covers").remove([coverPathToDelete]);
    if (pdfPathToDelete) await supabase.storage.from("issue-pdfs").remove([pdfPathToDelete]);
    return { error: `Failed to save issue: ${insertErr.message}` };
  }

  revalidatePath("/admin/issues");
  revalidatePath("/admin/issues/manage");
  revalidatePath("/allIssues");
  revalidatePath("/archive");
  revalidatePath("/archives");
  revalidatePath("/issues");
  revalidatePath("/about");
  revalidatePath("/");

  return { success: true, issueId: insertedData?.id };
}
