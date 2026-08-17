import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Loader2, AlertCircle } from "lucide-react";
import PdfViewer from "../components/workspace/pdf/PdfViewer";
import ChatPanel from "../components/workspace/chat/ChatPanel";
import { getDocument, type LocalDocument } from "../lib/storage";

export default function Workspace() {
  const { documentId } = useParams<{ documentId: string }>();
  const [document, setDocument] = useState<LocalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfTargetPage, setPdfTargetPage] = useState<number | undefined>(undefined);

  const handleNavigateToPage = useCallback((page: number) => {
    // Use a micro-reset to ensure the same page can be navigated to again
    setPdfTargetPage(undefined);
    // Use requestAnimationFrame to ensure React processes the reset before setting the new value
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
      <div className="flex-1 flex flex-col items-center justify-center bg-cream text-charcoal">
        <Loader2 className="w-8 h-8 animate-spin text-teal mb-4" />
        <p className="font-light">Loading workspace...</p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-cream text-charcoal">
        <AlertCircle className="w-10 h-10 mb-4 text-red-500 stroke-[1.5]" />
        <h2 className="text-xl font-serif text-charcoal mb-2">Document not found</h2>
        <p className="text-sm font-light mb-6 max-w-md text-center text-charcoal-light">
          This document could not be found in your local browser storage. It may have been cleared or uploaded on another device.
        </p>
        <Link 
          to="/"
          className="px-6 py-2.5 text-sm font-medium text-cream bg-charcoal hover:bg-forest rounded-full transition-colors shadow-sm"
        >
          Back to Library
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-cream">
      {/* Mobile Header (Hidden on Desktop) */}
      <div className="md:hidden flex items-center px-4 h-14 border-b border-border/60 bg-cream shrink-0">
        <Link to="/" className="text-charcoal-light hover:text-charcoal mr-3 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-sm font-medium text-charcoal truncate">
          {document.originalName}
        </h1>
      </div>

      {/* PDF Viewer Pane */}
      <div className="flex-1 md:w-1/2 md:border-r border-border/60 flex flex-col min-h-0 relative">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center px-6 h-14 border-b border-border/60 bg-cream/90 backdrop-blur-sm shrink-0 absolute top-0 left-0 right-0 z-10">
          <Link to="/" className="text-charcoal-light hover:text-charcoal mr-3 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-[13px] font-medium text-charcoal truncate">
            {document.originalName}
          </h1>
        </div>
        
        {/* Container for PDF Viewer, pushing it down below the absolute header on desktop */}
        <div className="flex-1 md:pt-14 min-h-0 flex flex-col bg-cream-dark">
          <PdfViewer file={document.file} goToPage={pdfTargetPage} />
        </div>
      </div>

      {/* Chat Pane */}
      <div className="flex-1 md:w-1/2 flex flex-col min-h-0 bg-cream">
        <ChatPanel documentId={document.documentId} onNavigateToPage={handleNavigateToPage} />
      </div>
    </div>
  );
}
