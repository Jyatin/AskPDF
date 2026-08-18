import { Outlet, Link } from "react-router-dom";
import { Upload } from "lucide-react";

export default function AppShell() {
  return (
    <div className="min-h-screen flex flex-col bg-cream text-charcoal selection:bg-teal selection:text-white">
      <header className="h-16 flex items-center justify-between px-8 shrink-0 relative z-50">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="font-serif text-2xl tracking-tight text-forest group-hover:text-teal transition-colors">
            AskPDF
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link 
            to="/" 
            className="text-sm font-medium text-charcoal-light hover:text-charcoal transition-colors"
          >
            Dashboard
          </Link>
          <Link 
            to="/" 
            className="flex items-center gap-2 text-sm font-medium bg-charcoal text-cream px-4 py-2 rounded-full hover:bg-forest transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col min-h-0 relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
