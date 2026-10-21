"use client";

import { useState } from "react";
import { ExternalLink, BookOpen, AlertCircle, RefreshCw } from "lucide-react";
import Spinner from "@/components/ui/spinner";

interface PDFViewerPlaceholderProps {
  pdfUrl?: string;
  title: string;
}

function PDFViewerFrame({
  pdfUrl,
  title,
  onRetry,
}: {
  pdfUrl: string;
  title: string;
  onRetry: () => void;
}) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm sm:h-[500px] lg:h-[700px]">
      {/* Loading Overlay */}
      {status === "loading" && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50/90 backdrop-blur-xs p-6 text-center transition-opacity duration-300"
        >
          <div className="flex flex-col items-center max-w-sm rounded-2xl bg-white p-8 border border-slate-200/80 shadow-md">
            <Spinner size="lg" color="emerald" label="Loading digital publication" className="mb-4" />
            <h4 className="font-heading text-lg font-semibold text-slate-800">
              Loading Digital Edition
            </h4>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              Fetching high-resolution pages for <span className="font-medium text-slate-700">&ldquo;{title}&rdquo;</span>...
            </p>
            <div className="mt-5 pt-4 border-t border-slate-100 w-full flex flex-col items-center gap-2">
              <span className="text-[11px] text-slate-400">
                Large publication file loading
              </span>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#059669] hover:text-[#047857] transition-colors"
              >
                <span>Open directly in new tab</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Error Fallback */}
      {status === "error" && (
        <div
          role="alert"
          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white p-6 text-center"
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-3">
            <AlertCircle size={24} />
          </div>
          <h4 className="font-heading text-lg font-semibold text-slate-800">
            Unable to preview PDF inline
          </h4>
          <p className="mt-1.5 max-w-md text-xs sm:text-sm text-slate-500 leading-relaxed">
            Your browser or network prevented embedding this digital edition directly. You can retry loading or open the publication in a new tab.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Retry Loading</span>
            </button>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-white bg-[#059669] hover:bg-[#047857] transition-colors cursor-pointer shadow-sm"
            >
              <span>Open in New Tab</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      )}

      {/* PDF Iframe */}
      <iframe
        src={pdfUrl}
        title={`Read ${title} online`}
        className="h-full w-full border-0"
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
      />
    </div>
  );
}

export default function PDFViewerPlaceholder({ pdfUrl, title }: PDFViewerPlaceholderProps) {
  const [retryCount, setRetryCount] = useState(0);

  if (!pdfUrl) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-xl border border-[#E2E8F0] bg-white px-6 text-center shadow-sm sm:h-[500px] lg:h-[600px]">
        <BookOpen className="size-8 text-slate-300 mb-3" />
        <p className="font-heading text-lg text-slate-800">PDF not available</p>
        <p className="mt-2 max-w-md text-sm font-light text-slate-500">
          This issue does not have a PDF file attached yet. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Mobile helper notice for optimal reading experience */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-sm">
        <div className="flex items-center gap-3">
          <BookOpen className="size-5 text-[#059669] shrink-0" />
          <p className="text-xs sm:text-sm text-slate-600">
            For the optimal reading experience on mobile, view or download the edition directly.
          </p>
        </div>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-white bg-[#059669] hover:bg-[#047857] transition-colors shrink-0 cursor-pointer shadow-sm"
        >
          <span>Open Full PDF</span>
          <ExternalLink className="size-3.5" />
        </a>
      </div>

      <PDFViewerFrame
        key={`${pdfUrl}-${retryCount}`}
        pdfUrl={pdfUrl}
        title={title}
        onRetry={() => setRetryCount((c) => c + 1)}
      />
    </div>
  );
}
