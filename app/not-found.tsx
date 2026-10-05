import Link from "next/link";
import { BookOpen, Compass, Home } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import { Section, Container } from "@/components/layout";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PublicLayout>
      <div className="flex flex-col w-full bg-[#F8FAFC] min-h-[75vh] justify-center items-center">
        <Section variant="hero" bg="transparent" className="py-20 md:py-28">
          <Container size="md" className="text-center">
            {/* Editorial Eyebrow Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-widest mb-6">
              <Compass className="size-3.5" />
              <span>Page Not Found • Error 404</span>
            </div>

            {/* Main Editorial Headline */}
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl text-slate-900 font-normal tracking-tight mb-6 leading-[1.15]">
              The page you are looking for has been archived or moved.
            </h1>

            {/* Descriptive Body */}
            <p className="text-slate-600 font-light text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              We couldn&apos;t find the publication, edition, or page you requested. It may have been renamed, archived under a different volume, or is currently unavailable.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Link href="/" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-black text-white hover:bg-slate-900 flex items-center justify-center gap-2.5 h-12 px-6 rounded font-medium transition-colors"
                >
                  <Home className="size-4" />
                  <span>Return to Home</span>
                </Button>
              </Link>

              <Link href="/allIssues" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-slate-300 text-slate-800 hover:bg-slate-100 hover:text-black flex items-center justify-center gap-2.5 h-12 px-6 rounded font-medium transition-colors"
                >
                  <BookOpen className="size-4 text-slate-600" />
                  <span>Browse All Issues</span>
                </Button>
              </Link>
            </div>

            {/* Helpful quick links footer */}
            <div className="mt-14 pt-10 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
              <span className="font-medium text-slate-700">Quick Navigation:</span>
              <Link href="/" className="hover:text-accent transition-colors">
                Latest Issue
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/about" className="hover:text-accent transition-colors">
                About Us
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/contact" className="hover:text-accent transition-colors">
                Contact & Inquiries
              </Link>
            </div>
          </Container>
        </Section>
      </div>
    </PublicLayout>
  );
}
