"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeadlineMd, BodyMd } from "@/src/components/ui/typography";
import { fadeUpVariants } from "@/lib/animations";
import type { NewsletterSettings } from "./types";

interface NewsletterCTAProps {
  settings: NewsletterSettings;
}

export default function NewsletterCTA({ settings }: NewsletterCTAProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Simple validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      // Simulate API submission
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus("success");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again later.");
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={fadeUpVariants(shouldReduceMotion)}
      className="mx-auto w-full max-w-[700px]"
    >
      <div className="bg-card rounded-2xl shadow-paper-lg border border-border/10 p-8 md:p-12 text-center flex flex-col items-center">
        {status === "success" ? (
          /* Success State View */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-4"
          >
            <div className="size-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-6">
              <Check className="size-6 stroke-[2.5]" />
            </div>
            <HeadlineMd className="text-foreground tracking-tight font-heading mb-3">
              Thank You for Subscribing
            </HeadlineMd>
            <BodyMd className="text-muted-foreground font-light max-w-md">
              You have been successfully added to our mailing list. We will notify you when the next issue is released.
            </BodyMd>
            <Button
              variant="ghost"
              onClick={() => setStatus("idle")}
              className="mt-6 text-accent hover:text-accent/80 hover:bg-accent/5 font-medium cursor-pointer"
            >
              Subscribe another email
            </Button>
          </motion.div>
        ) : (
          /* Standard Input Form View */
          <>
            <HeadlineMd className="text-foreground tracking-tight font-heading mb-3">
              {settings.heading}
            </HeadlineMd>
            <BodyMd className="text-muted-foreground font-light mb-8 max-w-md leading-relaxed">
              {settings.description}
            </BodyMd>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3 w-full items-stretch">
                <div className="relative flex-1">
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    required
                    disabled={status === "submitting"}
                    aria-label="Email address for subscription"
                    className="w-full h-12 rounded-md bg-[#F8FAFC] focus-visible:bg-white text-base transition-all font-sans"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={status === "submitting" || !email}
                  className="bg-primary text-white hover:bg-primary/90 h-12 px-6 rounded-md font-medium text-base shadow-sm shrink-0 flex items-center justify-center gap-2 transition-all cursor-pointer min-w-[120px]"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="size-4 animate-spin shrink-0" />
                      Subscribed
                    </>
                  ) : (
                    settings.buttonText || "Subscribe"
                  )}
                </Button>
              </div>

              {/* Error state message */}
              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-destructive text-sm text-left mt-1 self-start font-medium"
                >
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </form>
          </>
        )}
      </div>
    </motion.div>
  );
}
