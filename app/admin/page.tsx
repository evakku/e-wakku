import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * Admin Dashboard — /admin
 */
export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-2xl text-[#0F172A] tracking-tight">
          Welcome back
        </h2>
        <p className="mt-1 font-sans text-sm text-[#64748B]">
          Here&apos;s what&apos;s happening with E-Wakku today.
        </p>
      </div>

      {/* Placeholder stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {["Total Issues", "Active Readers", "Downloads"].map((label, i) => (
          <div
            key={label}
            className="rounded-md bg-white border border-[#E2E8F0] p-6"
          >
            <p className="type-label-caps text-[#64748B] mb-1">{label}</p>
            <p className="font-heading text-3xl text-[#0F172A]">
              {["42", "1,284", "9,631"][i]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
