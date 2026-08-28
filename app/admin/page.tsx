import type { Metadata } from "next";
import Link from "next/link";
import {
  Files,
  FilePlus,
  BarChart3,
  Settings,
  ArrowRight,
  BookOpen,
  Eye,
  FileText,
  FileDown,
  ExternalLink,
  CheckCircle2,
  Clock,
  ImageOff,
  Users,
  TrendingUp,
  Download,
} from "lucide-react";
import { getAllIssuesAdmin } from "@/lib/queries/issue";
import { getAnalyticsSummary } from "@/lib/analytics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Dashboard | E-Wakku Admin",
  description: "Live overview of magazine publications, readers, downloads, and editorial status.",
};

const MONTH_NAMES: Record<string, string> = {
  "01": "January",
  "02": "February",
  "03": "March",
  "04": "April",
  "05": "May",
  "06": "June",
  "07": "July",
  "08": "August",
  "09": "September",
  "10": "October",
  "11": "November",
  "12": "December",
  "1": "January",
  "2": "February",
  "3": "March",
  "4": "April",
  "5": "May",
  "6": "June",
  "7": "July",
  "8": "August",
  "9": "September",
};

function formatMonthYear(month: string, year: number): string {
  const cleanMonth = MONTH_NAMES[month] ?? month;
  return `${cleanMonth} ${year}`;
}

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

/**
 * Admin Dashboard — /admin
 */
export default async function AdminDashboardPage() {
  const [issues, analytics] = await Promise.all([
    getAllIssuesAdmin(),
    Promise.resolve(getAnalyticsSummary()),
  ]);

  const totalIssues = issues.length;
  const publishedIssues = issues.filter((i) => !i.is_draft);
  const draftIssues = issues.filter((i) => i.is_draft);
  const pdfCount = issues.filter((i) => Boolean(i.pdf_url)).length;

  const recentIssues = issues.slice(0, 5);
  const latestPublished = publishedIssues[0] ?? null;
  const latestStats = latestPublished ? analytics.perIssue[latestPublished.id] : null;

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-[#0F172A] tracking-tight">
            Editorial Dashboard
          </h2>
          <p className="mt-1 font-sans text-sm text-[#64748B]">
            Real-time status of publication catalog, reader engagement, and downloads.
          </p>
        </div>
        <Link
          href="/admin/issues/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#059669] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#047857] transition-all shadow-sm shrink-0"
        >
          <FilePlus size={16} />
          New Issue
        </Link>
      </div>

      {/* ── Live Metric Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Issues */}
        <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Total Issues
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-[#059669]">
              <BookOpen size={18} />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-heading text-2xl font-bold text-[#0F172A]">
              {totalIssues}
            </p>
            <p className="text-xs text-[#64748B] mt-1">Catalog editions</p>
          </div>
        </div>

        {/* Published */}
        <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Published
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <p className="font-heading text-2xl font-bold text-[#0F172A]">
                {publishedIssues.length}
              </p>
              {totalIssues > 0 && (
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  {Math.round((publishedIssues.length / totalIssues) * 100)}%
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748B] mt-1">Live on site</p>
          </div>
        </div>

        {/* Drafts */}
        <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Drafts
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <p className="font-heading text-2xl font-bold text-[#0F172A]">
                {draftIssues.length}
              </p>
              {draftIssues.length > 0 && (
                <span className="text-xs font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">
                  In queue
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748B] mt-1">Work in progress</p>
          </div>
        </div>

        {/* PDF Assets */}
        <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              PDF Assets
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <FileDown size={18} />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-heading text-2xl font-bold text-[#0F172A]">
              {pdfCount}
              <span className="text-xs font-normal text-[#94A3B8]"> / {totalIssues}</span>
            </p>
            <p className="text-xs text-[#64748B] mt-1">Digitized storage</p>
          </div>
        </div>

        {/* Active Readers */}
        <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Active Readers
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <p className="font-heading text-2xl font-bold text-[#0F172A]">
                {analytics.activeReaders.toLocaleString()}
              </p>
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              {analytics.totalReaders.toLocaleString()} total readers
            </p>
          </div>
        </div>

        {/* Total Downloads */}
        <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              PDF Downloads
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-[#059669]">
              <Download size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <p className="font-heading text-2xl font-bold text-[#0F172A]">
                {analytics.totalDownloads.toLocaleString()}
              </p>
            </div>
            <p className="text-xs text-[#64748B] mt-1">Total PDF downloads</p>
          </div>
        </div>
      </div>

      {/* ── Latest Published Spotlight & Summary ──────────────── */}
      {latestPublished && (
        <div className="rounded-xl bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-emerald-800/40">
          <div className="flex items-center gap-5">
            <div className="w-16 h-20 rounded-md overflow-hidden bg-slate-800 shrink-0 border border-white/20 shadow-md">
              {latestPublished.cover_image_url ? (
                <img
                  src={latestPublished.cover_image_url}
                  alt={latestPublished.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <ImageOff size={20} />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  Latest Active Release
                </span>
                <span className="text-xs text-slate-300">
                  {formatMonthYear(latestPublished.month, latestPublished.year)}
                </span>
              </div>
              <h3 className="font-heading text-xl font-semibold text-white tracking-tight">
                {latestPublished.title}
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl line-clamp-2">
                {latestPublished.description}
              </p>
              {latestStats && (
                <div className="flex items-center gap-4 mt-2 text-xs text-emerald-200">
                  <span className="flex items-center gap-1">
                    <Users size={12} /> {latestStats.readers.toLocaleString()} readers
                  </span>
                  <span className="flex items-center gap-1">
                    <Download size={12} /> {latestStats.downloads.toLocaleString()} downloads
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
            <Link
              href={`/issues/${latestPublished.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium backdrop-blur-sm transition-all border border-white/10"
            >
              <ExternalLink size={14} />
              View on Website
            </Link>
            <Link
              href="/admin/issues/manage"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-medium transition-all shadow-sm"
            >
              Manage
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* ── Recent Issues Table ─────────────────────────────────── */}
      <div className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <div>
            <h3 className="font-heading text-base font-semibold text-[#0F172A]">
              Recent Issues & Performance
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Latest additions to the publication repository with live reader engagement.
            </p>
          </div>
          <Link
            href="/admin/issues/manage"
            className="text-xs font-semibold text-[#059669] hover:text-[#047857] flex items-center gap-1 transition-colors"
          >
            View All ({totalIssues})
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentIssues.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <BookOpen size={36} className="text-[#CBD5E1] mb-2" />
            <p className="text-sm font-medium text-[#0F172A]">No issues in database yet</p>
            <p className="text-xs text-[#64748B] mt-1 max-w-sm">
              Get started by uploading your first magazine issue with cover image and PDF.
            </p>
            <Link
              href="/admin/issues/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#059669] px-4 py-2 text-xs font-medium text-white hover:bg-[#047857] transition-all"
            >
              <FilePlus size={14} />
              Create First Issue
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAFC] text-xs font-semibold text-[#64748B] border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3 px-6">Issue</th>
                  <th className="py-3 px-4">Edition</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Readers</th>
                  <th className="py-3 px-4">Downloads</th>
                  <th className="py-3 px-4">PDF Asset</th>
                  <th className="py-3 px-4">Added On</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {recentIssues.map((issue) => {
                  const stat = analytics.perIssue[issue.id] || {
                    views: 0,
                    readers: 0,
                    downloads: 0,
                  };

                  return (
                    <tr
                      key={issue.id}
                      className="hover:bg-[#F8FAFC]/80 transition-colors"
                    >
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 rounded bg-slate-100 overflow-hidden shrink-0 border border-[#E2E8F0]">
                            {issue.cover_image_url ? (
                              <img
                                src={issue.cover_image_url}
                                alt={issue.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <ImageOff size={14} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <p className="font-heading font-medium text-[#0F172A] truncate">
                              {issue.title}
                            </p>
                            <p className="text-xs text-[#64748B] truncate">
                              {issue.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-[#0F172A] whitespace-nowrap">
                        {formatMonthYear(issue.month, issue.year)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {issue.is_draft ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                            <Clock size={11} />
                            Draft
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 size={11} />
                            Published
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#0F172A] whitespace-nowrap">
                        <span className="font-semibold">{stat.readers.toLocaleString()}</span>
                        <span className="text-[#94A3B8] text-[11px] ml-1">({stat.views.toLocaleString()} views)</span>
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-emerald-700 whitespace-nowrap">
                        {stat.downloads.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-xs whitespace-nowrap">
                        {issue.pdf_url ? (
                          <a
                            href={issue.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                          >
                            <FileDown size={14} />
                            PDF File
                          </a>
                        ) : (
                          <span className="text-[#94A3B8]">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#64748B] whitespace-nowrap">
                        {formatDate(issue.created_at)}
                      </td>
                      <td className="py-3 px-6 text-right whitespace-nowrap">
                        <Link
                          href="/admin/issues/manage"
                          className="text-xs font-medium text-[#059669] hover:text-[#047857] hover:underline"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Quick Actions ───────────────────────────────────────── */}
      <div>
        <h3 className="font-heading text-lg font-semibold text-[#0F172A] mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/issues/manage"
            className="group flex flex-col justify-between rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm hover:border-[#059669] hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-lg bg-emerald-50 p-2.5 text-[#059669]">
                <Files size={20} />
              </div>
              <ArrowRight
                size={16}
                className="text-[#94A3B8] group-hover:text-[#059669] group-hover:translate-x-0.5 transition-all"
              />
            </div>
            <div>
              <h4 className="font-heading text-base font-semibold text-[#0F172A] group-hover:text-[#059669] transition-colors">
                Manage Issues
              </h4>
              <p className="text-xs text-[#64748B] mt-1">
                View, edit metadata, replace PDFs/covers, toggle draft, or remove.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/issues/new"
            className="group flex flex-col justify-between rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm hover:border-[#059669] hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-lg bg-emerald-50 p-2.5 text-[#059669]">
                <FilePlus size={20} />
              </div>
              <ArrowRight
                size={16}
                className="text-[#94A3B8] group-hover:text-[#059669] group-hover:translate-x-0.5 transition-all"
              />
            </div>
            <div>
              <h4 className="font-heading text-base font-semibold text-[#0F172A] group-hover:text-[#059669] transition-colors">
                Add New Issue
              </h4>
              <p className="text-xs text-[#64748B] mt-1">
                Upload new cover image, publication PDF document, and publish.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/analytics"
            className="group flex flex-col justify-between rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm hover:border-[#059669] hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-lg bg-emerald-50 p-2.5 text-[#059669]">
                <BarChart3 size={20} />
              </div>
              <ArrowRight
                size={16}
                className="text-[#94A3B8] group-hover:text-[#059669] group-hover:translate-x-0.5 transition-all"
              />
            </div>
            <div>
              <h4 className="font-heading text-base font-semibold text-[#0F172A] group-hover:text-[#059669] transition-colors">
                Publication Analytics
              </h4>
              <p className="text-xs text-[#64748B] mt-1">
                Analyze catalog distribution, readership metrics, and downloads.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/settings"
            className="group flex flex-col justify-between rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm hover:border-[#059669] hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-lg bg-emerald-50 p-2.5 text-[#059669]">
                <Settings size={20} />
              </div>
              <ArrowRight
                size={16}
                className="text-[#94A3B8] group-hover:text-[#059669] group-hover:translate-x-0.5 transition-all"
              />
            </div>
            <div>
              <h4 className="font-heading text-base font-semibold text-[#0F172A] group-hover:text-[#059669] transition-colors">
                Settings
              </h4>
              <p className="text-xs text-[#64748B] mt-1">
                Configure application, Supabase connectivity, and authentication.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
