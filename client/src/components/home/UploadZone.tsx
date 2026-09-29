import { useState, useRef } from "react";
import { UploadCloud, AlertCircle, Loader2, FileUp, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { uploadDocumentApi } from "../../lib/api";
import { saveDocument } from "../../lib/storage";
import { cn } from "../../lib/utils";

export default function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const response = await uploadDocumentApi(file);
      await saveDocument({
        documentId: response.document.id,
        originalName: response.document.originalName,
        fileSize: response.document.fileSize,
        uploadedAt: new Date(response.document.uploadedAt),
        processingStatus: response.document.processingStatus,
        pageCount: response.document.pageCount,
        file: file,
      });
      return response.document.id;
    },
    onSuccess: (documentId) => {
      navigate(`/workspace/${documentId}`);
    },
  });

  const handleFile = (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      alert("File size exceeds the 20 MB limit.");
      return;
    }
    uploadMutation.mutate(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) handleFile(e.dataTransfer.files[0]);
  };

  const openPicker = () => {
    if (!uploadMutation.isPending) fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "group relative overflow-hidden rounded-[28px] border p-1 transition-all duration-500",
          isDragging
            ? "scale-[1.01] border-teal/50 bg-teal/5 shadow-[0_24px_70px_rgba(42,96,91,0.15)]"
            : "border-border/80 bg-white/45 shadow-[0_24px_80px_rgba(23,23,22,0.08)] hover:-translate-y-1 hover:border-teal/25 hover:shadow-[0_30px_90px_rgba(23,23,22,0.12)]",
          uploadMutation.isPending && "pointer-events-none"
        )}
        onClick={openPicker}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="relative overflow-hidden rounded-[23px] border border-white/80 bg-white/70 px-6 py-8 backdrop-blur-xl md:px-10 md:py-10">
          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-teal/10 blur-3xl transition-transform duration-700 group-hover:scale-125" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-yellow/10 blur-3xl" />

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="application/pdf"
            onChange={(e) => {
              if (e.target.files?.length) handleFile(e.target.files[0]);
              e.currentTarget.value = "";
            }}
          />

          {uploadMutation.isPending ? (
            <div className="relative flex min-h-[180px] flex-col items-center justify-center text-charcoal">
              <div className="animate-askpdf-pulse-ring mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-charcoal text-cream shadow-lg">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
              <p className="text-sm font-semibold">Preparing your document</p>
              <p className="mt-2 text-xs text-charcoal-light">Uploading securely · this may take a moment</p>
              <div className="mt-5 h-1.5 w-48 overflow-hidden rounded-full bg-cream-dark">
                <div className="askpdf-shimmer h-full w-full rounded-full" />
              </div>
            </div>
          ) : uploadMutation.isError ? (
            <div className="relative flex min-h-[180px] flex-col items-center justify-center text-red-600">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 ring-1 ring-red-100">
                <AlertCircle className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold">We couldn't upload that PDF</p>
              <p className="mt-2 max-w-sm text-center text-xs leading-5 text-red-500/80">{uploadMutation.error?.message || "An unexpected error occurred. Please try again."}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  uploadMutation.reset();
                }}
                className="mt-5 rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="relative flex min-h-[180px] flex-col items-center justify-center text-charcoal">
              <div className="relative mb-5">
                <div className="absolute inset-0 rounded-2xl bg-teal/10 blur-xl transition-all duration-500 group-hover:scale-125" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-charcoal text-cream shadow-[0_14px_30px_rgba(23,23,22,0.16)] transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-2">
                  <FileUp className="h-6 w-6" strokeWidth={1.7} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-base font-semibold tracking-tight">Drop your PDF here</p>
                <Sparkles className="h-3.5 w-3.5 text-teal" />
              </div>
              <p className="mt-2 text-sm text-charcoal-light">or choose a file from your device</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openPicker();
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-charcoal px-5 py-2.5 text-sm font-semibold text-cream shadow-lg shadow-charcoal/10 transition-all hover:-translate-y-0.5 hover:bg-forest hover:shadow-xl"
              >
                <UploadCloud className="h-4 w-4" />
                Select PDF
              </button>
              <div className="mt-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-charcoal-light/60">
                <span>PDF only</span><span className="h-1 w-1 rounded-full bg-border" /><span>20 MB max</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
