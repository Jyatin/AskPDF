import { Schema, model } from "mongoose";

// ─── Enums ───────────────────────────────────────────────

enum ProcessingStatus {
  PENDING = "pending",
  UPLOADED = "uploaded",
  EXTRACTING = "extracting",
  EXTRACTED = "extracted",
  CHUNKING = "chunking",
  CHUNKED = "chunked",
  EMBEDDING = "embedding",
  READY = "ready",
  FAILED = "failed",
}

// ─── Interface ───────────────────────────────────────────

interface IDocument {
  originalName: string;
  storedName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  pageCount: number;
  textLength: number;
  extractedText: string;
  chunkCount: number;
  processingStatus: ProcessingStatus;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────────

const documentSchema = new Schema<IDocument>(
  {
    originalName: {
      type: String,
      required: [true, "Original filename is required"],
      trim: true,
      maxlength: [500, "Filename cannot exceed 500 characters"],
    },
    storedName: {
      type: String,
      required: [true, "Stored filename is required"],
      unique: true,
      trim: true,
    },
    filePath: {
      type: String,
      required: [true, "File path is required"],
    },
    mimeType: {
      type: String,
      required: [true, "MIME type is required"],
      enum: {
        values: ["application/pdf"],
        message: "Only PDF files are supported",
      },
    },
    fileSize: {
      type: Number,
      required: [true, "File size is required"],
      min: [1, "File size must be greater than 0"],
    },
    pageCount: {
      type: Number,
      default: 0,
      min: [0, "Page count cannot be negative"],
    },
    textLength: {
      type: Number,
      default: 0,
      min: [0, "Text length cannot be negative"],
    },
    extractedText: {
      type: String,
      default: "",
    },
    chunkCount: {
      type: Number,
      default: 0,
      min: [0, "Chunk count cannot be negative"],
    },
    processingStatus: {
      type: String,
      enum: {
        values: Object.values(ProcessingStatus),
        message: "Invalid processing status: {VALUE}",
      },
      default: ProcessingStatus.PENDING,
      index: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Model ───────────────────────────────────────────────

const Document = model<IDocument>("Document", documentSchema);

export { Document, IDocument, ProcessingStatus };
