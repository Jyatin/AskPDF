import { Outlet, Link, useLocation } from "react-router-dom";
import { Upload, Sparkles } from "lucide-react";

export default function AppShell() {
  const location = useLocation();
  const isWorkspace = location.pathname.startsWith("/workspace");

  return (
    <div className="min-h-screen flex flex-col bg-cream text-charcoal selection:bg-teal selection:text-white">
      <header className="h-16 md:h-[72px] flex items-center justify-between px-4 md:px-8 shrink-0 relative z-50 border-b border-border/50 bg-cream/80 backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-charcoal text-cream shadow-[0_8px_24px_rgba(23,23,22,0.16)] transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
            <Sparkles className="h-4 w-4" strokeWidth={1.8} />
          </div>
          <div className="leading-none">
            <span className="font-serif text-[26px] tracking-tight text-forest">AskPDF</span>
            <span className="ml-2 hidden text-[9px] font-semibold uppercase tracking-[0.22em] text-teal/70 sm:inline-block">AI Reader</span>
          </div>
        </Link>

        <div className="flex items-center gap-2 md:gap-5">
          <Link
            to="/"
            className={`rounded-full px-3 py-2 text-xs md:text-sm font-medium transition-all ${
              !isWorkspace ? "bg-white text-charcoal shadow-sm ring-1 ring-border/60" : "text-charcoal-light hover:bg-white/70 hover:text-charcoal"
            }`}
          >
            Library
          </Link>
          <Link
            to="/"
            className="group flex items-center gap-2 rounded-full bg-charcoal px-3.5 py-2.5 text-xs md:text-sm font-semibold text-cream shadow-[0_8px_24px_rgba(23,23,22,0.15)] transition-all hover:-translate-y-0.5 hover:bg-forest hover:shadow-[0_12px_28px_rgba(22,48,43,0.2)]"
          >
            <Upload className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
            <span>Upload PDF</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col min-h-0 relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
