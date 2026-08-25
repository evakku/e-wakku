import type { Metadata } from "next";
import { BarChart3, TrendingUp, Users, Eye } from "lucide-react";

export const metadata: Metadata = {
  title: "Analytics | E-Wakku Admin",
};

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h2 className="font-heading text-2xl text-[#0F172A] tracking-tight">
          Publication Analytics
        </h2>
        <p className="mt-1 font-sans text-sm text-[#64748B]">
          Overview of reader engagement, issue views, and download statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Views", value: "24,850", change: "+12.4%", icon: Eye },
          { label: "Active Readers", value: "1,284", change: "+8.1%", icon: Users },
          { label: "PDF Downloads", value: "9,631", change: "+15.3%", icon: TrendingUp },
          { label: "Avg. Time Spent", value: "4m 32s", change: "+3.2%", icon: BarChart3 },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                {stat.label}
              </span>
              <stat.icon size={18} className="text-[#059669]" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-heading text-2xl text-[#0F172A]">
                {stat.value}
              </span>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col items-center justify-center min-h-[220px] text-center">
        <BarChart3 size={40} className="text-[#CBD5E1] mb-2" />
        <h3 className="font-heading text-base font-semibold text-[#0F172A]">Detailed Analytics Chart</h3>
        <p className="text-xs text-[#64748B] max-w-sm mt-1">
          Detailed metrics breakdown per issue edition will appear here as readership data accumulates.
        </p>
      </div>
    </div>
  );
}
