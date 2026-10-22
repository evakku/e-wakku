"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home, BookOpen } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import { Section, Container } from "@/components/layout";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log unexpected runtime errors safely
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <PublicLayout>
      <div className="flex flex-col w-full bg-[#F8FAFC] min-h-[75vh] justify-center items-center">
        <Section variant="hero" bg="transparent" className="py-20 md:py-28">
          <Container size="md" className="text-center">
            {/* Editorial Eyebrow Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100/80 text-red-700 text-xs font-semibold uppercase tracking-widest mb-6 border border-red-200">
              <AlertCircle className="size-3.5 text-red-600" />
              <span>Publication Unavailable • System Notice</span>
            </div>

            {/* Main Editorial Headline */}
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl text-slate-900 font-normal tracking-tight mb-5 leading-[1.2]">
              We couldn&apos;t load this editorial content.
            </h1>

            {/* Descriptive Body */}
            <p className="text-slate-600 font-light text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              An unexpected issue occurred while preparing this edition. This may be due to a temporary network interruption or database sync. You can try refreshing the page or return to our home catalog.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Button
                onClick={() => reset()}
                size="lg"
                className="w-full sm:w-auto bg-[#059669] text-white hover:bg-[#047857] flex items-center justify-center gap-2.5 h-12 px-6 rounded font-medium transition-colors cursor-pointer shadow-sm"
              >
                <RotateCcw className="size-4" />
                <span>Try Again</span>
              </Button>

              <Link href="/" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-slate-300 text-slate-800 hover:bg-slate-100 hover:text-black flex items-center justify-center gap-2.5 h-12 px-6 rounded font-medium transition-colors"
                >
                  <Home className="size-4 text-slate-600" />
                  <span>Return to Home</span>
                </Button>
              </Link>
            </div>

            {/* Helpful quick links footer */}
            <div className="mt-14 pt-10 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
              <Link href="/allIssues" className="hover:text-accent transition-colors flex items-center gap-1.5">
                <BookOpen size={14} />
                <span>Browse All Issues</span>
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/about" className="hover:text-accent transition-colors">
                About E-Wakku
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/contact" className="hover:text-accent transition-colors">
                Contact & Support
              </Link>
            </div>
          </Container>
        </Section>
      </div>
    </PublicLayout>
  );
}
