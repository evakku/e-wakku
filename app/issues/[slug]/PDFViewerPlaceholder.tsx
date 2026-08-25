"use client";

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
    <div className="relative h-[400px] w-full overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm sm:h-[500px] lg:h-[700px]">
      <iframe
        key={pdfUrl}
        src={pdfUrl}
        title={`Read ${title} online`}
        className="h-full w-full border-0"
      />
    </div>
  );
}
