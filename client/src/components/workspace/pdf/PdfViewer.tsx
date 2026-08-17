import { useState, useMemo, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize, AlertCircle, Loader2 } from "lucide-react";

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

  // Navigate to page when goToPage prop changes
  useEffect(() => {
    if (goToPage && goToPage >= 1 && (!numPages || goToPage <= numPages)) {
      setPageNumber(goToPage);
    }
  }, [goToPage, numPages]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset: number) => {
    setPageNumber((prev) => Math.min(Math.max(1, prev + offset), numPages || 1));
  };

  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const resetZoom = () => setScale(1.0);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 h-12 border-b border-border/60 bg-cream-dark shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
            className="p-1.5 text-charcoal-light hover:text-charcoal hover:bg-black/5 rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-charcoal min-w-[60px] text-center tracking-wide">
            {pageNumber} / {numPages || "-"}
          </span>
          <button
            onClick={() => changePage(1)}
            disabled={pageNumber >= (numPages || 1)}
            className="p-1.5 text-charcoal-light hover:text-charcoal hover:bg-black/5 rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-1">
          <button onClick={zoomOut} className="p-1.5 text-charcoal-light hover:text-charcoal hover:bg-black/5 rounded-md transition-colors">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-charcoal min-w-[50px] text-center tracking-wide">
            {Math.round(scale * 100)}%
          </span>
          <button onClick={zoomIn} className="p-1.5 text-charcoal-light hover:text-charcoal hover:bg-black/5 rounded-md transition-colors">
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-border/80 mx-2" />
          <button onClick={resetZoom} className="p-1.5 text-charcoal-light hover:text-charcoal hover:bg-black/5 rounded-md transition-colors">
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF Container */}
      <div className="flex-1 overflow-auto flex justify-center py-8 px-4 relative">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="absolute inset-0 flex flex-col items-center justify-center text-teal">
              <Loader2 className="w-6 h-6 animate-spin mb-3" />
              <span className="text-sm font-light text-charcoal">Loading document...</span>
            </div>
          }
          error={
            <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500">
              <AlertCircle className="w-8 h-8 mb-3 stroke-[1.5]" />
              <span className="text-sm font-medium">Failed to load PDF</span>
            </div>
          }
          className="bg-white shadow-sm ring-1 ring-black/5"
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
