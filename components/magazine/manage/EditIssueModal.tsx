"use client";

import { useState, useActionState, useEffect, startTransition } from "react";
import { X, AlertCircle, Upload, FileText, ExternalLink, Loader2 } from "lucide-react";
import {
  updateIssue,
  type Issue,
  type UpdateIssueState,
} from "@/app/admin/issues/manage/actions";
import {
  validateCoverImageFile,
  validatePdfDocumentFile,
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
const YEARS = Array.from({ length: 15 }, (_, i) => currentYear - 5 + i);

interface EditIssueModalProps {
  issue: Issue;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export function EditIssueModal({
  issue,
  onClose,
  onSuccess,
}: EditIssueModalProps) {
  const [state, formAction, isPending] = useActionState<UpdateIssueState, FormData>(
    updateIssue,
    {}
  );

  const [title, setTitle] = useState(issue.title);
  const [description, setDescription] = useState(issue.description);
  const [month, setMonth] = useState(issue.month);
  const [year, setYear] = useState(String(issue.year));
  const [isDraft, setIsDraft] = useState(issue.is_draft);
  const [newCover, setNewCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [newPdf, setNewPdf] = useState<File | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Close modal on Escape key press (WCAG 2.2 AA)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (newCover) {
      const url = URL.createObjectURL(newCover);
      startTransition(() => setCoverPreview(url));
      return () => URL.revokeObjectURL(url);
    } else {
      startTransition(() => setCoverPreview(null));
    }
  }, [newCover]);

  useEffect(() => {
    if (state.success) {
      onSuccess(state.message || "Issue updated successfully!");
      onClose();
    }
  }, [state.success, state.message, onClose, onSuccess]);

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const validation = await validateCoverImageFile(f);
    if (!validation.valid) {
      setCoverError(validation.error || "Please select a supported cover image format.");
      setNewCover(null);
      e.target.value = "";
      return;
    }
    setCoverError(null);
    setNewCover(f);
  }

  async function handlePdfChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const validation = await validatePdfDocumentFile(f);
    if (!validation.valid) {
      setPdfError(validation.error || "Please select a valid PDF file.");
      setNewPdf(null);
      e.target.value = "";
      return;
    }
    setPdfError(null);
    setNewPdf(f);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-label="Edit issue"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-[#E2E8F0] animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E2E8F0] bg-white px-6 py-4">
          <div>
            <h2 className="font-heading text-lg font-semibold text-[#0F172A]">
              Edit Issue Details
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Update issue information or replace uploaded files.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F0F2F4] hover:text-[#0F172A] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form action={formAction} className="px-6 py-5 flex flex-col gap-5">
          <input type="hidden" name="id" value={issue.id} />
          <input type="hidden" name="isDraft" value={String(isDraft)} />

          {state.error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{state.error}</span>
            </div>
          )}

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-lg border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#059669]"
              placeholder="Issue title"
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
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-y rounded-lg border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#059669]"
              placeholder="Short summary of the issue…"
            />
          </div>

          {/* Month + Year */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
                Month <span className="text-red-500">*</span>
              </label>
              <select
                name="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="rounded-lg border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#059669]"
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
                Year <span className="text-red-500">*</span>
              </label>
              <select
                name="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="rounded-lg border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#059669]"
              >
                {YEARS.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional File Replacements */}
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 flex flex-col gap-4">
            <p className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
              File Replacements (Optional)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Replace Cover */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-[#64748B] font-medium">Cover Image (.png, .jpg, .webp)</span>
                <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F172A] hover:border-[#059669]">
                  <Upload size={14} className="text-[#059669] shrink-0" />
                  <span className="truncate">
                    {newCover ? newCover.name : "Replace Cover..."}
                  </span>
                  <input
                    type="file"
                    name="coverImage"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleCoverChange}
                  />
                </label>
                {coverError && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-0.5">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{coverError}</span>
                  </p>
                )}
                {coverPreview && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={coverPreview}
                    alt="New cover preview"
                    className="h-16 w-12 rounded object-cover border border-slate-200 mt-1"
                  />
                )}
              </div>

              {/* Replace PDF */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-[#64748B] font-medium">Magazine PDF (.pdf)</span>
                <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F172A] hover:border-[#059669]">
                  <FileText size={14} className="text-[#059669] shrink-0" />
                  <span className="truncate">
                    {newPdf ? newPdf.name : "Replace PDF..."}
                  </span>
                  <input
                    type="file"
                    name="pdfFile"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handlePdfChange}
                  />
                </label>
                {pdfError && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-0.5">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{pdfError}</span>
                  </p>
                )}
                {issue.pdf_url && !newPdf && (
                  <a
                    href={issue.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#059669] hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    <ExternalLink size={10} /> View current PDF
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Draft Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-white p-3.5">
            <div>
              <p className="text-xs font-semibold text-[#0F172A]">Save as Draft</p>
              <p className="text-[11px] text-[#64748B]">
                {isDraft ? "Draft — hidden from public issues" : "Published — visible to readers"}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isDraft}
              onClick={() => setIsDraft(!isDraft)}
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isDraft ? "bg-[#059669]" : "bg-slate-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isDraft ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#64748B] hover:bg-[#F0F2F4] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium bg-[#059669] text-white hover:bg-[#047857] disabled:opacity-60 transition-all shadow-sm cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
