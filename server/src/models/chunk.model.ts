import { Schema, model, Types } from "mongoose";

// ─── Interface ───────────────────────────────────────────

interface IChunk {
  documentId: Types.ObjectId;
  content: string;
  chunkIndex: number;
  startOffset: number;
  endOffset: number;
  tokenEstimate: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────────

const chunkSchema = new Schema<IChunk>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: [true, "Document ID is required"],
      index: true,
    },
    content: {
      type: String,
      required: [true, "Chunk content is required"],
    },
    chunkIndex: {
      type: Number,
      required: [true, "Chunk index is required"],
      min: [0, "Chunk index cannot be negative"],
    },
    startOffset: {
      type: Number,
      required: [true, "Start offset is required"],
      min: [0, "Start offset cannot be negative"],
    },
    endOffset: {
      type: Number,
      required: [true, "End offset is required"],
      min: [0, "End offset cannot be negative"],
    },
    tokenEstimate: {
      type: Number,
      required: [true, "Token estimate is required"],
      min: [0, "Token estimate cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient lookup by document + ordering
chunkSchema.index({ documentId: 1, chunkIndex: 1 }, { unique: true });

// ─── Model ───────────────────────────────────────────────

const Chunk = model<IChunk>("Chunk", chunkSchema);

export { Chunk, IChunk };
