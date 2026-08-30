import type { Metadata } from "next";
import { Inbox, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getEnquiries } from "@/lib/queries/enquiries";
import EnquiriesTable from "./EnquiriesTable";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Enquiries | E-Wakku Admin",
  description: "All contact form submissions from readers.",
};

export default async function EnquiriesPage() {
  const enquiries = await getEnquiries();

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin"
              className="text-xs text-[#64748B] hover:text-[#0F172A] flex items-center gap-1 transition-colors"
            >
              <ArrowLeft size={13} />
              Dashboard
            </Link>
          </div>
          <h2 className="font-heading text-2xl font-semibold text-[#0F172A] tracking-tight">
            Enquiries
          </h2>
          <p className="mt-1 font-sans text-sm text-[#64748B]">
            All messages submitted through the public contact form.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-full border border-sky-200 self-start sm:self-auto">
          <Inbox size={14} />
          {enquiries.length} {enquiries.length === 1 ? "message" : "messages"}
        </span>
      </div>

      {/* ── Interactive Table (client component) ───────────────── */}
      <EnquiriesTable initialEnquiries={enquiries} />
    </div>
  );
}
