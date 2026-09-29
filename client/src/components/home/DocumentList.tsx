import { useQuery } from "@tanstack/react-query";
import { getAllDocuments } from "../../lib/storage";
import DocumentListItem from "./DocumentListItem";
import { Loader2, Library } from "lucide-react";

export default function DocumentList() {
  const { data: documents, isLoading } = useQuery({
    queryKey: ["localDocuments"],
    queryFn: getAllDocuments,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-teal" />
      </div>
    );
  }

  if (!documents || documents.length === 0) return null;

  return (
    <div className="w-full">
      <div className="mb-5 flex items-center justify-between rounded-2xl border border-border/60 bg-white/55 px-4 py-3 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal/10 text-teal">
            <Library className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-charcoal-light">Your workspace</span>
        </div>
        <span className="rounded-full bg-cream-dark px-2.5 py-1 text-[11px] font-medium text-charcoal-light">{documents.length} file{documents.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {documents.map((doc) => (
          <DocumentListItem key={doc.documentId} document={doc} />
        ))}
      </div>
    </div>
  );
}
