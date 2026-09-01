"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Mail, Clock, Trash2, Check, EyeOff, Eye, Copy, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LabelCaps } from "@/src/components/ui/typography";
import type { ContactEnquiry } from "@/lib/queries/enquiries";

export type EnquiryDetailsModalProps = {
  enquiry: ContactEnquiry | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleRead: (id: string, isRead: boolean) => Promise<void>;
  onDelete: (id: string, name: string) => Promise<boolean>;
};

export default function EnquiryDetailsModal({
  enquiry,
  isOpen,
  onClose,
  onToggleRead,
  onDelete,
}: EnquiryDetailsModalProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [copied, setCopied] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingRead, setIsTogglingRead] = useState(false);

  // Automatically mark as read when opened
  useEffect(() => {
    if (isOpen && enquiry && !enquiry.is_read) {
      onToggleRead(enquiry.id, true);
    }
  }, [isOpen, enquiry, onToggleRead]);

  // Reset delete confirmation state when modal closes or changes enquiry
  useEffect(() => {
    if (!isOpen) {
      setIsConfirmingDelete(false);
      setIsDeleting(false);
      setIsTogglingRead(false);
    }
  }, [isOpen, enquiry]);

  if (!enquiry) return null;

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(enquiry.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleToggleReadStatus = async () => {
    setIsTogglingRead(true);
    try {
      await onToggleRead(enquiry.id, !enquiry.is_read);
    } finally {
      setIsTogglingRead(false);
    }
  };

  const handleDeleteClick = async () => {
    setIsDeleting(true);
    try {
      const success = await onDelete(enquiry.id, enquiry.name);
      if (success) {
        onClose();
      }
    } finally {
      setIsDeleting(false);
      setIsConfirmingDelete(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const backdropVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    initial: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.95, y: shouldReduceMotion ? 0 : 8 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.95, y: shouldReduceMotion ? 0 : 8 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/45 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-[640px] rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden"
          >
            {/* Header / Actions Banner */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-sky-50 text-sky-600">
                  <Mail size={16} />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Contact Enquiry
                </span>
                {enquiry.is_read ? (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    Read
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-sky-500 animate-pulse" />
                    Unread
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body (Styled like the ContactForm layout) */}
            <div className="p-8 md:p-10 flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
              {/* Date received metadata */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Clock size={13} />
                <span>Received {formatDate(enquiry.created_at)}</span>
              </div>

              {/* Name field */}
              <div className="flex flex-col gap-2">
                <LabelCaps className="text-slate-500 tracking-wider font-semibold">
                  Sender Name
                </LabelCaps>
                <div className="w-full rounded border border-transparent bg-slate-50 px-4 py-3 text-base text-slate-800 font-medium">
                  {enquiry.name}
                </div>
              </div>

              {/* Email address field */}
              <div className="flex flex-col gap-2">
                <LabelCaps className="text-slate-500 tracking-wider font-semibold">
                  Email Address
                </LabelCaps>
                <div className="flex items-center justify-between w-full rounded border border-transparent bg-slate-50 px-4 py-3 text-base">
                  <a
                    href={`mailto:${enquiry.email}`}
                    className="text-sky-600 hover:underline hover:text-sky-700 font-medium truncate"
                  >
                    {enquiry.email}
                  </a>
                  <button
                    onClick={copyEmail}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors ml-2 bg-white px-2 py-1 rounded border border-slate-100 shadow-sm"
                  >
                    {copied ? (
                      <>
                        <Check size={12} className="text-emerald-500" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Message text area field */}
              <div className="flex flex-col gap-2">
                <LabelCaps className="text-slate-500 tracking-wider font-semibold">
                  Message
                </LabelCaps>
                <div className="w-full rounded border border-transparent bg-slate-50 px-4 py-3.5 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap min-h-[140px] max-h-[220px] overflow-y-auto font-sans">
                  {enquiry.message}
                </div>
              </div>
            </div>

            {/* Bottom Actions Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              {/* Delete trigger / confirm flow */}
              {isConfirmingDelete ? (
                <div className="flex items-center gap-2 animate-fade-in">
                  <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertTriangle size={13} />
                    Confirm delete?
                  </span>
                  <Button
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white font-medium border-0 cursor-pointer rounded h-8"
                  >
                    {isDeleting ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Trash2 size={12} />
                    )}
                    Yes, Delete
                  </Button>
                  <Button
                    onClick={() => setIsConfirmingDelete(false)}
                    disabled={isDeleting}
                    variant="outline"
                    size="sm"
                    className="h-8"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsConfirmingDelete(true)}
                  variant="destructive"
                  size="sm"
                  className="gap-1.5 h-9"
                >
                  <Trash2 size={13} />
                  Delete Message
                </Button>
              )}

              {/* Read status & Close buttons */}
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  onClick={handleToggleReadStatus}
                  disabled={isTogglingRead}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-9"
                >
                  {isTogglingRead ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : enquiry.is_read ? (
                    <>
                      <EyeOff size={13} />
                      Mark Unread
                    </>
                  ) : (
                    <>
                      <Eye size={13} />
                      Mark Read
                    </>
                  )}
                </Button>
                <Button
                  onClick={onClose}
                  variant="secondary"
                  size="sm"
                  className="h-9 bg-slate-200 text-slate-700 hover:bg-slate-300 border-0 cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
