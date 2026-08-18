import { useState, useRef } from "react";
import { UploadCloud, AlertCircle, Loader2 } from "lucide-react";
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
      // Save to local IndexedDB
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "relative flex flex-col items-center justify-center p-10 md:p-14 border rounded-2xl transition-all duration-300 ease-out cursor-pointer overflow-hidden",
          isDragging 
            ? "border-teal bg-teal/5 ring-4 ring-teal/10 scale-[1.02]" 
            : "border-border/80 bg-white/60 backdrop-blur-md shadow-sm hover:shadow-md hover:border-teal/30 hover:bg-white/90",
          uploadMutation.isPending && "opacity-70 pointer-events-none scale-100"
        )}
        onClick={() => !uploadMutation.isPending && fileInputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="application/pdf"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        {uploadMutation.isPending ? (
          <div className="flex flex-col items-center text-charcoal">
            <Loader2 className="w-8 h-8 mb-4 animate-spin text-teal" />
            <p className="text-sm font-medium">Processing document...</p>
            <p className="text-xs text-charcoal-light mt-1 font-light">Extracting text and generating embeddings</p>
          </div>
        ) : uploadMutation.isError ? (
          <div className="flex flex-col items-center text-red-600">
            <AlertCircle className="w-8 h-8 mb-4 text-red-500 stroke-[1.5]" />
            <p className="text-sm font-medium">Upload failed</p>
            <p className="text-xs text-red-500/80 mt-1">{uploadMutation.error?.message || "An unexpected error occurred."}</p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                uploadMutation.reset();
              }}
              className="mt-5 text-xs font-medium bg-red-50 text-red-600 px-4 py-2 rounded-full hover:bg-red-100 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-charcoal">
            <div className="w-12 h-12 mb-5 rounded-full bg-cream-dark border border-border/50 flex items-center justify-center shadow-sm">
              <UploadCloud className="w-5 h-5 text-charcoal-light stroke-[1.5]" />
            </div>
            <p className="text-[15px] font-medium text-charcoal mb-1">Click to browse or drag PDF here</p>
            <p className="text-xs text-charcoal-light mb-6 font-light">Maximum file size 20 MB</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="px-6 py-2.5 text-sm font-medium text-cream bg-charcoal hover:bg-forest rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2 focus:ring-offset-cream shadow-sm"
            >
              Select Document
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
