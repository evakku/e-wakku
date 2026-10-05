"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import logo from "@/src/assets/logo.png";
import { createClient } from "@/lib/supabase/client";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsPending(true);

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/admin/reset-password`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        trimmedEmail,
        { redirectTo }
      );

      if (resetError) {
        setError(resetError.message);
      } else {
        setIsSubmitted(true);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsPending(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setError(null);
  };

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
                priority
              />
            </div>
          </div>

          {/* Reset Request Container */}
          <div
            className="w-full rounded-lg p-8 sm:p-10 border border-slate-100 bg-white"
            style={{
              boxShadow:
                "0 40px 100px -20px rgba(0, 0, 0, 0.04), 0 20px 40px -15px rgba(0, 0, 0, 0.03)",
            }}
          >
            {!isSubmitted ? (
              <>
                <header className="mb-8 text-center">
                  <h1 className="font-['Noto_Serif'] text-[32px] leading-[1.3] text-[#191c1e] mb-2 font-normal">
                    Reset Password
                  </h1>
                  <p className="font-['Inter'] text-[15px] text-[#45464d] leading-relaxed">
                    Enter your editorial email address and we&apos;ll send you a
                    secure link to reset your password.
                  </p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200 flex items-start gap-2 animate-fade-in">
                      <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                      <span>{error}</span>
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
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError(null);
                        }}
                        disabled={isPending}
                        required
                        placeholder="editor@thejournal.com"
                        className="w-full font-['Inter'] text-[16px] text-[#191c1e] placeholder:text-[#c6c6cd] border-0 border-b border-[#e0e3e5] bg-transparent py-3 focus:outline-none focus:ring-0 focus:border-b-[#059669] transition-all duration-300 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full py-4 rounded-lg font-['Inter'] text-[18px] font-medium text-white flex items-center justify-center gap-2 group transition-all duration-200 bg-[#059669] hover:bg-[#047857] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                      style={{
                        boxShadow:
                          "inset 0 1px 0 0 rgba(255, 255, 255, 0.15)",
                      }}
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Sending Reset Link...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Reset Link</span>
                          <ArrowRight
                            size={20}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Back to Login Link */}
                  <div className="pt-2 text-center">
                    <Link
                      href="/admin/login"
                      className="inline-flex items-center gap-1.5 font-['Inter'] text-[14px] font-medium text-[#059669] hover:text-[#047857] transition-colors"
                    >
                      <ArrowLeft size={16} />
                      Back to Sign In
                    </Link>
                  </div>
                </form>
              </>
            ) : (
              /* Success State */
              <div className="text-center py-2 animate-fade-in space-y-6">
                <div className="w-14 h-14 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>

                <div>
                  <h2 className="font-['Noto_Serif'] text-[26px] leading-[1.3] text-[#191c1e] mb-2 font-normal">
                    Check your inbox
                  </h2>
                  <p className="font-['Inter'] text-[15px] text-[#45464d] leading-relaxed">
                    We&apos;ve sent a password reset link to{" "}
                    <span className="font-semibold text-[#191c1e] break-all">
                      {email}
                    </span>
                    .
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-4 text-left">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-[#059669] shrink-0 mt-0.5" />
                    <div className="text-xs text-[#64748B] space-y-1">
                      <p className="font-medium text-[#334155]">
                        What to do next:
                      </p>
                      <p>
                        Click the reset link inside the email to set a new
                        password. The link will expire shortly for security.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full py-3 rounded-lg border border-slate-200 font-['Inter'] text-[14px] font-medium text-[#45464d] hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={15} />
                    Try another email or resend
                  </button>

                  <Link
                    href="/admin/login"
                    className="w-full py-3.5 rounded-lg font-['Inter'] text-[16px] font-medium text-white bg-[#059669] hover:bg-[#047857] transition-all text-center"
                  >
                    Return to Sign In
                  </Link>
                </div>
              </div>
            )}
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
          © {new Date().getFullYear()} The Journal Editorial Board. All Rights
          Reserved.
        </p>
      </footer>
    </div>
  );
}
