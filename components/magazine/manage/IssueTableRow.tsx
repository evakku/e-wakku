"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Trash2,
  EyeOff,
  Eye,
  ImageOff,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { toggleDraftStatus, type Issue } from "@/app/admin/issues/manage/actions";

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

function monthLabel(m: string) {
  const idx = parseInt(m, 10);
  return Number.isFinite(idx) && idx >= 1 && idx <= 12 ? MONTHS[idx - 1] : m;
}

interface IssueTableRowProps {
  issue: Issue;
  onEdit: () => void;
  onDelete: () => void;
  onToast: (msg: string) => void;
}

export function IssueTableRow({
  issue,
  onEdit,
  onDelete,
  onToast,
}: IssueTableRowProps) {
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
            className="flex items-center justify-center w-8 h-8 rounded-lg text-[#64748B] hover:bg-[#F0F2F4] hover:text-[#059669] transition-colors disabled:opacity-50 cursor-pointer"
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
            className="flex items-center justify-center w-8 h-8 rounded-lg text-[#64748B] hover:bg-[#F0F2F4] hover:text-[#0F172A] transition-colors cursor-pointer"
          >
            <Pencil size={15} />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={onDelete}
            title="Delete issue"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-[#64748B] hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}
