"use client";

import { useActionState, useEffect, useState, useRef } from "react";
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
import { createIssue, type CreateIssueState } from "@/app/admin/issues/new/action";

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
const YEARS = Array.from({ length: 15 }, (_, i) => currentYear - 5 + i);

const initialState: CreateIssueState = {};

export function AddIssueForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createIssue, initialState);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [month, setMonth] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));
  const [year, setYear] = useState(String(currentYear));
  const [isDraft, setIsDraft] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (coverImage) {
      const url = URL.createObjectURL(coverImage);
      setCoverPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setCoverPreview(null);
    }
  }, [coverImage]);

  useEffect(() => {
    if (state.success) {
      setToast(isDraft ? "Saved as draft" : "Issue published successfully!");
      setCoverImage(null);
      setPdfFile(null);
      if (coverInputRef.current) coverInputRef.current.value = "";
      if (pdfInputRef.current) pdfInputRef.current.value = "";
      setTitle("");
      setDescription("");
      const t = setTimeout(() => {
        router.push("/admin/issues/manage");
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [state.success, isDraft, router]);

  function handleRemoveCover() {
    setCoverImage(null);
    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  }

  function handleRemovePdf() {
    setPdfFile(null);
    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }
  }

  const canSubmit =
    title.trim() &&
    description.trim() &&
    month &&
    year &&
    coverImage &&
    pdfFile &&
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
          Upload the issue cover, publication PDF, and metadata.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-6">
        {state.error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{state.error}</span>
          </div>
        )}

        {/* Hidden inputs for state managed values */}
        <input type="hidden" name="isDraft" value={String(isDraft)} />

        {/* ALWAYS-MOUNTED FILE INPUTS */}
        <input
          ref={coverInputRef}
          type="file"
          name="coverImage"
          accept="image/png"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setCoverImage(file);
          }}
        />

        <input
          ref={pdfInputRef}
          type="file"
          name="pdfFile"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setPdfFile(file);
          }}
        />

        {/* Uploads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cover Image Upload Area */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
              Cover Image (.png) <span className="text-red-500">*</span>
            </label>
            <div
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 transition-colors min-h-[190px] ${coverImage
                  ? "border-[#059669] bg-[#ECFDF5]/30"
                  : "border-[#CBD5E1] bg-white hover:border-[#94A3B8]"
                }`}
            >
              {coverPreview ? (
                <div className="relative flex flex-col items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="h-28 w-20 rounded object-cover shadow border border-slate-200"
                  />
                  <span className="text-xs font-medium text-[#0F172A] max-w-[180px] truncate">
                    {coverImage?.name}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="text-xs text-[#059669] hover:underline inline-flex items-center gap-1"
                    >
                      <RefreshCw size={11} /> Change
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={handleRemoveCover}
                      className="text-xs text-red-600 hover:underline inline-flex items-center gap-1"
                    >
                      <X size={11} /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="flex flex-col items-center justify-center cursor-pointer w-full h-full text-center py-4 focus:outline-none"
                >
                  <div className="rounded-full bg-slate-100 p-3 text-slate-500 mb-2">
                    <ImageIcon size={22} />
                  </div>
                  <span className="text-xs font-medium text-[#0F172A]">
                    Click to upload Cover
                  </span>
                  <span className="text-[11px] text-[#94A3B8] mt-0.5">
                    PNG format only
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* PDF File Upload Area */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
              Issue PDF (.pdf) <span className="text-red-500">*</span>
            </label>
            <div
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 transition-colors min-h-[190px] ${pdfFile
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
                    {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => pdfInputRef.current?.click()}
                      className="text-xs text-[#059669] hover:underline inline-flex items-center gap-1"
                    >
                      <RefreshCw size={11} /> Change
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={handleRemovePdf}
                      className="text-xs text-red-600 hover:underline inline-flex items-center gap-1"
                    >
                      <X size={11} /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  className="flex flex-col items-center justify-center cursor-pointer w-full h-full text-center py-4 focus:outline-none"
                >
                  <div className="rounded-full bg-slate-100 p-3 text-slate-500 mb-2">
                    <UploadCloud size={22} />
                  </div>
                  <span className="text-xs font-medium text-[#0F172A]">
                    Click to upload PDF
                  </span>
                  <span className="text-[11px] text-[#94A3B8] mt-0.5">
                    PDF document only
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
            Issue Title <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. The Architecture of Silence"
            className="rounded-lg border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#059669] focus:outline-none focus:ring-1 focus:ring-[#059669]"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short summary of what this issue covers…"
            className="resize-y rounded-lg border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#059669] focus:outline-none focus:ring-1 focus:ring-[#059669]"
          />
        </div>

        {/* Month & Year Picker */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
              Publication Month <span className="text-red-500">*</span>
            </label>
            <select
              name="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
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
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
              Publication Year <span className="text-red-500">*</span>
            </label>
            <select
              name="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="rounded-lg border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] focus:border-[#059669] focus:outline-none focus:ring-1 focus:ring-[#059669]"
            >
              {YEARS.map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </select>
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
            onClick={() => setIsDraft(!isDraft)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#059669] ${isDraft ? "bg-[#059669]" : "bg-slate-200"
              }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isDraft ? "translate-x-5" : "translate-x-0"
                }`}
            />
          </button>
        </div>

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
            className={`inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-all ${canSubmit
                ? "bg-[#059669] hover:bg-[#047857] shadow-sm hover:scale-[1.01]"
                : "bg-slate-300 cursor-not-allowed opacity-70"
              }`}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading & Saving...
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
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-[#0F172A] px-4 py-3 text-sm text-white shadow-xl animate-fade-in">
          <Check className="h-4 w-4 text-[#4ADE80]" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
