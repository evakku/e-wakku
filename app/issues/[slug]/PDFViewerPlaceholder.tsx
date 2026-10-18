"use client";

import { ExternalLink, BookOpen } from "lucide-react";

interface PDFViewerPlaceholderProps {
  pdfUrl?: string;
  title: string;
}

export default function PDFViewerPlaceholder({ pdfUrl, title }: PDFViewerPlaceholderProps) {
  if (!pdfUrl) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-xl border border-[#E2E8F0] bg-white px-6 text-center shadow-sm sm:h-[500px] lg:h-[600px]">
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
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-white bg-[#059669] hover:bg-[#047857] transition-colors shrink-0"
        >
          <span>Open Full PDF</span>
          <ExternalLink className="size-3.5" />
        </a>
      </div>

      <div className="relative h-[400px] w-full overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm sm:h-[500px] lg:h-[700px]">
        <iframe
          key={pdfUrl}
          src={pdfUrl}
          title={`Read ${title} online`}
          className="h-full w-full border-0"
        />
      </div>
    </div>
  );
}
