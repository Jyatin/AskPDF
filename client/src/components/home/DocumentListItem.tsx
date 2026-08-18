import { Link } from "react-router-dom";
import { FileText, ArrowRight } from "lucide-react";
import type { LocalDocument } from "../../lib/storage";

interface Props {
  document: LocalDocument;
}

export default function DocumentListItem({ document }: Props) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(document.uploadedAt));

  const sizeMb = (document.fileSize / (1024 * 1024)).toFixed(2);

  return (
    <Link
      to={`/workspace/${document.documentId}`}
      className="group flex items-center justify-between py-4 px-2 border-b border-border/60 hover:bg-black/5 transition-colors duration-200 rounded-sm"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-white border border-border/50 flex items-center justify-center shrink-0 shadow-sm group-hover:border-teal/30 group-hover:bg-teal/5 transition-colors">
          <FileText className="w-4 h-4 text-charcoal-light group-hover:text-teal transition-colors stroke-[1.5]" />
        </div>
        <div className="flex flex-col">
          <span className="text-[15px] font-medium text-charcoal group-hover:text-teal transition-colors line-clamp-1">
            {document.originalName}
          </span>
          <div className="flex items-center gap-2 text-xs text-charcoal-light mt-1 font-light tracking-wide">
            <span>{formattedDate}</span>
            <span className="w-1 h-1 rounded-full bg-border"></span>
            <span>{sizeMb} MB</span>
            <span className="w-1 h-1 rounded-full bg-border"></span>
            <span>{document.pageCount} page{document.pageCount !== 1 && 's'}</span>
          </div>
        </div>
      </div>
      <div className="pr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        <ArrowRight className="w-4 h-4 text-teal" />
      </div>
    </Link>
  );
}
