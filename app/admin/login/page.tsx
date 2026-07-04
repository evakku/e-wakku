"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { loginAdmin, LoginState } from "@/app/admin/actions/auth";
import logo from "@/src/assets/logo.png";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    async (prevState: LoginState, formData: FormData) => {
      const result = await loginAdmin(prevState, formData);
      if (result.success) {
        router.push("/admin");
      } else {
        const passwordInput = document.getElementById("password") as HTMLInputElement;
        if (passwordInput) passwordInput.value = "";
      }
      return result;
    },
    { error: undefined }
  );

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="bg-[#f7f9fb] min-h-screen flex flex-col font-body-md text-[#191c1e] selection:bg-[#adedd3]">
      {/* Discrete Header Detail */}
      <div className="h-[2px] bg-gradient-to-r from-[#059669] to-transparent fixed top-0 left-0 w-full z-[100]"></div>

      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center p-6 sm:p-[64px]">
        <div className="w-full max-w-md flex flex-col items-center">
          {/* Brand Anchor */}
          <div className="mb-12 w-full flex justify-center">
            <div className="relative h-16 w-48">
              <Image
                src={logo}
                alt="The Journal Editorial Logo"
                fill
                className="object-contain transition-opacity hover:opacity-90"
              />
            </div>
          </div>

          {/* Login Container (Editorial Card) */}
          <div
            className="w-full rounded-lg p-8 sm:p-10 border border-slate-100 bg-white"
            style={{
              boxShadow:
                "0 40px 100px -20px rgba(0, 0, 0, 0.04), 0 20px 40px -15px rgba(0, 0, 0, 0.03)",
            }}
          >
            <header className="mb-10 text-center">
              <h1 className="font-['Noto_Serif'] text-[32px] leading-[1.3] text-[#191c1e] mb-2 font-normal">
                Sign in to Editorial HQ
              </h1>
              <p className="font-['Inter'] text-[16px] text-[#45464d]">
                The Journal Administrative Portal
              </p>
            </header>

            <form action={formAction} className="space-y-8">
              {/* Error Message */}
              {state.error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                  {state.error}
                </div>
              )}

              {/* Email Field */}
              <div className="flex flex-col">
                <label
                  htmlFor="email"
                  className="font-['Inter'] text-[12px] font-semibold text-[#45464d] uppercase tracking-[0.1em] mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="editor@thejournal.com"
                    className="w-full font-['Inter'] text-[16px] text-[#191c1e] placeholder:text-[#c6c6cd] border-0 border-b border-[#e0e3e5] bg-transparent py-3 focus:outline-none focus:ring-0 focus:border-b-[#059669] transition-all duration-300"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col">
                <div className="flex justify-between items-end mb-1">
                  <label
                    htmlFor="password"
                    className="font-['Inter'] text-[12px] font-semibold text-[#45464d] uppercase tracking-[0.1em]"
                  >
                    Password
                  </label>
                  <a
                    href="#"
                    className="font-['Inter'] text-[12px] font-semibold text-[#059669] hover:opacity-80 transition-opacity"
                  >
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    className="w-full font-['Inter'] text-[16px] text-[#191c1e] placeholder:text-[#c6c6cd] border-0 border-b border-[#e0e3e5] bg-transparent py-3 focus:outline-none focus:ring-0 focus:border-b-[#059669] transition-all duration-300 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-3 text-[#c6c6cd] hover:text-[#059669] transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-4 rounded-lg font-['Inter'] text-[20px] font-medium text-white flex items-center justify-center gap-2 group transition-all duration-200 bg-[#059669] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.15)" }}
                >
                  <span>{isPending ? "Signing in..." : "Continue to Dashboard"}</span>
                  {!isPending && (
                    <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Secondary Actions */}
          <nav className="mt-12 flex flex-col items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 font-['Inter'] text-[16px] text-[#45464d] hover:text-[#059669] transition-colors group"
            >
              <ArrowLeft size={16} />
              <span className="border-b border-transparent group-hover:border-[#059669] transition-all">
                Back to main website
              </span>
            </Link>
            <p className="font-['Inter'] text-[12px] font-semibold text-[#c6c6cd] uppercase tracking-[0.1em] flex items-center gap-2">
              <ShieldCheck size={14} />
              SECURE ACCESS ONLY
            </p>
          </nav>
        </div>
      </main>

      {/* Footer Identity */}
      <footer className="p-8 text-center">
        <p className="font-['Inter'] font-semibold text-[10px] text-[#c6c6cd] uppercase tracking-[0.2em]">
          © 2024 The Journal Editorial Board. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
