import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Loader2, AlertCircle, Sparkles, PanelRight } from "lucide-react";
import PdfViewer from "../components/workspace/pdf/PdfViewer";
import ChatPanel from "../components/workspace/chat/ChatPanel";
import { getDocument, type LocalDocument } from "../lib/storage";

export default function Workspace() {
  const { documentId } = useParams<{ documentId: string }>();
  const [document, setDocument] = useState<LocalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfTargetPage, setPdfTargetPage] = useState<number | undefined>(undefined);

  const handleNavigateToPage = useCallback((page: number) => {
    setPdfTargetPage(undefined);
    requestAnimationFrame(() => setPdfTargetPage(page));
  }, []);

  useEffect(() => {
    async function loadDoc() {
      if (!documentId) return;
      try {
        const doc = await getDocument(documentId);
        setDocument(doc);
      } catch (err) {
        console.error("Failed to load document from IndexedDB", err);
      } finally {
        setLoading(false);
      }
    }
    loadDoc();
  }, [documentId]);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-cream">
        <div className="animate-askpdf-pulse-ring mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-charcoal text-cream">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
        <p className="text-sm font-medium text-charcoal">Opening your workspace</p>
        <p className="mt-1 text-xs text-charcoal-light">Loading the document locally…</p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-cream px-6 text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
          <AlertCircle className="h-6 w-6" strokeWidth={1.6} />
        </div>
        <h2 className="font-serif text-3xl tracking-tight text-charcoal">Document not found</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-charcoal-light">
          This document is not available in your local browser storage. It may have been cleared or uploaded on another device.
        </p>
        <Link to="/" className="mt-7 rounded-full bg-charcoal px-5 py-2.5 text-sm font-semibold text-cream shadow-lg transition hover:bg-forest">
          Back to library
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#EEECE5]">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/70 bg-cream/90 px-3 backdrop-blur-xl md:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <Link to="/" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-charcoal-light transition hover:bg-white hover:text-charcoal">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div className="hidden h-5 w-px bg-border sm:block" />
          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold text-charcoal">{document.originalName}</p>
            <p className="hidden text-[9px] font-medium uppercase tracking-[0.15em] text-charcoal-light/60 sm:block">Document workspace</p>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-teal/15 bg-teal/5 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-teal sm:flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal" />
          AI ready
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="relative flex min-h-0 flex-1 flex-col border-b border-border/70 md:w-1/2 md:border-b-0 md:border-r">
          <div className="absolute left-4 top-3 z-20 hidden items-center gap-2 rounded-full border border-white/80 bg-white/75 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-charcoal-light shadow-sm backdrop-blur-md lg:flex">
            <FileBadge />
            Document
          </div>
          <PdfViewer file={document.file} goToPage={pdfTargetPage} />
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col bg-cream md:w-1/2">
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-border/60 bg-cream/90 px-4 backdrop-blur-xl md:px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-charcoal text-cream">
                <Sparkles className="h-3 w-3" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-charcoal">AskPDF AI</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-medium text-charcoal-light/60">
              <PanelRight className="h-3.5 w-3.5" />
              Grounded chat
            </div>
          </div>
          <ChatPanel documentId={document.documentId} onNavigateToPage={handleNavigateToPage} />
        </div>
      </div>
    </div>
  );
}

function FileBadge() {
  return <span className="h-2 w-2 rounded-[2px] bg-teal" />;
}
