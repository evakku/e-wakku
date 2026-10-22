"use client";

import { useState, useRef, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  UploadCloud,
  FileText,
  ImageIcon,
  X,
  Loader2,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { createIssue } from "@/app/admin/issues/new/action";
import {
  validateCoverImageFile,
  validatePdfDocumentFile,
  formatFileSize,
} from "@/lib/validation/file-upload";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const currentYear = new Date().getFullYear();

type FieldErrors = {
  title?: string;
  description?: string;
  month?: string;
  year?: string;
  coverImage?: string;
  pdfFile?: string;
};

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function AddIssueForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const coverInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [month, setMonth] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));
  const [year, setYear] = useState(String(currentYear));
  const [isDraft, setIsDraft] = useState(true);

  // File states
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Validation & Progress states
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [toast, setToast] = useState<string | null>(null);

  // Immediate validation when cover is selected
  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = await validateCoverImageFile(file);
    if (!validation.valid) {
      setFieldErrors((prev) => ({
        ...prev,
        coverImage: validation.error || "Please select a supported cover image format.",
      }));
      setCoverImage(null);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      setCoverPreview(null);
      if (coverInputRef.current) coverInputRef.current.value = "";
      return;
    }

    setFieldErrors((prev) => ({ ...prev, coverImage: undefined }));
    setGeneralError(null);
    setCoverImage(file);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(URL.createObjectURL(file));
  }

  // Immediate validation when PDF is selected
  async function handlePdfChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = await validatePdfDocumentFile(file);
    if (!validation.valid) {
      setFieldErrors((prev) => ({
        ...prev,
        pdfFile: validation.error || "Please select a valid PDF file.",
      }));
      setPdfFile(null);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
      return;
    }

    setFieldErrors((prev) => ({ ...prev, pdfFile: undefined }));
    setGeneralError(null);
    setPdfFile(file);
  }

  function handleRemoveCover() {
    setCoverImage(null);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
    setFieldErrors((prev) => ({ ...prev, coverImage: undefined }));
  }

  function handleRemovePdf() {
    setPdfFile(null);
    if (pdfInputRef.current) pdfInputRef.current.value = "";
    setFieldErrors((prev) => ({ ...prev, pdfFile: undefined }));
  }

  // Pre-submission validation of all required fields
  async function validateAllFields(): Promise<boolean> {
    const errors: FieldErrors = {};

    if (!title.trim()) {
      errors.title = "Issue title is required.";
    }

    if (!description.trim()) {
      errors.description = "Description is required.";
    }

    if (!month) {
      errors.month = "Publication month is required.";
    }

    const yearNum = Number(year);
    if (!year || isNaN(yearNum) || yearNum < 2000) {
      errors.year = "Please enter a valid publication year (>= 2000).";
    }

    if (!coverImage) {
      errors.coverImage = "Cover image is required.";
    } else {
      const coverVal = await validateCoverImageFile(coverImage);
      if (!coverVal.valid) {
        errors.coverImage = coverVal.error;
      }
    }

    if (!pdfFile) {
      errors.pdfFile = "The issue PDF is required.";
    } else {
      const pdfVal = await validatePdfDocumentFile(pdfFile);
      if (!pdfVal.valid) {
        errors.pdfFile = pdfVal.error;
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isPending) return;

    setGeneralError(null);
    const isValid = await validateAllFields();
    if (!isValid) return;

    if (!coverImage || !pdfFile) return;

    startTransition(async () => {
      let uploadedCoverPath: string | null = null;
      let uploadedPdfPath: string | null = null;

      try {
        setUploadStatus("Validating files...");
        setUploadPercent(10);

        // Client-side direct upload to Supabase Storage (Preferred Architecture)
        const supabase = createClient();
        const safeCoverName = sanitizeFileName(coverImage.name);
        const safePdfName = sanitizeFileName(pdfFile.name);
        const coverStoragePath = `${crypto.randomUUID()}-${safeCoverName}`;
        const pdfStoragePath = `${crypto.randomUUID()}-${safePdfName}`;

        setUploadStatus("Uploading cover image directly to storage...");
        setUploadPercent(30);

        const { error: coverUploadErr } = await supabase.storage
          .from("covers")
          .upload(coverStoragePath, coverImage, {
            contentType: coverImage.type || "image/png",
            upsert: false,
          });

        if (coverUploadErr) {
          // If direct upload fails, fallback to Server Action FormData upload
          console.warn("Direct cover upload failed, falling back to server action:", coverUploadErr.message);
          return await submitViaServerActionFallback();
        }

        uploadedCoverPath = coverStoragePath;
        const { data: coverUrlData } = supabase.storage
          .from("covers")
          .getPublicUrl(coverStoragePath);

        setUploadStatus("Uploading publication PDF directly to storage...");
        setUploadPercent(65);

        const { error: pdfUploadErr } = await supabase.storage
          .from("issue-pdfs")
          .upload(pdfStoragePath, pdfFile, {
            contentType: "application/pdf",
            upsert: false,
          });

        if (pdfUploadErr) {
          // Rollback cover upload
          await supabase.storage.from("covers").remove([coverStoragePath]);
          uploadedCoverPath = null;
          console.warn("Direct PDF upload failed, falling back to server action:", pdfUploadErr.message);
          return await submitViaServerActionFallback();
        }

        uploadedPdfPath = pdfStoragePath;
        const { data: pdfUrlData } = supabase.storage
          .from("issue-pdfs")
          .getPublicUrl(pdfStoragePath);

        setUploadStatus("Finalizing issue publication record...");
        setUploadPercent(90);

        // Submit lightweight metadata payload to Server Action
        const metaFormData = new FormData();
        metaFormData.append("title", title.trim());
        metaFormData.append("description", description.trim());
        metaFormData.append("month", month);
        metaFormData.append("year", year);
        metaFormData.append("isDraft", String(isDraft));
        metaFormData.append("coverUrl", coverUrlData.publicUrl);
        metaFormData.append("pdfUrl", pdfUrlData.publicUrl);
        metaFormData.append("coverStoragePath", coverStoragePath);
        metaFormData.append("pdfStoragePath", pdfStoragePath);

        const result = await createIssue({}, metaFormData);

        if (result.error) {
          setGeneralError(result.error);
          setUploadStatus(null);
          setUploadPercent(0);
          return;
        }

        // Upload and DB record successfully created!
        setUploadPercent(100);
        setUploadStatus("Complete!");
        setToast(isDraft ? "Saved as draft" : "Issue published successfully!");

        // Clear form
        setTitle("");
        setDescription("");
        setCoverImage(null);
        if (coverPreview) URL.revokeObjectURL(coverPreview);
        setCoverPreview(null);
        setPdfFile(null);
        setIsDraft(true);
        if (coverInputRef.current) coverInputRef.current.value = "";
        if (pdfInputRef.current) pdfInputRef.current.value = "";

        setTimeout(() => {
          router.push("/admin/issues/manage");
        }, 1500);
      } catch (err: unknown) {
        // Safe cleanup on error
        try {
          const supabase = createClient();
          if (uploadedCoverPath) await supabase.storage.from("covers").remove([uploadedCoverPath]);
          if (uploadedPdfPath) await supabase.storage.from("issue-pdfs").remove([uploadedPdfPath]);
        } catch {
          // best-effort cleanup
        }
        const message = err instanceof Error ? err.message : "Upload failed. Please try again.";
        setGeneralError(message);
        setUploadStatus(null);
        setUploadPercent(0);
      }
    });
  }

  // Fallback if direct browser storage upload is blocked or fails
  async function submitViaServerActionFallback() {
    if (!coverImage || !pdfFile) return;

    setUploadStatus("Processing files via application server...");
    setUploadPercent(50);

    const fullFormData = new FormData();
    fullFormData.append("title", title.trim());
    fullFormData.append("description", description.trim());
    fullFormData.append("month", month);
    fullFormData.append("year", year);
    fullFormData.append("isDraft", String(isDraft));
    fullFormData.append("coverImage", coverImage);
    fullFormData.append("pdfFile", pdfFile);

    const result = await createIssue({}, fullFormData);
    if (result.error) {
      setGeneralError(result.error);
      setUploadStatus(null);
      setUploadPercent(0);
      return;
    }

    setUploadPercent(100);
    setUploadStatus("Complete!");
    setToast(isDraft ? "Saved as draft" : "Issue published successfully!");

    setTitle("");
    setDescription("");
    setCoverImage(null);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
    setPdfFile(null);
    setIsDraft(true);
    if (coverInputRef.current) coverInputRef.current.value = "";
    if (pdfInputRef.current) pdfInputRef.current.value = "";

    setTimeout(() => {
      router.push("/admin/issues/manage");
    }, 1500);
  }

  const canSubmit =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    month.length > 0 &&
    year.length > 0 &&
    coverImage !== null &&
    pdfFile !== null &&
    !isPending;

  return (
    <div className="mx-auto w-full max-w-[760px] animate-fade-in pb-12">
      {/* Header breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/admin/issues/manage"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748B] hover:text-[#0F172A] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Manage Issues
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="font-heading text-2xl text-[#0F172A] tracking-tight">
          Add New Issue
        </h2>
        <p className="mt-1 text-sm text-[#64748B]">
          Upload the issue cover, publication PDF, and metadata. Each file must be under 7.5 MiB.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        {generalError && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 animate-fade-in"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{generalError}</span>
          </div>
        )}

        {/* ALWAYS-MOUNTED FILE INPUTS */}
        <input
          ref={coverInputRef}
          type="file"
          id="coverImageInput"
          name="coverImage"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          disabled={isPending}
          onChange={handleCoverChange}
        />

        <input
          ref={pdfInputRef}
          type="file"
          id="pdfFileInput"
          name="pdfFile"
          accept="application/pdf"
          className="hidden"
          disabled={isPending}
          onChange={handlePdfChange}
        />

        {/* Uploads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cover Image Upload Area */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="coverImageInput"
              className="text-xs font-semibold text-[#475569] uppercase tracking-wider"
            >
              Cover Image (.png, .jpg, .webp) <span className="text-red-500">*</span>
            </label>
            <div
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 transition-colors min-h-[190px] ${
                fieldErrors.coverImage
                  ? "border-red-400 bg-red-50/20"
                  : coverImage
                  ? "border-[#059669] bg-[#ECFDF5]/30"
                  : "border-[#CBD5E1] bg-white hover:border-[#94A3B8]"
              }`}
            >
              {coverPreview && coverImage ? (
                <div className="relative flex flex-col items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    width={80}
                    height={112}
                    className="h-28 w-20 rounded object-cover shadow border border-slate-200"
                  />
                  <span className="text-xs font-medium text-[#0F172A] max-w-[180px] truncate">
                    {coverImage.name}
                  </span>
                  <span className="text-[11px] text-[#64748B]">
                    {formatFileSize(coverImage.size)} / 7.5 MiB
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => coverInputRef.current?.click()}
                      className="text-xs text-[#059669] hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw size={11} /> Change
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={handleRemoveCover}
                      className="text-xs text-red-600 hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <X size={11} /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => coverInputRef.current?.click()}
                  className="flex flex-col items-center justify-center cursor-pointer w-full h-full text-center py-4 focus:outline-none disabled:opacity-50"
                >
                  <div className="rounded-full bg-slate-100 p-3 text-slate-500 mb-2">
                    <ImageIcon size={22} />
                  </div>
                  <span className="text-xs font-medium text-[#0F172A]">
                    Click to upload Cover
                  </span>
                  <span className="text-[11px] text-[#94A3B8] mt-0.5">
                    PNG, JPG, or WebP up to 7.5 MiB
                  </span>
                </button>
              )}
            </div>
            {fieldErrors.coverImage && (
              <p id="cover-error" role="alert" className="text-xs text-red-600 flex items-center gap-1 mt-0.5">
                <AlertCircle size={12} className="shrink-0" />
                <span>{fieldErrors.coverImage}</span>
              </p>
            )}
          </div>

          {/* PDF File Upload Area */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="pdfFileInput"
              className="text-xs font-semibold text-[#475569] uppercase tracking-wider"
            >
              Issue PDF (.pdf) <span className="text-red-500">*</span>
            </label>
            <div
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 transition-colors min-h-[190px] ${
                fieldErrors.pdfFile
                  ? "border-red-400 bg-red-50/20"
                  : pdfFile
                  ? "border-[#059669] bg-[#ECFDF5]/30"
                  : "border-[#CBD5E1] bg-white hover:border-[#94A3B8]"
              }`}
            >
              {pdfFile ? (
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="rounded-full bg-[#059669]/10 p-3 text-[#059669]">
                    <FileText size={24} />
                  </div>
                  <span className="text-xs font-medium text-[#0F172A] max-w-[200px] truncate">
                    {pdfFile.name}
                  </span>
                  <span className="text-[11px] text-[#64748B]">
                    {formatFileSize(pdfFile.size)} / 7.5 MiB
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => pdfInputRef.current?.click()}
                      className="text-xs text-[#059669] hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw size={11} /> Change
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={handleRemovePdf}
                      className="text-xs text-red-600 hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <X size={11} /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => pdfInputRef.current?.click()}
                  className="flex flex-col items-center justify-center cursor-pointer w-full h-full text-center py-4 focus:outline-none disabled:opacity-50"
                >
                  <div className="rounded-full bg-slate-100 p-3 text-slate-500 mb-2">
                    <UploadCloud size={22} />
                  </div>
                  <span className="text-xs font-medium text-[#0F172A]">
                    Click to upload PDF
                  </span>
                  <span className="text-[11px] text-[#94A3B8] mt-0.5">
                    PDF document up to 7.5 MiB
                  </span>
                </button>
              )}
            </div>
            {fieldErrors.pdfFile && (
              <p id="pdf-error" role="alert" className="text-xs text-red-600 flex items-center gap-1 mt-0.5">
                <AlertCircle size={12} className="shrink-0" />
                <span>{fieldErrors.pdfFile}</span>
              </p>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title-input" className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
            Issue Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title-input"
            name="title"
            required
            disabled={isPending}
            aria-invalid={!!fieldErrors.title}
            aria-describedby={fieldErrors.title ? "title-error" : undefined}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: undefined }));
            }}
            placeholder="e.g. The Architecture of Silence"
            className={`rounded-lg border bg-white px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-1 ${
              fieldErrors.title
                ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                : "border-[#CBD5E1] focus:border-[#059669] focus:ring-[#059669]"
            }`}
          />
          {fieldErrors.title && (
            <p id="title-error" role="alert" className="text-xs text-red-600 flex items-center gap-1 mt-0.5">
              <AlertCircle size={12} className="shrink-0" />
              <span>{fieldErrors.title}</span>
            </p>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="description-input" className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description-input"
            name="description"
            required
            disabled={isPending}
            aria-invalid={!!fieldErrors.description}
            aria-describedby={fieldErrors.description ? "description-error" : undefined}
            rows={4}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (fieldErrors.description) setFieldErrors((prev) => ({ ...prev, description: undefined }));
            }}
            placeholder="A short summary of what this issue covers…"
            className={`resize-y rounded-lg border bg-white px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-1 ${
              fieldErrors.description
                ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                : "border-[#CBD5E1] focus:border-[#059669] focus:ring-[#059669]"
            }`}
          />
          {fieldErrors.description && (
            <p id="description-error" role="alert" className="text-xs text-red-600 flex items-center gap-1 mt-0.5">
              <AlertCircle size={12} className="shrink-0" />
              <span>{fieldErrors.description}</span>
            </p>
          )}
        </div>

        {/* Month & Year Picker */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="month-select" className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
              Publication Month <span className="text-red-500">*</span>
            </label>
            <select
              id="month-select"
              name="month"
              disabled={isPending}
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                if (fieldErrors.month) setFieldErrors((prev) => ({ ...prev, month: undefined }));
              }}
              className="rounded-lg border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] focus:border-[#059669] focus:outline-none focus:ring-1 focus:ring-[#059669]"
            >
              {MONTHS.map((m, i) => {
                const val = String(i + 1).padStart(2, "0");
                return (
                  <option key={m} value={val}>
                    {m}
                  </option>
                );
              })}
            </select>
            {fieldErrors.month && (
              <p id="month-error" role="alert" className="text-xs text-red-600 flex items-center gap-1 mt-0.5">
                <AlertCircle size={12} className="shrink-0" />
                <span>{fieldErrors.month}</span>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="year-input" className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
              Publication Year <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="year-input"
              name="year"
              required
              disabled={isPending}
              placeholder="eg: 2026"
              value={year}
              aria-invalid={!!fieldErrors.year}
              aria-describedby={fieldErrors.year ? "year-error" : undefined}
              onChange={(e) => {
                setYear(e.target.value);
                if (fieldErrors.year) setFieldErrors((prev) => ({ ...prev, year: undefined }));
              }}
              className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 ${
                fieldErrors.year
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                  : "border-[#CBD5E1] focus:border-[#059669] focus:ring-[#059669]"
              }`}
            />
            {fieldErrors.year && (
              <p id="year-error" role="alert" className="text-xs text-red-600 flex items-center gap-1 mt-0.5">
                <AlertCircle size={12} className="shrink-0" />
                <span>{fieldErrors.year}</span>
              </p>
            )}
          </div>
        </div>

        {/* Draft toggle */}
        <div className="flex items-center justify-between rounded-lg border border-[#E2E8F0] bg-white p-4">
          <div>
            <p className="text-sm font-medium text-[#0F172A]">Save as Draft</p>
            <p className="text-xs text-[#64748B]">
              Drafts are not visible to public readers until published.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isDraft}
            disabled={isPending}
            onClick={() => setIsDraft(!isDraft)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#059669] ${
              isDraft ? "bg-[#059669]" : "bg-slate-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isDraft ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Upload Progress Bar */}
        {isPending && (
          <div className="flex flex-col gap-2 rounded-lg bg-slate-50 border border-slate-200 p-4 animate-fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#0F172A] flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#059669]" />
                {uploadStatus || "Uploading..."}
              </span>
              <span className="text-[#64748B] font-semibold">{uploadPercent}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-[#059669] transition-all duration-300 ease-out"
                style={{ width: `${uploadPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
          <Link
            href="/admin/issues/manage"
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-[#64748B] hover:bg-slate-100 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!canSubmit}
            className={`inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-all ${
              canSubmit
                ? "bg-[#059669] hover:bg-[#047857] shadow-sm hover:scale-[1.01] cursor-pointer"
                : "bg-slate-300 cursor-not-allowed opacity-70"
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading & Saving...</span>
              </>
            ) : isDraft ? (
              "Save as Draft"
            ) : (
              "Publish Issue"
            )}
          </button>
        </div>
      </form>

      {/* Success Toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-[#0F172A] px-4 py-3 text-sm text-white shadow-xl animate-fade-in"
        >
          <Check className="h-4 w-4 text-[#4ADE80]" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
