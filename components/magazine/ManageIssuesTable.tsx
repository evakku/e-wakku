"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { BookOpen, Check } from "lucide-react";
import type { Issue } from "@/app/admin/issues/manage/actions";
import { IssuesFilterBar } from "./manage/IssuesFilterBar";
import { IssuesPagination } from "./manage/IssuesPagination";
import { EditIssueModal } from "./manage/EditIssueModal";
import { DeleteConfirmDialog } from "./manage/DeleteConfirmDialog";
import { IssueTableRow } from "./manage/IssueTableRow";

interface Props {
  issues: Issue[];
  total: number;
  page: number;
  pageSize: number;
  currentSearch?: string;
  currentStatus?: "all" | "published" | "draft";
}

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
        <EditIssueModal
          issue={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={showToast}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmDialog
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
      <IssuesFilterBar
        currentStatus={currentStatus}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={() => {
          setSearchInput("");
          updateQuery({ search: null, page: "1" });
        }}
        onStatusChange={(status) =>
          updateQuery({
            status: status === "all" ? null : status,
            page: "1",
          })
        }
      />

      {/* Table Card */}
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
                  <IssueTableRow
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
        <IssuesPagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={(newPage) => updateQuery({ page: String(newPage) })}
        />
      </div>
    </>
  );
}

export default ManageIssuesTable;
