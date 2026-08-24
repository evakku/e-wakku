import type { Metadata } from "next";
import Link from "next/link";
import { Files, FilePlus, BarChart3, Settings, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard | E-Wakku Admin",
};

/**
 * Admin Dashboard — /admin
 */
export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div>
        <h2 className="font-heading text-2xl text-[#0F172A] tracking-tight">
          Welcome back
        </h2>
        <p className="mt-1 font-sans text-sm text-[#64748B]">
          Here&apos;s what&apos;s happening with E-Wakku today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Issues", val: "42" },
          { label: "Active Readers", val: "1,284" },
          { label: "Downloads", val: "9,631" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl bg-white border border-[#E2E8F0] p-6 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-1">
              {item.label}
            </p>
            <p className="font-heading text-3xl font-semibold text-[#0F172A]">
              {item.val}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="font-heading text-lg text-[#0F172A] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/issues/manage"
            className="group flex flex-col justify-between rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm hover:border-[#059669] hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-lg bg-emerald-50 p-2.5 text-[#059669]">
                <Files size={20} />
              </div>
              <ArrowRight size={16} className="text-[#94A3B8] group-hover:text-[#059669] group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <h4 className="font-heading text-base font-semibold text-[#0F172A] group-hover:text-[#059669] transition-colors">
                Manage Issues
              </h4>
              <p className="text-xs text-[#64748B] mt-1">
                View, edit, toggle drafts or remove magazine editions.
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
              <ArrowRight size={16} className="text-[#94A3B8] group-hover:text-[#059669] group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <h4 className="font-heading text-base font-semibold text-[#0F172A] group-hover:text-[#059669] transition-colors">
                Add New Issue
              </h4>
              <p className="text-xs text-[#64748B] mt-1">
                Upload new cover image, publication PDF and publish.
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
              <ArrowRight size={16} className="text-[#94A3B8] group-hover:text-[#059669] group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <h4 className="font-heading text-base font-semibold text-[#0F172A] group-hover:text-[#059669] transition-colors">
                Analytics
              </h4>
              <p className="text-xs text-[#64748B] mt-1">
                Check readership, download counts and stats.
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
              <ArrowRight size={16} className="text-[#94A3B8] group-hover:text-[#059669] group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <h4 className="font-heading text-base font-semibold text-[#0F172A] group-hover:text-[#059669] transition-colors">
                Settings
              </h4>
              <p className="text-xs text-[#64748B] mt-1">
                Configure application and authentication parameters.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
