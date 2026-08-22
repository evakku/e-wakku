"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import logo from "@/src/assets/logo.png";
import { createClient } from "@/lib/supabase/client";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isSessionChecking, setIsSessionChecking] = useState(true);
  const [isInvalidSession, setIsInvalidSession] = useState(false);

  // Check URL parameters, hash fragments, and current auth state on mount
  useEffect(() => {
    const supabase = createClient();

    // 1. Check query parameters for error passed by /auth/callback or Supabase
    const queryError =
      searchParams.get("error_description") || searchParams.get("error");
    if (queryError) {
      setError(queryError);
      setIsInvalidSession(true);
      setIsSessionChecking(false);
      return;
    }

    // 2. Check hash fragments in case implicit redirect returned error in hash
    if (typeof window !== "undefined" && window.location.hash) {
      const hashParams = new URLSearchParams(
        window.location.hash.substring(1)
      );
      const hashError =
        hashParams.get("error_description") || hashParams.get("error");
      if (hashError) {
        setError(decodeURIComponent(hashError.replace(/\+/g, " ")));
        setIsInvalidSession(true);
        setIsSessionChecking(false);
        return;
      }
    }

    // 3. Listen to auth state change (e.g. PASSWORD_RECOVERY event or active session)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setIsInvalidSession(false);
        setError(null);
      }
    });

    // 4. Check if we already have a user session from the PKCE code exchange
    async function checkSession() {
      try {
        const {
          data: { session },
          error: sessionErr,
        } = await supabase.auth.getSession();

        if (sessionErr || !session) {
          // If no active session and no code/tokens, flag invalid link
          setIsInvalidSession(true);
          setError(
            "Your password reset link is invalid, expired, or has already been used."
          );
        } else {
          setIsInvalidSession(false);
        }
      } catch {
        setIsInvalidSession(true);
      } finally {
        setIsSessionChecking(false);
      }
    }

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [searchParams]);

  // Countdown timer for redirection on success
  useEffect(() => {
    if (!isSuccess) return;

    if (countdown === 0) {
      router.push("/admin/login");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isSuccess, countdown, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!password) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsPending(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        if (
          updateError.message.toLowerCase().includes("session") ||
          updateError.message.toLowerCase().includes("expired") ||
          updateError.message.toLowerCase().includes("auth")
        ) {
          setIsInvalidSession(true);
        }
        setError(updateError.message);
      } else {
        setIsSuccess(true);
        // Cleanly sign out the temporary recovery session so user signs in cleanly
        await supabase.auth.signOut();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update password. Please try again.");
      }
    } finally {
      setIsPending(false);
    }
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

          {/* Reset Password Card */}
          <div
            className="w-full rounded-lg p-8 sm:p-10 border border-slate-100 bg-white"
            style={{
              boxShadow:
                "0 40px 100px -20px rgba(0, 0, 0, 0.04), 0 20px 40px -15px rgba(0, 0, 0, 0.03)",
            }}
          >
            {isSessionChecking ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-[#059669]" />
                <p className="text-sm font-['Inter'] text-[#64748B]">
                  Verifying reset session...
                </p>
              </div>
            ) : isInvalidSession && !isSuccess ? (
              /* Invalid or Expired Token State */
              <div className="text-center py-2 animate-fade-in space-y-6">
                <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                  <ShieldAlert size={30} />
                </div>

                <div>
                  <h2 className="font-['Noto_Serif'] text-[26px] leading-[1.3] text-[#191c1e] mb-2 font-normal">
                    Invalid or Expired Link
                  </h2>
                  <p className="font-['Inter'] text-[15px] text-[#45464d] leading-relaxed">
                    {error ||
                      "This password reset link has expired or has already been used."}
                  </p>
                </div>

                <div className="rounded-lg bg-amber-50 border border-amber-200/80 p-4 text-left">
                  <p className="text-xs text-amber-800 leading-relaxed">
                    For security reasons, password reset links are single-use and
                    expire after a short period. Please request a new link.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-3">
                  <Link
                    href="/admin/forgot-password"
                    className="w-full py-3.5 rounded-lg font-['Inter'] text-[16px] font-medium text-white bg-[#059669] hover:bg-[#047857] transition-all text-center inline-flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={16} />
                    Request New Reset Link
                  </Link>

                  <Link
                    href="/admin/login"
                    className="w-full py-3 rounded-lg border border-slate-200 font-['Inter'] text-[14px] font-medium text-[#45464d] hover:bg-slate-50 transition-colors text-center"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </div>
            ) : isSuccess ? (
              /* Success State */
              <div className="text-center py-2 animate-fade-in space-y-6">
                <div className="w-14 h-14 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>

                <div>
                  <h2 className="font-['Noto_Serif'] text-[26px] leading-[1.3] text-[#191c1e] mb-2 font-normal">
                    Password Updated!
                  </h2>
                  <p className="font-['Inter'] text-[15px] text-[#45464d] leading-relaxed">
                    Your password has been successfully updated. You can now sign
                    in with your new credentials.
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3 text-center">
                  <p className="text-xs text-[#64748B]">
                    Redirecting to sign in page in{" "}
                    <span className="font-semibold text-[#059669]">
                      {countdown}
                    </span>{" "}
                    second{countdown !== 1 ? "s" : ""}…
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    href="/admin/login"
                    className="w-full py-3.5 rounded-lg font-['Inter'] text-[16px] font-medium text-white bg-[#059669] hover:bg-[#047857] transition-all text-center inline-flex items-center justify-center gap-2"
                  >
                    <span>Sign In Now</span>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            ) : (
              /* Password Reset Form */
              <>
                <header className="mb-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center mx-auto mb-4">
                    <KeyRound size={24} />
                  </div>
                  <h1 className="font-['Noto_Serif'] text-[30px] leading-[1.3] text-[#191c1e] mb-2 font-normal">
                    Set New Password
                  </h1>
                  <p className="font-['Inter'] text-[15px] text-[#45464d]">
                    Please choose a strong password for your account.
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

                  {/* New Password */}
                  <div className="flex flex-col">
                    <label
                      htmlFor="new-password"
                      className="font-['Inter'] text-[12px] font-semibold text-[#45464d] uppercase tracking-[0.1em] mb-1"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="new-password"
                        name="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError(null);
                        }}
                        disabled={isPending}
                        required
                        placeholder="At least 6 characters"
                        className="w-full font-['Inter'] text-[16px] text-[#191c1e] placeholder:text-[#c6c6cd] border-0 border-b border-[#e0e3e5] bg-transparent py-3 focus:outline-none focus:ring-0 focus:border-b-[#059669] transition-all duration-300 pr-10 disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-3 text-[#c6c6cd] hover:text-[#059669] transition-colors"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col">
                    <label
                      htmlFor="confirm-password"
                      className="font-['Inter'] text-[12px] font-semibold text-[#45464d] uppercase tracking-[0.1em] mb-1"
                    >
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirm-password"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (error) setError(null);
                        }}
                        disabled={isPending}
                        required
                        placeholder="Re-enter your new password"
                        className="w-full font-['Inter'] text-[16px] text-[#191c1e] placeholder:text-[#c6c6cd] border-0 border-b border-[#e0e3e5] bg-transparent py-3 focus:outline-none focus:ring-0 focus:border-b-[#059669] transition-all duration-300 pr-10 disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-0 top-3 text-[#c6c6cd] hover:text-[#059669] transition-colors"
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password requirements hint */}
                  <div className="text-xs text-[#64748B] flex items-center gap-1.5">
                    <Lock size={12} className="text-[#059669]" />
                    <span>Must be at least 6 characters long</span>
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
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <>
                          <span>Update Password</span>
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
                      className="inline-flex items-center gap-1.5 font-['Inter'] text-[14px] font-medium text-[#64748B] hover:text-[#059669] transition-colors"
                    >
                      <ArrowLeft size={16} />
                      Cancel and return to Sign In
                    </Link>
                  </div>
                </form>
              </>
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#059669]" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
