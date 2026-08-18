import { useQuery } from "@tanstack/react-query";
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
    <div className="flex-1 w-full flex flex-col relative bg-cream">
      {/* Background Video Section */}
      <div className={`relative flex flex-col items-center justify-center w-full px-6 transition-all duration-700 ease-in-out ${hasDocuments ? "py-24" : "flex-1 min-h-[calc(100vh-4rem)]"}`}>
        
        {/* Video Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-cream">
          <div className="absolute inset-0 bg-cream/50 z-10" />
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-center opacity-40 mix-blend-multiply"
          >
            <source src="/videos/askpdf-hero.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Hero Content */}
        <div className="relative z-20 text-center max-w-3xl mx-auto w-full flex flex-col items-center">
          <h1 className="font-serif text-5xl md:text-7xl text-forest tracking-tight mb-6">
            Your PDFs, understood.
          </h1>
          <p className="text-lg md:text-xl text-charcoal-light max-w-xl mx-auto mb-10 font-sans font-light">
            Upload your documents and let intelligent AI reading assistance uncover insights, answer questions, and summarize knowledge instantly.
          </p>
          
          <div className="w-full max-w-xl mx-auto">
            <UploadZone />
          </div>
        </div>
      </div>

      {/* Documents Section */}
      {hasDocuments && (
        <div className="relative z-20 bg-cream-dark flex-1 w-full border-t border-border/60">
          <div className="w-full max-w-3xl mx-auto py-16 px-6">
            <DocumentList />
          </div>
        </div>
      )}
    </div>
  );
}
