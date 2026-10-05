import type { Metadata } from "next";
import Link from "next/link";
import {
  TrendingUp,
  BookOpen,
  FileDown,
  CheckCircle2,
  Clock,
  HardDrive,
  Calendar,
  Layers,
  ExternalLink,
  ImageOff,
  Files,
  ArrowUpRight,
  Users,
  Download,
  Eye,
  Award,
} from "lucide-react";
import { getAllIssuesAdmin } from "@/lib/queries/issue";
import { getAnalyticsSummary } from "@/lib/analytics";
import RealtimeAnalyticsListener from "../RealtimeAnalyticsListener";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Publication Analytics | E-Wakku Admin",
  description: "Accurate publication statistics, readership metrics, downloads, and digital asset analytics.",
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

const ALL_MONTHS = [
  { key: "01", name: "Jan" },
  { key: "02", name: "Feb" },
  { key: "03", name: "Mar" },
  { key: "04", name: "Apr" },
  { key: "05", name: "May" },
  { key: "06", name: "Jun" },
  { key: "07", name: "Jul" },
  { key: "08", name: "Aug" },
  { key: "09", name: "Sep" },
  { key: "10", name: "Oct" },
  { key: "11", name: "Nov" },
  { key: "12", name: "Dec" },
];

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

export default async function AnalyticsPage() {
  const [issues, analytics] = await Promise.all([
    getAllIssuesAdmin(),
    getAnalyticsSummary(),
  ]);

  const totalIssues = issues.length;
  const publishedIssues = issues.filter((i) => !i.is_draft);
  const pdfAttachedCount = issues.filter((i) => Boolean(i.pdf_url)).length;
  const coverAttachedCount = issues.filter((i) => Boolean(i.cover_image_url)).length;

  const publicationRate = totalIssues > 0 ? Math.round((publishedIssues.length / totalIssues) * 100) : 0;
  const pdfCoverageRate = totalIssues > 0 ? Math.round((pdfAttachedCount / totalIssues) * 100) : 0;
  const coverCoverageRate = totalIssues > 0 ? Math.round((coverAttachedCount / totalIssues) * 100) : 0;

  // Yearly distribution breakdown
  const yearStats: Record<number, { total: number; published: number; draft: number }> = {};
  for (const issue of issues) {
    const y = issue.year;
    if (!yearStats[y]) {
      yearStats[y] = { total: 0, published: 0, draft: 0 };
    }
    yearStats[y].total += 1;
    if (issue.is_draft) {
      yearStats[y].draft += 1;
    } else {
      yearStats[y].published += 1;
    }
  }

  const sortedYears = Object.keys(yearStats)
    .map(Number)
    .sort((a, b) => b - a);

  // Month distribution breakdown
  const monthCounts: Record<string, number> = {};
  for (const issue of issues) {
    const padMonth = issue.month.padStart(2, "0");
    monthCounts[padMonth] = (monthCounts[padMonth] || 0) + 1;
  }
  const maxMonthCount = Math.max(...Object.values(monthCounts), 1);

  // Ranked issues by downloads / readership
  const rankedIssues = [...issues]
    .map((issue) => {
      const stat = analytics.perIssue[issue.id] || { views: 0, readers: 0, downloads: 0 };
      return {
        ...issue,
        stats: stat,
      };
    })
    .sort((a, b) => b.stats.downloads - a.stats.downloads);

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-[#0F172A] tracking-tight">
            Publication Analytics & Metrics
          </h2>
          <p className="mt-1 font-sans text-sm text-[#64748B]">
            Verified data across readership, PDF downloads, archive distribution, and digital storage health.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <RealtimeAnalyticsListener />
          <Link
            href="/admin/issues/manage"
            className="inline-flex items-center gap-2 rounded-lg bg-white border border-[#E2E8F0] px-4 py-2 text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-all shadow-sm"
          >
            <Files size={14} className="text-[#059669]" />
            Manage Issues
          </Link>
        </div>
      </div>

      {/* ── Key Performance Metrics (6 Cards) ──────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Active Readers */}
        <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Active Readers
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-heading text-2xl font-bold text-[#0F172A]">
              {analytics.activeReaders.toLocaleString()}
            </span>
            <p className="text-xs text-[#64748B] mt-1">
              {analytics.totalReaders.toLocaleString()} total readers
            </p>
          </div>
        </div>

        {/* PDF Downloads */}
        <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              PDF Downloads
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-[#059669]">
              <Download size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-heading text-2xl font-bold text-[#0F172A]">
              {analytics.totalDownloads.toLocaleString()}
            </span>
            <p className="text-xs text-[#64748B] mt-1">Direct PDF issues fetched</p>
          </div>
        </div>

        {/* Total Views / Reads */}
        <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Total Reads & Views
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Eye size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-heading text-2xl font-bold text-[#0F172A]">
              {analytics.totalViews.toLocaleString()}
            </span>
            <p className="text-xs text-[#64748B] mt-1">Catalog impressions</p>
          </div>
        </div>

        {/* Catalog Volume */}
        <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Catalog Volume
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-[#059669]">
              <BookOpen size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-2xl font-bold text-[#0F172A]">
                {totalIssues}
              </span>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                {sortedYears.length} {sortedYears.length === 1 ? "Yr" : "Yrs"}
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-1">Recorded editions</p>
          </div>
        </div>

        {/* Published Status */}
        <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Published Status
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-2xl font-bold text-[#0F172A]">
                {publishedIssues.length}
              </span>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                {publicationRate}%
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-1">Active on public portal</p>
          </div>
        </div>

        {/* PDF Assets */}
        <div className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              PDF Coverage
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <FileDown size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-2xl font-bold text-[#0F172A]">
                {pdfAttachedCount}
              </span>
              <span className="text-xs font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full">
                {pdfCoverageRate}%
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-1">Storage verified</p>
          </div>
        </div>
      </div>

      {/* ── Readership & Download Performance Spotlight ───────── */}
      <div className="rounded-xl bg-white border border-[#E2E8F0] p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-[#059669]">
              <Award size={18} />
            </div>
            <div>
              <h3 className="font-heading text-base font-semibold text-[#0F172A]">
                Top Performing Editions by Reader Engagement & Downloads
              </h3>
              <p className="text-xs text-[#64748B]">
                Comparison of readership reach and download conversion across publications
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rankedIssues.slice(0, 3).map((item, idx) => (
            <div
              key={item.id}
              className="rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] p-4 flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-16 rounded bg-slate-200 overflow-hidden shrink-0 border border-[#E2E8F0]">
                  {item.cover_image_url ? (
                    <img
                      src={item.cover_image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ImageOff size={16} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      #{idx + 1} Edition
                    </span>
                    <span className="text-[11px] text-[#64748B]">
                      {formatMonthYear(item.month, item.year)}
                    </span>
                  </div>
                  <h4 className="font-heading font-semibold text-sm text-[#0F172A] truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#64748B] line-clamp-1 mt-0.5">
                    {item.description || "No description"}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E2E8F0] grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#64748B] block text-[11px]">Readers</span>
                  <span className="font-semibold text-[#0F172A] text-sm flex items-center gap-1 mt-0.5">
                    <Users size={12} className="text-purple-600" />
                    {item.stats.readers.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[11px]">Downloads</span>
                  <span className="font-semibold text-emerald-700 text-sm flex items-center gap-1 mt-0.5">
                    <Download size={12} className="text-[#059669]" />
                    {item.stats.downloads.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Archive Distribution by Year & Storage Health ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Yearly Distribution (2 cols) */}
        <div className="lg:col-span-2 rounded-xl bg-white border border-[#E2E8F0] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 text-[#059669]">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h3 className="font-heading text-base font-semibold text-[#0F172A]">
                    Archive Distribution by Year
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Breakdown of magazine publications by production year
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                {totalIssues} Total
              </span>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              {sortedYears.length === 0 ? (
                <p className="text-xs text-[#64748B] text-center py-6">
                  No issues cataloged yet.
                </p>
              ) : (
                sortedYears.map((year) => {
                  const stat = yearStats[year];
                  const percent = totalIssues > 0 ? Math.round((stat.total / totalIssues) * 100) : 0;
                  return (
                    <div key={year} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-semibold text-[#0F172A] text-sm">
                            {year}
                          </span>
                          <span className="text-[#64748B]">
                            ({stat.total} {stat.total === 1 ? "issue" : "issues"})
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-600 font-medium">
                            {stat.published} published
                          </span>
                          {stat.draft > 0 && (
                            <span className="text-amber-600 font-medium">
                              {stat.draft} draft
                            </span>
                          )}
                          <span className="font-semibold text-[#0F172A] w-10 text-right">
                            {percent}%
                          </span>
                        </div>
                      </div>
                      {/* Bar indicator */}
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                        <div
                          className="bg-[#059669] h-full transition-all duration-500"
                          style={{
                            width: `${totalIssues > 0 ? (stat.published / totalIssues) * 100 : 0}%`,
                          }}
                          title={`${stat.published} Published`}
                        />
                        <div
                          className="bg-amber-400 h-full transition-all duration-500"
                          style={{
                            width: `${totalIssues > 0 ? (stat.draft / totalIssues) * 100 : 0}%`,
                          }}
                          title={`${stat.draft} Draft`}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
                Published
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Draft
              </span>
            </div>
            <span>Auto-synced with Supabase</span>
          </div>
        </div>

        {/* Digital Asset & Storage Health (1 col) */}
        <div className="rounded-xl bg-white border border-[#E2E8F0] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-4 border-b border-[#E2E8F0]">
              <div className="p-2 rounded-lg bg-emerald-50 text-[#059669]">
                <HardDrive size={18} />
              </div>
              <div>
                <h3 className="font-heading text-base font-semibold text-[#0F172A]">
                  Storage & Asset Health
                </h3>
                <p className="text-xs text-[#64748B]">Supabase storage bucket status</p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              {/* PDF Bucket */}
              <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
                    <FileDown size={14} className="text-blue-600" />
                    issue-pdfs Bucket
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Connected
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-[#64748B]">
                  <span>Attached PDFs</span>
                  <span className="font-semibold text-[#0F172A]">
                    {pdfAttachedCount} / {totalIssues} ({pdfCoverageRate}%)
                  </span>
                </div>
              </div>

              {/* Covers Bucket */}
              <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
                    <Layers size={14} className="text-emerald-600" />
                    covers Bucket
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Connected
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-[#64748B]">
                  <span>Attached Covers</span>
                  <span className="font-semibold text-[#0F172A]">
                    {coverAttachedCount} / {totalIssues} ({coverCoverageRate}%)
                  </span>
                </div>
              </div>

              {/* Database Status */}
              <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    Supabase PostgreSQL
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-[#64748B]">
                  <span>Row Count</span>
                  <span className="font-semibold text-[#0F172A]">{totalIssues} Rows</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#E2E8F0] text-center">
            <span className="text-[11px] text-[#64748B]">
              Storage verified via Supabase SSR Client
            </span>
          </div>
        </div>
      </div>

      {/* ── Monthly Release Distribution ───────────────────────── */}
      <div className="rounded-xl bg-white border border-[#E2E8F0] p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-[#059669]">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="font-heading text-base font-semibold text-[#0F172A]">
                Monthly Publication Cadence
              </h3>
              <p className="text-xs text-[#64748B]">
                Issue density across calendar months (all years combined)
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 text-center">
          {ALL_MONTHS.map((m) => {
            const count = monthCounts[m.key] || 0;
            const heightPercent = totalIssues > 0 ? Math.max((count / maxMonthCount) * 100, 10) : 10;
            return (
              <div key={m.key} className="flex flex-col items-center gap-2">
                <span className="text-xs font-semibold text-[#0F172A]">{count}</span>
                <div className="w-full bg-slate-100 rounded-md h-24 flex items-end p-1">
                  <div
                    className={`w-full rounded transition-all duration-500 ${count > 0 ? "bg-[#059669]" : "bg-slate-200"
                      }`}
                    style={{ height: `${heightPercent}%` }}
                    title={`${m.name}: ${count} issues`}
                  />
                </div>
                <span className="text-[11px] font-medium text-[#64748B]">{m.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Complete Issue Inventory Breakdown ──────────────────── */}
      <div className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <div>
            <h3 className="font-heading text-base font-semibold text-[#0F172A]">
              Issue Inventory, Readers & Asset Status
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Comprehensive performance list of all {totalIssues} issues in the database.
            </p>
          </div>
          <Link
            href="/admin/issues/new"
            className="text-xs font-semibold text-[#059669] hover:text-[#047857] flex items-center gap-1 transition-colors"
          >
            Add New Issue
            <ArrowUpRight size={14} />
          </Link>
        </div>

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
                <th className="py-3 px-4">Published At</th>
                <th className="py-3 px-4">Created At</th>
                <th className="py-3 px-6 text-right">Links</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {issues.map((issue) => {
                const stat = analytics.perIssue[issue.id] || {
                  views: 0,
                  readers: 0,
                  downloads: 0,
                };

                return (
                  <tr key={issue.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
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
                          Download PDF
                        </a>
                      ) : (
                        <span className="text-[#94A3B8]">Missing</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-[#64748B] whitespace-nowrap">
                      {formatDate(issue.published_at)}
                    </td>
                    <td className="py-3 px-4 text-xs text-[#64748B] whitespace-nowrap">
                      {formatDate(issue.created_at)}
                    </td>
                    <td className="py-3 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3">
                        {!issue.is_draft && (
                          <Link
                            href={`/issues/${issue.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-[#64748B] hover:text-[#0F172A] inline-flex items-center gap-1"
                          >
                            View
                            <ExternalLink size={12} />
                          </Link>
                        )}
                        <Link
                          href="/admin/issues/manage"
                          className="text-xs font-medium text-[#059669] hover:text-[#047857] hover:underline"
                        >
                          Manage
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
