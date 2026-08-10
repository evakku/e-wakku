"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check } from "lucide-react";
import { createIssue, type CreateIssueState } from "@/app/admin/issues/new/action";
import { UploadZone } from "@/components/ui/upload-zone";
import { MonthYearPicker } from "@/components/ui/month-year-picker";
import { DraftToggle } from "@/components/ui/toggle-draft";

const initialState: CreateIssueState = {};
export function AddIssueForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createIssue, initialState);

  
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverError, setCoverError] = useState<string | undefined>();
  const [pdfError, setPdfError] = useState<string | undefined>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [isDraft, setIsDraft] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (state.success) {
      setToast(isDraft ? "Saved as draft" : "Issue published");
      setCoverImage(null);
      setPdfFile(null);
      setTitle("");
      setDescription("");
      setMonth("");
      setYear("");
      setIsDraft(false);
      const t = setTimeout(() => {setToast(null), router.push("/admin/issues")}, 3000);
      return () => clearTimeout(t);
    }
  }, [state.success]); // eslint-disable-line react-hooks/exhaustive-deps

  const canSubmit = title.trim() && description.trim() && month && year && coverImage && pdfFile && !isPending;

  return (
    <form action={formAction} className="animate-fade-in mx-auto w-full max-w-[720px]">
      <div className="pb-8">
        {state.error && (
          <div className="mb-6 flex items-center gap-2 rounded bg-error-container px-4 py-3 text-sm text-on-error-container">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {state.error}
          </div>
        )}

        <div className="flex flex-col gap-7">
          <div className="grid grid-cols-2 gap-5">
            <UploadZone
              name="coverImage"
              label="Cover image"
              kind="image"
              accept="image/png"
              acceptLabel=".png"
              file={coverImage}
              error={coverError}
              onFile={(f, err) => {
                setCoverImage(f);
                setCoverError(err ?? undefined);
              }}
            />
            <UploadZone
              name="pdfFile"
              label="PDF file"
              kind="pdf"
              accept="application/pdf"
              acceptLabel=".pdf"
              file={pdfFile}
              error={pdfError}
              onFile={(f, err) => {
                setPdfFile(f);
                setPdfError(err ?? undefined);
              }}
            />
          </div>

          <div>
          <label className="text-md font-semibold">
            Title <span className="text-red-500">*</span>
          </label>
            <input
              name="title"
              className="tj-input w-full border-2 border-gray-300 rounded-md p-2 text-sm"
              placeholder="e.g. The Quiet Issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-md font-semibold">Description <span className="text-red-500">*</span></label>
            <textarea
              name="description"
              className="tj-input resize-y leading-relaxed w-full border-2 border-gray-300 rounded-md p-2 text-sm"
              placeholder="A short summary of what this issue covers…"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* MonthYearPicker renders two <select name="month"> / <select name="year"> internally */}
          <MonthYearPicker month={month} year={year} onMonth={setMonth} onYear={setYear} />

          {/* DraftToggle renders a hidden <input name="isDraft"> internally */}
          <DraftToggle isDraft={isDraft} onChange={setIsDraft} />
        </div>
      </div>

      <div className="sticky bottom-0 -mx-4 flex justify-end gap-3 border-t border-surface-high bg-surface-lowest px-4 py-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <button
          type="button"
          className="rounded px-5 py-2.5 text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className={`rounded px-6 py-2.5 text-sm font-medium transition-all duration-250 hover:scale-[1.02] ${
            canSubmit
              ? "bg-accent text-accent-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
              : "cursor-not-allowed bg-surface-high text-outline"
          }`}
        >
          {isPending ? "Saving…" : isDraft ? "Save draft" : "Publish issue"}
        </button>
      </div>

      {toast && (
        <div className="animate-fade-in fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded bg-on-surface px-4.5 py-3 text-sm text-surface-lowest">
          <Check className="h-4 w-4 text-secondary-container" />
          {toast}
        </div>
      )}
    </form>
  );
}