"use client";

import { useState, useTransition } from "react";
import { Mail, Trash2, Copy, Check, X, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { deleteEnquiry, toggleEnquiryReadStatus } from "@/app/actions/enquiry";
import type { ContactEnquiry } from "@/lib/queries/enquiries";
import EnquiryDetailsModal from "./EnquiryDetailsModal";

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

/* ─── Delete Confirm Modal ──────────────────────────────────────────────── */

function DeleteModal({
  name,
  onConfirm,
  onCancel,
  isPending,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-[#E2E8F0] p-6 animate-fade-in">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-base font-semibold text-[#0F172A]">
              Delete enquiry?
            </h3>
            <p className="mt-1 text-sm text-[#64748B]">
              The message from <span className="font-medium text-[#0F172A]">{name}</span> will be permanently deleted. This cannot be undone.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-[#94A3B8] hover:text-[#64748B] transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC] border border-[#E2E8F0] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {isPending ? (
              <span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            {isPending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Row Actions ───────────────────────────────────────────────────────── */

function EnquiryRow({
  enquiry,
  onDelete,
  onRowClick,
  onToggleRead,
}: {
  enquiry: ContactEnquiry;
  onDelete: (id: string, name: string) => void;
  onRowClick: () => void;
  onToggleRead: (id: string, isRead: boolean) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(enquiry.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing
    }
  };

  return (
    <tr
      onClick={onRowClick}
      className={`hover:bg-[#F8FAFC]/80 transition-colors group cursor-pointer ${
        !enquiry.is_read ? "bg-sky-50/20" : ""
      }`}
    >
      {/* Sender */}
      <td className="py-4 px-6 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex size-9 items-center justify-center rounded-full bg-sky-100 text-sky-700 font-semibold text-sm shrink-0">
              {enquiry.name.charAt(0).toUpperCase()}
            </div>
            {!enquiry.is_read && (
              <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-sky-500 border-2 border-white animate-pulse" />
            )}
          </div>
          <span
            className={`text-sm text-[#0F172A] ${
              !enquiry.is_read ? "font-bold text-sky-950" : "font-medium"
            }`}
          >
            {enquiry.name}
          </span>
        </div>
      </td>

      {/* Email */}
      <td className="py-4 px-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <a
            href={`mailto:${enquiry.email}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-sky-600 hover:text-sky-700 hover:underline"
          >
            {enquiry.email}
          </a>
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyEmail();
            }}
            title="Copy email"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-[#94A3B8] hover:text-[#64748B]"
          >
            {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
          </button>
        </div>
      </td>

      {/* Message */}
      <td className="py-4 px-4 max-w-sm">
        <p
          className={[
            "text-xs leading-relaxed",
            !enquiry.is_read ? "text-[#0F172A] font-semibold" : "text-[#64748B]",
            expanded ? "" : "line-clamp-2",
          ].join(" ")}
          onClick={(e) => {
            // Expand message locally without opening modal
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          title={expanded ? "Click to collapse" : "Click to expand"}
        >
          {enquiry.message}
        </p>
        {enquiry.message.length > 120 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="mt-0.5 text-[11px] text-sky-500 hover:text-sky-700 font-medium"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </td>

      {/* Date */}
      <td className="py-4 px-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span
            className={`text-xs text-[#0F172A] ${
              !enquiry.is_read ? "font-bold" : "font-medium"
            }`}
          >
            {formatDate(enquiry.created_at)}
          </span>
          <span className="text-[11px] text-[#94A3B8]">
            {formatTime(enquiry.created_at)}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="py-4 px-6 whitespace-nowrap">
        <div className="flex items-center justify-end gap-2">
          {/* Mark read / unread toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleRead(enquiry.id, !enquiry.is_read);
            }}
            title={enquiry.is_read ? "Mark as unread" : "Mark as read"}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {enquiry.is_read ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>

          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(enquiry.id, enquiry.name);
            }}
            title="Delete enquiry"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ─── Main Table Component ──────────────────────────────────────────────── */

export default function EnquiriesTable({
  initialEnquiries,
}: {
  initialEnquiries: ContactEnquiry[];
}) {
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState<ContactEnquiry | null>(null);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteRequest = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const { id, name } = deleteTarget;
    startTransition(async () => {
      const result = await deleteEnquiry(id);
      setDeleteTarget(null);
      if (result.success) {
        setEnquiries((prev) => prev.filter((e) => e.id !== id));
        showToast(`Enquiry from ${name} deleted.`, "success");
      } else {
        showToast(result.message ?? "Failed to delete.", "error");
      }
    });
  };

  const handleDeleteFromModal = async (id: string, name: string): Promise<boolean> => {
    return new Promise((resolve) => {
      startTransition(async () => {
        const result = await deleteEnquiry(id);
        if (result.success) {
          setEnquiries((prev) => prev.filter((e) => e.id !== id));
          showToast(`Enquiry from ${name} deleted.`, "success");
          resolve(true);
        } else {
          showToast(result.message ?? "Failed to delete.", "error");
          resolve(false);
        }
      });
    });
  };

  const handleToggleRead = async (id: string, isRead: boolean) => {
    // Optimistic UI update
    setEnquiries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, is_read: isRead } : e))
    );
    if (selectedEnquiry && selectedEnquiry.id === id) {
      setSelectedEnquiry((prev) => (prev ? { ...prev, is_read: isRead } : null));
    }

    const result = await toggleEnquiryReadStatus(id, isRead);
    if (!result.success) {
      // Revert status on failure
      setEnquiries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, is_read: !isRead } : e))
      );
      if (selectedEnquiry && selectedEnquiry.id === id) {
        setSelectedEnquiry((prev) => (prev ? { ...prev, is_read: !isRead } : null));
      }
      showToast(result.message ?? "Failed to update status.", "error");
    }
  };

  const handleRowClick = (enquiry: ContactEnquiry) => {
    setSelectedEnquiry(enquiry);
  };

  const unreadCount = enquiries.filter((e) => !e.is_read).length;

  return (
    <>
      {/* ── Toast ─────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={[
            "fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in border",
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200",
          ].join(" ")}
        >
          {toast.type === "success" ? (
            <Check size={15} className="text-emerald-600" />
          ) : (
            <AlertTriangle size={15} className="text-red-500" />
          )}
          {toast.message}
        </div>
      )}

      {/* ── Delete Modal ───────────────────────────────────────────── */}
      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          isPending={isPending}
        />
      )}

      {/* ── Details Card Modal ──────────────────────────────────────── */}
      <EnquiryDetailsModal
        enquiry={selectedEnquiry}
        isOpen={selectedEnquiry !== null}
        onClose={() => setSelectedEnquiry(null)}
        onToggleRead={handleToggleRead}
        onDelete={handleDeleteFromModal}
      />

      {/* ── Stats bar ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 text-xs text-[#64748B]">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-[#0F172A]">{enquiries.length}</span>
          {enquiries.length === 1 ? "message" : "messages"}
        </div>
        {unreadCount > 0 && (
          <div className="flex items-center gap-1 text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
            <span className="size-1.5 rounded-full bg-sky-500 animate-pulse" />
            <span className="font-semibold">{unreadCount}</span> unread
          </div>
        )}
      </div>

      {/* ── Table ─────────────────────────────────────────────────── */}
      <div className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E2E8F0]">
          <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
            <Mail size={18} />
          </div>
          <h3 className="font-heading text-base font-semibold text-[#0F172A]">
            All Contact Messages
          </h3>
        </div>

        {enquiries.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <Mail size={44} className="text-[#CBD5E1] mb-4" />
            <p className="text-base font-medium text-[#0F172A]">No enquiries</p>
            <p className="text-sm text-[#64748B] mt-1 max-w-sm">
              Messages submitted through the Contact page will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAFC] text-xs font-semibold text-[#64748B] border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3 px-6">Sender</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Message</th>
                  <th className="py-3 px-4">Received</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {enquiries.map((enquiry) => (
                  <EnquiryRow
                    key={enquiry.id}
                    enquiry={enquiry}
                    onDelete={handleDeleteRequest}
                    onRowClick={() => handleRowClick(enquiry)}
                    onToggleRead={handleToggleRead}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
