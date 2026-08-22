import type { Metadata } from "next";
import Link from "next/link";
import { FilePlus } from "lucide-react";
import { getIssues } from "@/app/admin/issues/manage/actions";
import { ManageIssuesTable } from "@/components/magazine/ManageIssuesTable";

export const metadata: Metadata = {
  title: "Manage Issues | E-Wakku Admin",
  description: "View, edit, publish and delete magazine issues.",
};

const PAGE_SIZE = 4;

/**
 * Manage Issues — /admin/issues/manage
 *
 * Server Component: fetches issues from Supabase, then renders the
 * interactive client table with edit, draft and delete capabilities.
 */
export default async function ManageIssuesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: "all" | "published" | "draft" }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const search = params.search ?? "";
  const status = params.status ?? "all";

  const { issues, total, error } = await getIssues(page, PAGE_SIZE, search, status);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl text-[#0F172A] tracking-tight">
            Manage Issues
          </h2>
          <p className="mt-1 font-sans text-sm text-[#64748B]">
            Review and update editorial publications, toggle draft status, edit details, and remove issues.
          </p>
        </div>

        <Link
          href="/admin/issues/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#059669] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#047857] transition-all shadow-sm hover:scale-[1.01]"
        >
          <FilePlus size={16} />
          New Issue
        </Link>
      </div>

      {/* ── Error state ──────────────────────────────────────────── */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          Failed to load issues: {error}
        </div>
      )}

      {/* ── Issues table ─────────────────────────────────────────── */}
      {!error && (
        <ManageIssuesTable
          issues={issues}
          total={total}
          page={page}
          pageSize={PAGE_SIZE}
          currentSearch={search}
          currentStatus={status}
        />
      )}
    </div>
  );
}
