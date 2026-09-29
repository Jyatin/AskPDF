import { useState, useMemo, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize, AlertCircle, Loader2, FileText } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface Props {
  file: Blob | File;
  goToPage?: number;
}

export default function PdfViewer({ file, goToPage }: Props) {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  const fileUrl = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    if (goToPage && goToPage >= 1 && (!numPages || goToPage <= numPages)) setPageNumber(goToPage);
  }, [goToPage, numPages]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset: number) => setPageNumber((prev) => Math.min(Math.max(1, prev + offset), numPages || 1));
  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const resetZoom = () => setScale(1.0);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#EEECE5]">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/70 bg-cream/85 px-3 backdrop-blur-xl md:px-5">
        <div className="flex items-center gap-1.5">
          <div className="mr-1 hidden items-center gap-2 rounded-full bg-white/70 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-charcoal-light shadow-sm sm:flex">
            <FileText className="h-3 w-3 text-teal" /> Reader
          </div>
          <button
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
            aria-label="Previous page"
            className="flex h-8 w-8 items-center justify-center rounded-full text-charcoal-light transition-all hover:bg-white hover:text-charcoal hover:shadow-sm disabled:opacity-25"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[64px] rounded-full bg-white/70 px-2 py-1.5 text-center text-[10px] font-semibold tracking-[0.08em] text-charcoal shadow-sm">
            {pageNumber} <span className="text-charcoal-light/50">/</span> {numPages || "-"}
          </span>
          <button
            onClick={() => changePage(1)}
            disabled={pageNumber >= (numPages || 1)}
            aria-label="Next page"
            className="flex h-8 w-8 items-center justify-center rounded-full text-charcoal-light transition-all hover:bg-white hover:text-charcoal hover:shadow-sm disabled:opacity-25"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-0.5 rounded-full border border-border/70 bg-white/70 p-1 shadow-sm backdrop-blur-sm">
          <button onClick={zoomOut} aria-label="Zoom out" className="flex h-7 w-7 items-center justify-center rounded-full text-charcoal-light transition hover:bg-cream-dark hover:text-charcoal">
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button onClick={resetZoom} aria-label="Reset zoom" className="min-w-[46px] rounded-full px-2 py-1 text-[9px] font-semibold tracking-[0.08em] text-charcoal transition hover:bg-cream-dark">
            {Math.round(scale * 100)}%
          </button>
          <button onClick={zoomIn} aria-label="Zoom in" className="flex h-7 w-7 items-center justify-center rounded-full text-charcoal-light transition hover:bg-cream-dark hover:text-charcoal">
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <div className="mx-1 h-4 w-px bg-border" />
          <button onClick={resetZoom} aria-label="Fit page" className="flex h-7 w-7 items-center justify-center rounded-full text-charcoal-light transition hover:bg-cream-dark hover:text-charcoal">
            <Maximize className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 justify-center overflow-auto px-4 py-8 md:px-8 md:py-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/[0.035] to-transparent" />
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="animate-askpdf-pulse-ring mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-teal shadow-lg">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
              <span className="text-xs font-medium text-charcoal">Loading document</span>
              <span className="mt-1 text-[10px] text-charcoal-light">Rendering your reading view…</span>
            </div>
          }
          error={
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
                <AlertCircle className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-charcoal">Failed to load PDF</span>
              <span className="mt-1 text-xs text-charcoal-light">Try reopening the document.</span>
            </div>
          }
          className="relative bg-white shadow-[0_20px_55px_rgba(23,23,22,0.16)] ring-1 ring-black/10"
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="bg-white"
          />
        </Document>
      </div>
    </div>
  );
}
