import mongoose from "mongoose";
import { Document, ProcessingStatus } from "../models/document.model";
import { Chunk } from "../models/chunk.model";
import {
  CHUNK_SIZE,
  CHUNK_OVERLAP,
  SPLIT_SEPARATORS,
} from "../constants/chunking";

// ─── Types ───────────────────────────────────────────────

interface ChunkData {
  content: string;
  chunkIndex: number;
  startOffset: number;
  endOffset: number;
  tokenEstimate: number;
}

// ─── Pure Splitting Logic ────────────────────────────────

/**
 * Split `text` on the given `separator`.
 * When separator is "" (character-level), each character becomes its own element.
 */
const splitOnSeparator = (text: string, separator: string): string[] => {
  if (separator === "") {
    return text.split("");
  }
  return text.split(separator);
};

/**
 * Rough token estimate: ~4 characters per token (GPT / Gemini ballpark).
 */
const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

/**
 * Recursively split `text` into chunks of at most `chunkSize` characters,
 * trying separators from most-meaningful to least-meaningful.
 *
 * This is a pure function with no side effects.
 */
const recursiveSplit = (
  text: string,
  chunkSize: number,
  separators: readonly string[]
): string[] => {
  // Base case: text already fits
  if (text.length <= chunkSize) {
    const trimmed = text.trim();
    return trimmed.length > 0 ? [trimmed] : [];
  }

  // Find the first separator that actually appears in the text
  const separator = separators.find((sep) => {
    if (sep === "") return true; // character-level always works
    return text.includes(sep);
  });

  // Safety — should never happen since "" is always in the list
  if (separator === undefined) {
    return [text.trim()];
  }

  const parts = splitOnSeparator(text, separator);
  const remainingSeparators = separators.slice(separators.indexOf(separator) + 1);

  const chunks: string[] = [];
  let currentPiece = "";

  for (const part of parts) {
    // What the current piece would look like if we appended this part
    const candidate =
      currentPiece.length === 0
        ? part
        : currentPiece + separator + part;

    if (candidate.length <= chunkSize) {
      currentPiece = candidate;
    } else {
      // Flush the current piece if it has content
      if (currentPiece.length > 0) {
        const trimmed = currentPiece.trim();
        if (trimmed.length > 0) {
          chunks.push(trimmed);
        }
      }

      // If this single part is still too large, recurse with finer separators
      if (part.length > chunkSize) {
        const subChunks = recursiveSplit(part, chunkSize, remainingSeparators);
        chunks.push(...subChunks);
        currentPiece = "";
      } else {
        currentPiece = part;
      }
    }
  }

  // Flush remaining
  if (currentPiece.length > 0) {
    const trimmed = currentPiece.trim();
    if (trimmed.length > 0) {
      chunks.push(trimmed);
    }
  }

  return chunks;
};

/**
 * Apply overlap between adjacent chunks so that semantic context at
 * chunk boundaries is preserved during embedding.
 *
 * For each chunk after the first, we prepend the last `overlap` characters
 * from the previous chunk's content.
 */
const applyOverlap = (rawChunks: string[], overlap: number): string[] => {
  if (rawChunks.length <= 1 || overlap <= 0) {
    return rawChunks;
  }

  const result: string[] = [rawChunks[0]!];

  for (let i = 1; i < rawChunks.length; i++) {
    const prev = rawChunks[i - 1]!;
    const current = rawChunks[i]!;

    // Take up to `overlap` characters from the end of the previous chunk
    const overlapText = prev.slice(-overlap);
    result.push(overlapText + current);
  }

  return result;
};

/**
 * Split text into overlapping chunks suitable for embedding.
 *
 * Pure function — no database access, no side effects.
 *
 * @param text       Full document text
 * @param chunkSize  Max characters per chunk (default: CHUNK_SIZE)
 * @param overlap    Overlap characters between chunks (default: CHUNK_OVERLAP)
 * @returns Array of ChunkData objects with content, offsets, and token estimates
 */
const splitTextIntoChunks = (
  text: string,
  chunkSize: number = CHUNK_SIZE,
  overlap: number = CHUNK_OVERLAP
): ChunkData[] => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Step 1: Recursively split into non-overlapping pieces
  const rawChunks = recursiveSplit(text, chunkSize, SPLIT_SEPARATORS);

  if (rawChunks.length === 0) {
    return [];
  }

  // Step 2: Apply overlap
  const overlappedChunks = applyOverlap(rawChunks, overlap);

  // Step 3: Build ChunkData with offsets tracked against the original text
  const result: ChunkData[] = [];
  let searchFrom = 0;

  for (let i = 0; i < overlappedChunks.length; i++) {
    const content = overlappedChunks[i]!;

    // We use the raw (non-overlapped) chunk to track the start offset
    // so offsets reflect the original text positions.
    const rawContent = rawChunks[i]!;
    const startOffset = text.indexOf(rawContent, searchFrom);
    const endOffset = startOffset + rawContent.length;

    result.push({
      content,
      chunkIndex: i,
      startOffset: Math.max(startOffset, 0),
      endOffset: Math.max(endOffset, 0),
      tokenEstimate: estimateTokens(content),
    });

    // Advance past this raw chunk for the next search
    searchFrom = startOffset + rawContent.length;
  }

  return result;
};

// ─── Database Operations ─────────────────────────────────

/**
 * Chunk a document's extracted text, persist the chunks to MongoDB,
 * and update the document's processing status.
 *
 * Uses a MongoDB transaction so that the delete → insert → status-update
 * sequence is atomic. If any step fails the entire batch rolls back.
 *
 * Idempotent: deletes any existing chunks for the document before inserting.
 *
 * @param documentId  MongoDB ObjectId of the document to chunk
 * @returns Number of chunks created
 */
const chunkDocument = async (documentId: string): Promise<number> => {
  const document = await Document.findById(documentId);

  if (!document) {
    throw new Error(`Document not found: ${documentId}`);
  }

  if (!document.extractedText || document.extractedText.trim().length === 0) {
    throw new Error(
      `No extracted text available for document: ${document.originalName}`
    );
  }

  // Transition to CHUNKING (outside the transaction — signals work has begun)
  document.processingStatus = ProcessingStatus.CHUNKING;
  await document.save();

  try {
    // Pure computation — no DB access
    const chunks = splitTextIntoChunks(document.extractedText);

    // ── Transactional write: delete old chunks + insert new + update doc ──
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        // Delete any existing chunks for idempotency (re-processing)
        await Chunk.deleteMany({ documentId: document._id }, { session });

        // Bulk insert
        if (chunks.length > 0) {
          await Chunk.insertMany(
            chunks.map((chunk) => ({
              documentId: document._id,
              content: chunk.content,
              chunkIndex: chunk.chunkIndex,
              startOffset: chunk.startOffset,
              endOffset: chunk.endOffset,
              tokenEstimate: chunk.tokenEstimate,
            })),
            { session }
          );
        }

        // Update document status atomically with the chunk writes
        document.chunkCount = chunks.length;
        document.processingStatus = ProcessingStatus.CHUNKED;
        await document.save({ session });
      });
    } finally {
      await session.endSession();
    }

    return chunks.length;
  } catch (error) {
    // Mark as FAILED if anything went wrong (transaction already rolled back)
    document.processingStatus = ProcessingStatus.FAILED;
    await document.save();

    throw new Error(
      `Chunking failed for ${document.originalName}: ${
        error instanceof Error ? error.message : error
      }`
    );
  }
};

export { splitTextIntoChunks, chunkDocument, ChunkData };
