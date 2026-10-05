"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Inbox, Check, AlertTriangle } from "lucide-react";
import type { ContactEnquiry } from "@/lib/queries/enquiries";
import { deleteEnquiry, toggleEnquiryReadStatus } from "@/app/actions/enquiry";
import EnquiryDetailsModal from "./enquiries/EnquiryDetailsModal";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function RecentEnquiries({
  initialEnquiries,
  totalCount,
}: {
  initialEnquiries: ContactEnquiry[];
  totalCount: number;
}) {
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [selectedEnquiry, setSelectedEnquiry] = useState<ContactEnquiry | null>(null);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleRead = async (id: string, isRead: boolean) => {
    setEnquiries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, is_read: isRead } : e))
    );
    if (selectedEnquiry && selectedEnquiry.id === id) {
      setSelectedEnquiry((prev) => (prev ? { ...prev, is_read: isRead } : null));
    }

    const result = await toggleEnquiryReadStatus(id, isRead);
    if (!result.success) {
      setEnquiries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, is_read: !isRead } : e))
      );
      if (selectedEnquiry && selectedEnquiry.id === id) {
        setSelectedEnquiry((prev) => (prev ? { ...prev, is_read: !isRead } : null));
      }
      showToast(result.message ?? "Failed to update read status.", "error");
    }
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

  return (
    <>
      {/* ── Toast ─────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={[
            "fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in border bg-white",
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

      {/* ── Details Card Modal ──────────────────────────────────────── */}
      <EnquiryDetailsModal
        enquiry={selectedEnquiry}
        isOpen={selectedEnquiry !== null}
        onClose={() => setSelectedEnquiry(null)}
        onToggleRead={handleToggleRead}
        onDelete={handleDeleteFromModal}
      />

      <div className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
              <Mail size={18} />
            </div>
            <div>
              <h3 className="font-heading text-base font-semibold text-[#0F172A]">
                Recent Enquiries
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Latest messages from the public contact form.
              </p>
            </div>
          </div>
          <Link
            href="/admin/enquiries"
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors"
          >
            View All ({totalCount})
            <ArrowRight size={14} />
          </Link>
        </div>

        {enquiries.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <Inbox size={32} className="text-[#CBD5E1] mb-2" />
            <p className="text-sm font-medium text-[#0F172A]">No enquiries yet</p>
            <p className="text-xs text-[#64748B] mt-1">
              Messages from the Contact page will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {enquiries.map((enquiry) => (
              <div
                key={enquiry.id}
                onClick={() => setSelectedEnquiry(enquiry)}
                className={`flex items-start gap-4 px-6 py-4 hover:bg-[#F8FAFC]/80 transition-colors cursor-pointer relative ${
                  !enquiry.is_read ? "bg-sky-50/10" : ""
                }`}
              >
                <div className="relative shrink-0">
                  <div className="flex size-9 items-center justify-center rounded-full bg-sky-100 text-sky-700 font-semibold text-sm shrink-0">
                    {enquiry.name.charAt(0).toUpperCase()}
                  </div>
                  {!enquiry.is_read && (
                    <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-sky-500 border-2 border-white animate-pulse" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm text-[#0F172A] ${
                        !enquiry.is_read ? "font-bold text-sky-950" : "font-medium"
                      }`}
                    >
                      {enquiry.name}
                    </span>
                    <span className="text-xs text-[#94A3B8] shrink-0">
                      {formatDate(enquiry.created_at)}
                    </span>
                  </div>
                  <a
                    href={`mailto:${enquiry.email}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-sky-600 hover:underline"
                  >
                    {enquiry.email}
                  </a>
                  <p
                    className={`mt-1 text-xs leading-relaxed line-clamp-2 ${
                      !enquiry.is_read ? "text-[#0F172A] font-medium" : "text-[#64748B]"
                    }`}
                  >
                    {enquiry.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
