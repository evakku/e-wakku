import type { Metadata } from "next";
import { Settings, Shield, Sliders } from "lucide-react";

export const metadata: Metadata = {
  title: "Settings | E-Wakku Admin",
};

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h2 className="font-heading text-2xl text-[#0F172A] tracking-tight">
          Admin Settings
        </h2>
        <p className="mt-1 font-sans text-sm text-[#64748B]">
          Configure publication preferences, Supabase integrations, and admin access.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl bg-white border border-[#E2E8F0] p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-4">
            <Sliders className="text-[#059669]" size={20} />
            <div>
              <h3 className="font-heading text-base font-semibold text-[#0F172A]">
                General Preferences
              </h3>
              <p className="text-xs text-[#64748B]">Publication display settings</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-[#0F172A]">Public Registration</p>
              <p className="text-xs text-[#64748B]">Allow readers to create subscriber accounts</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              Enabled
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-[#E2E8F0] p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-4">
            <Shield className="text-[#059669]" size={20} />
            <div>
              <h3 className="font-heading text-base font-semibold text-[#0F172A]">
                Security & Access
              </h3>
              <p className="text-xs text-[#64748B]">Authentication & session controls</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-[#0F172A]">Supabase SSR Auth</p>
              <p className="text-xs text-[#64748B]">Active with cookie session refresh</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              Connected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
