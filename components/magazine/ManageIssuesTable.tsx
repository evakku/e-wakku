"use client";

import { useState, useTransition, useActionState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Pencil,
  Trash2,
  BookOpen,
  EyeOff,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Check,
  X,
  ImageOff,
  Search,
  ExternalLink,
  Loader2,
  FileText,
  Upload,
} from "lucide-react";
import {
  deleteIssue,
  toggleDraftStatus,
  updateIssue,
  type Issue,
  type UpdateIssueState,
} from "@/app/admin/issues/manage/actions";

// ─── Month label helper ───────────────────────────────────────────────────────

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

function monthLabel(m: string) {
  const idx = parseInt(m, 10);
  return Number.isFinite(idx) && idx >= 1 && idx <= 12 ? MONTHS[idx - 1] : m;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  issues: Issue[];
  total: number;
  page: number;
  pageSize: number;
  currentSearch?: string;
  currentStatus?: "all" | "published" | "draft";
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({
  issue,
  onClose,
  onSuccess,
}: {
  issue: Issue;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
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

  useEffect(() => {
    if (newCover) {
      const url = URL.createObjectURL(newCover);
      setCoverPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setCoverPreview(null);
    }
  }, [newCover]);

  useEffect(() => {
    if (state.success) {
      onSuccess(state.message || "Issue updated successfully!");
      onClose();
    }
  }, [state.success, state.message, onClose, onSuccess]);

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
            className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F0F2F4] hover:text-[#0F172A] transition-colors"
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
                <span className="text-xs text-[#64748B] font-medium">Cover Image (.png)</span>
                <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F172A] hover:border-[#059669]">
                  <Upload size={14} className="text-[#059669] shrink-0" />
                  <span className="truncate">
                    {newCover ? newCover.name : "Replace Cover..."}
                  </span>
                  <input
                    type="file"
                    name="coverImage"
                    accept="image/png"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setNewCover(f);
                    }}
                  />
                </label>
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
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setNewPdf(f);
                    }}
                  />
                </label>
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
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#64748B] hover:bg-[#F0F2F4] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium bg-[#059669] text-white hover:bg-[#047857] disabled:opacity-60 transition-all shadow-sm"
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

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

function DeleteDialog({
  issue,
  onClose,
  onSuccess,
}: {
  issue: Issue;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

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
            className="rounded-lg px-4 py-2 text-sm font-medium text-[#64748B] hover:bg-[#F0F2F4] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition-all shadow-sm"
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

// ─── Issue Row ────────────────────────────────────────────────────────────────

function IssueRow({
  issue,
  onEdit,
  onDelete,
  onToast,
}: {
  issue: Issue;
  onEdit: () => void;
  onDelete: () => void;
  onToast: (msg: string) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const res = await toggleDraftStatus(issue.id, issue.is_draft);
      if (res.success) {
        onToast(res.message || (issue.is_draft ? "Published successfully" : "Moved to draft"));
        router.refresh();
      } else if (res.error) {
        onToast(`Error: ${res.error}`);
      }
    });
  }

  const dateLabel = issue.published_at
    ? new Date(issue.published_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : `${monthLabel(issue.month)} ${issue.year}`;

  return (
    <tr className="group hover:bg-[#F8FAFC] transition-colors">
      {/* Cover */}
      <td className="py-3.5 px-5 w-[80px]">
        <div className="w-14 h-[72px] rounded-lg overflow-hidden bg-[#F0F2F4] border border-[#E2E8F0] flex items-center justify-center shrink-0 shadow-sm relative">
          {issue.cover_image_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={issue.cover_image_url}
              alt={`Cover: ${issue.title}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <ImageOff size={16} className="text-[#94A3B8]" />
          )}
        </div>
      </td>

      {/* Details */}
      <td className="py-3.5 px-5">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-[#0F172A] leading-snug line-clamp-1">
            {issue.title}
          </p>
          {issue.pdf_url && (
            <a
              href={issue.pdf_url}
              target="_blank"
              rel="noreferrer"
              title="Open publication PDF"
              className="text-[#64748B] hover:text-[#059669] transition-colors"
            >
              <ExternalLink size={13} />
            </a>
          )}
        </div>
        <p className="text-xs text-[#059669] font-medium mt-0.5">
          {monthLabel(issue.month)} {issue.year}
        </p>
        {issue.description && (
          <p className="text-xs text-[#64748B] mt-1 line-clamp-2 max-w-md">
            {issue.description}
          </p>
        )}
      </td>

      {/* Status Badge */}
      <td className="py-3.5 px-5 whitespace-nowrap">
        <span
          className={[
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
            issue.is_draft
              ? "bg-slate-100 text-slate-700 border-slate-200"
              : "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]",
          ].join(" ")}
        >
          {issue.is_draft ? (
            <EyeOff size={11} />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
          )}
          {issue.is_draft ? "Draft" : "Published"}
        </span>
      </td>

      {/* Date */}
      <td className="py-3.5 px-5 whitespace-nowrap text-xs text-[#64748B]">
        {issue.is_draft ? "—" : dateLabel}
      </td>

      {/* Actions */}
      <td className="py-3.5 px-5 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
          {/* Toggle draft/publish */}
          <button
            type="button"
            onClick={handleToggle}
            disabled={isPending}
            title={issue.is_draft ? "Publish issue" : "Move to draft"}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-[#64748B] hover:bg-[#F0F2F4] hover:text-[#059669] transition-colors disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 size={14} className="animate-spin text-[#059669]" />
            ) : issue.is_draft ? (
              <Eye size={15} />
            ) : (
              <EyeOff size={15} />
            )}
          </button>

          {/* Edit */}
          <button
            type="button"
            onClick={onEdit}
            title="Edit issue"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-[#64748B] hover:bg-[#F0F2F4] hover:text-[#0F172A] transition-colors"
          >
            <Pencil size={15} />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={onDelete}
            title="Delete issue"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-[#64748B] hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Table Component ─────────────────────────────────────────────────────

export function ManageIssuesTable({
  issues,
  total,
  page,
  pageSize,
  currentSearch = "",
  currentStatus = "all",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [editTarget, setEditTarget] = useState<Issue | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Issue | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(currentSearch);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  function showToast(msg: string) {
    setToastMessage(msg);
    router.refresh();
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  }

  function updateQuery(newParams: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === null || v === "") {
        params.delete(k);
      } else {
        params.set(k, v);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateQuery({ search: searchInput.trim() || null, page: "1" });
  }

  return (
    <>
      {/* Modals */}
      {editTarget && (
        <EditModal
          issue={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={showToast}
        />
      )}
      {deleteTarget && (
        <DeleteDialog
          issue={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={showToast}
        />
      )}

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-[#0F172A] px-4 py-3 text-sm text-white shadow-2xl animate-fade-in border border-slate-700">
          <Check size={16} className="text-[#4ADE80] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-sm">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(
            [
              { label: "All Issues", value: "all" },
              { label: "Published", value: "published" },
              { label: "Drafts", value: "draft" },
            ] as const
          ).map((tab) => {
            const active = currentStatus === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() =>
                  updateQuery({
                    status: tab.value === "all" ? null : tab.value,
                    page: "1",
                  })
                }
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "bg-[#059669] text-white"
                    : "text-[#64748B] hover:bg-[#F0F2F4] hover:text-[#0F172A]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative w-full sm:w-72"
        >
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search issues by title..."
            className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-1.5 pl-8 pr-8 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:border-[#059669] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#059669]"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                updateQuery({ search: null, page: "1" });
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A]"
            >
              <X size={12} />
            </button>
          )}
        </form>
      </div>

      {/* Table card */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden shadow-sm">
        {issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <BookOpen size={44} className="text-[#CBD5E1] mb-3" />
            <p className="text-sm font-semibold text-[#0F172A]">No issues found</p>
            <p className="text-xs text-[#94A3B8] mt-1 max-w-sm">
              {currentSearch
                ? `No issues match the search query "${currentSearch}".`
                : "No magazine issues are available in this view."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="py-3 px-5 text-xs font-semibold text-[#64748B] uppercase tracking-wider w-[80px]">
                    Cover
                  </th>
                  <th className="py-3 px-5 text-xs font-semibold text-[#64748B] uppercase tracking-wider min-w-[280px]">
                    Issue Details
                  </th>
                  <th className="py-3 px-5 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-5 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                    Date
                  </th>
                  <th className="py-3 px-5 text-xs font-semibold text-[#64748B] uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F4]">
                {issues.map((issue) => (
                  <IssueRow
                    key={issue.id}
                    issue={issue}
                    onEdit={() => setEditTarget(issue)}
                    onDelete={() => setDeleteTarget(issue)}
                    onToast={showToast}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {total > 0 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#E2E8F0] bg-[#F8FAFC]">
            <p className="text-xs text-[#64748B]">
              Showing{" "}
              <span className="font-semibold text-[#0F172A]">
                {start}–{end}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[#0F172A]">{total}</span>{" "}
              issues
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => updateQuery({ page: String(page - 1) })}
                disabled={page <= 1}
                className={[
                  "flex items-center justify-center w-8 h-8 rounded-lg text-[#64748B] border border-[#E2E8F0] transition-colors",
                  page <= 1
                    ? "opacity-40 pointer-events-none"
                    : "hover:bg-white hover:border-[#CBD5E1] hover:text-[#0F172A]",
                ].join(" ")}
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => updateQuery({ page: String(p) })}
                  className={[
                    "flex items-center justify-center w-8 h-8 rounded-lg text-xs font-medium border transition-colors",
                    p === page
                      ? "bg-[#059669] text-white border-[#059669]"
                      : "text-[#64748B] border-[#E2E8F0] hover:bg-white hover:border-[#CBD5E1] hover:text-[#0F172A]",
                  ].join(" ")}
                  aria-label={`Page ${p}`}
                  aria-current={p === page ? "page" : undefined}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                onClick={() => updateQuery({ page: String(page + 1) })}
                disabled={page >= totalPages}
                className={[
                  "flex items-center justify-center w-8 h-8 rounded-lg text-[#64748B] border border-[#E2E8F0] transition-colors",
                  page >= totalPages
                    ? "opacity-40 pointer-events-none"
                    : "hover:bg-white hover:border-[#CBD5E1] hover:text-[#0F172A]",
                ].join(" ")}
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
