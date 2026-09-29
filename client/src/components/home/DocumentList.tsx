import { useQuery } from "@tanstack/react-query";
import { getAllDocuments } from "../../lib/storage";
import DocumentListItem from "./DocumentListItem";
import { Loader2 } from "lucide-react";

export default function DocumentList() {
  const { data: documents, isLoading } = useQuery({
    queryKey: ["localDocuments"],
    queryFn: getAllDocuments,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-teal" />
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex items-baseline justify-between">
        <h2 className="text-2xl font-serif text-charcoal">Recent Documents</h2>
        <span className="text-sm text-charcoal-light font-light">{documents.length} item{documents.length !== 1 && 's'}</span>
      </div>
      <div className="flex flex-col border-t border-border/60">
        {documents.map((doc) => (
          <DocumentListItem key={doc.documentId} document={doc} />
        ))}
      </div>
    </div>
  );
}
