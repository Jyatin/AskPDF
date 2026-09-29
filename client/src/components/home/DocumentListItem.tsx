import { Link } from "react-router-dom";
import { ArrowUpRight, FileText, Layers3 } from "lucide-react";
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
      className="group relative overflow-hidden rounded-2xl border border-border/70 bg-white/65 p-4 shadow-[0_8px_30px_rgba(23,23,22,0.04)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal/25 hover:bg-white hover:shadow-[0_18px_45px_rgba(23,23,22,0.09)]"
    >
      <div className="absolute -right-10 -top-12 h-28 w-28 rounded-full bg-teal/5 blur-2xl transition-transform duration-500 group-hover:scale-150" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-cream-dark text-teal transition-all duration-300 group-hover:border-teal/20 group-hover:bg-teal/10">
            <FileText className="h-5 w-5" strokeWidth={1.6} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-charcoal transition-colors group-hover:text-forest">{document.originalName}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-[0.08em] text-charcoal-light/70">
              <span>{formattedDate}</span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span>{sizeMb} MB</span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span>{document.pageCount} page{document.pageCount !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-white text-charcoal-light transition-all duration-300 group-hover:border-teal/20 group-hover:bg-teal group-hover:text-white">
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-6" />
        </div>
      </div>
      <div className="relative mt-4 flex items-center gap-2 border-t border-border/50 pt-3 text-[10px] font-medium text-charcoal-light/70">
        <Layers3 className="h-3.5 w-3.5 text-teal/70" />
        <span>Open intelligent reading workspace</span>
      </div>
    </Link>
  );
}
