"use client";

import { useState, useTransition, useEffect } from "react";
import { Trash2, AlertCircle, Loader2 } from "lucide-react";
import { deleteIssue, type Issue } from "@/app/admin/issues/manage/actions";

interface DeleteConfirmDialogProps {
  issue: Issue;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export function DeleteConfirmDialog({
  issue,
  onClose,
  onSuccess,
}: DeleteConfirmDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Close dialog on Escape key press (WCAG 2.2 AA)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteIssue(issue.id);
      if (res.error) {
        setError(res.error);
      } else {
        onSuccess(res.message || "Issue deleted successfully");
        onClose();
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-label="Confirm delete"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl border border-[#E2E8F0] p-6 animate-fade-in">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <Trash2 size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-base font-semibold text-[#0F172A]">
              Delete this issue?
            </h3>
            <p className="mt-1.5 text-xs text-[#64748B] leading-relaxed">
              <strong className="text-[#0F172A]">&ldquo;{issue.title}&rdquo;</strong>{" "}
              will be permanently deleted from the database along with its cover image and PDF file.
            </p>
            {error && (
              <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={13} /> {error}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg px-4 py-2 text-sm font-medium text-[#64748B] hover:bg-[#F0F2F4] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition-all shadow-sm cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Deleting...
              </>
            ) : (
              "Confirm Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
