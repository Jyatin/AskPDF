import { useQuery } from "@tanstack/react-query";
import { ArrowDown, BookOpen, FileText, ShieldCheck, Sparkles } from "lucide-react";
import { getAllDocuments, type LocalDocument } from "../lib/storage";
import UploadZone from "../components/home/UploadZone";
import DocumentList from "../components/home/DocumentList";

export default function Home() {
  const { data: documents } = useQuery<LocalDocument[]>({
    queryKey: ["localDocuments"],
    queryFn: getAllDocuments,
  });

  const hasDocuments = documents && documents.length > 0;

  return (
    <div className="flex-1 w-full overflow-x-hidden bg-cream">
      <section className={`relative isolate flex w-full flex-col items-center justify-center overflow-hidden px-5 md:px-8 ${hasDocuments ? "min-h-[640px] py-24 md:py-28" : "min-h-[calc(100vh-4.5rem)] py-20"}`}>
        <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
          <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-teal/10 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-yellow/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.9),transparent_45%)]" />
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover opacity-[0.07] mix-blend-multiply"
          >
            <source src="/videos/askpdf-hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(rgba(22,48,43,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(22,48,43,.08)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center">
          <div className="animate-askpdf-fade-up mb-7 inline-flex items-center gap-2 rounded-full border border-teal/15 bg-white/70 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-teal shadow-sm backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            Intelligent document workspace
          </div>

          <h1 className="animate-askpdf-fade-up [animation-delay:80ms] font-serif text-[clamp(3.4rem,9vw,7rem)] leading-[0.9] tracking-[-0.04em] text-forest">
            Read less.<br />Understand more.
          </h1>
          <p className="animate-askpdf-fade-up [animation-delay:160ms] mt-7 max-w-2xl text-base leading-7 text-charcoal-light md:text-lg md:leading-8">
            AskPDF turns dense documents into an intelligent reading space. Upload a PDF, explore every page, and ask questions grounded in your document.
          </p>

          <div className="animate-askpdf-fade-up [animation-delay:240ms] mt-10 w-full max-w-2xl">
            <UploadZone />
          </div>

          <div className="animate-askpdf-fade-up [animation-delay:320ms] mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-medium uppercase tracking-[0.15em] text-charcoal-light/70">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-teal" /> Private by design</span>
            <span className="hidden h-3 w-px bg-border sm:block" />
            <span className="inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-teal" /> PDF up to 20 MB</span>
            <span className="hidden h-3 w-px bg-border sm:block" />
            <span className="inline-flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-teal" /> Page-aware answers</span>
          </div>
        </div>

        {!hasDocuments && (
          <div className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal-light/50 md:flex">
            Scroll to explore <ArrowDown className="h-3 w-3 animate-bounce" />
          </div>
        )}
      </section>

      {hasDocuments && (
        <section className="relative border-t border-border/60 bg-cream-dark/70 px-5 py-16 md:px-8 md:py-20">
          <div className="mx-auto w-full max-w-5xl">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-teal">Your library</p>
                <h2 className="font-serif text-4xl tracking-tight text-charcoal md:text-5xl">Recent documents</h2>
              </div>
              <p className="text-sm text-charcoal-light">{documents.length} document{documents.length !== 1 ? "s" : ""} in your workspace</p>
            </div>
            <DocumentList />
          </div>
        </section>
      )}
    </div>
  );
}
