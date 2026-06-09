"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FileText, Loader2 } from "lucide-react";

interface PDFViewerPlaceholderProps {
  pdfUrl?: string;
  title: string;
}

export default function PDFViewerPlaceholder({ pdfUrl, title }: PDFViewerPlaceholderProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  // Pulse animation variants for a subtle, premium loading state
  const pulseVariants = {
    animate: {
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center w-full bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden h-[400px] sm:h-[500px] lg:h-[700px] transition-all duration-300"
      aria-label="Magazine PDF Document Viewer"
    >
      {/* Decorative architectural grid background lines in theme of Stripe Press/Monocle */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      {/* Centered Loading State UI */}
      <motion.div
        variants={shouldReduceMotion ? {} : pulseVariants}
        animate="animate"
        className="z-10 flex flex-col items-center max-w-md px-6 text-center select-none"
      >
        {/* Animated PDF Icon */}
        <div className="relative mb-6 flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 border border-slate-100 shadow-inner">
          <FileText className="w-8 h-8 text-slate-400 stroke-[1.25]" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -inset-1 border border-transparent border-t-accent/40 rounded-full"
            style={{ pointerEvents: "none" }}
          />
        </div>

        {/* Loading Information */}
        <h4 className="font-heading text-lg sm:text-xl text-slate-800 font-normal tracking-tight mb-2">
          Interactive Document Loading
        </h4>
        <p className="font-body text-xs sm:text-sm text-slate-500 leading-relaxed font-light">
          Please wait while we fetch the high-resolution edition.
        </p>

        {/* Action Spinner details */}
        <div className="mt-8 flex items-center gap-2.5 text-xs text-accent font-medium tracking-wide uppercase">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Buffering Pages...</span>
        </div>
      </motion.div>

      {/* Elegant minimalist bottom bar indicating future connectivity */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-slate-50 pt-3">
        <span>STATUS: RESOLVING_ASSET</span>
        <span className="hidden sm:inline">PROVIDER: STATIC_MOCK</span>
      </div>

      {/* ====================================================================
          FUTURE PDF INTEGRATION BLUEPRINT
          ====================================================================
          To replace this placeholder with a live PDF viewer (e.g. React-PDF or PDF.js):

          1. Install required packages:
             $ npm install react-pdf
             OR use standard PDF.js inside an iframe.

          2. Replace this component implementation with the following template:

          ```tsx
          "use client";
          import { useState } from "react";
          import { Document, Page, pdfjs } from "react-pdf";

          // Set up worker URL (usually loaded from CDN or public folder)
          pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

          export default function LivePDFViewer({ pdfUrl }: { pdfUrl: string }) {
            const [numPages, setNumPages] = useState<number | null>(null);
            const [pageNumber, setPageNumber] = useState<number>(1);

            function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
              setNumPages(numPages);
            }

            return (
              <div className="flex flex-col items-center bg-white rounded-xl border border-slate-200 shadow-sm p-4 w-full">
                {pdfUrl ? (
                  <Document
                    file={pdfUrl} // Connect CMS Sanity PDF asset URL or direct path
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<PlaceholderSpinner />}
                  >
                    <Page pageNumber={pageNumber} renderTextLayer={false} renderAnnotationLayer={false} />
                  </Document>
                ) : (
                  <p>No document URL provided</p>
                )}
                {numPages && (
                  <div className="flex gap-4 items-center mt-4">
                    <button onClick={() => setPageNumber(p => Math.max(p - 1, 1))} disabled={pageNumber <= 1}>Previous</button>
                    <span>Page {pageNumber} of {numPages}</span>
                    <button onClick={() => setPageNumber(p => Math.min(p + 1, numPages))} disabled={pageNumber >= numPages}>Next</button>
                  </div>
                )}
              </div>
            );
          }
          ```
          ==================================================================== */}
    </div>
  );
}
