import fs from "fs/promises";
import { Document, ProcessingStatus } from "../models/document.model";
import { extractTextFromPDF } from "./pdf.service";
import { chunkDocument } from "./chunking.service";
import { embedDocument } from "./embedding.service";

interface CreateDocumentInput {
  originalName: string;
  storedName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
}

const removeFile = async (filePath: string): Promise<void> => {
  try {
    await fs.unlink(filePath);
  } catch (error: any) {
    if (error && error.code !== "ENOENT") {
      console.error(`Failed to clean up file: ${filePath}`, error);
    }
  }
};

const createDocument = async (input: CreateDocumentInput) => {
  const document = await Document.create({
    ...input,
    processingStatus: ProcessingStatus.UPLOADED,
    uploadedAt: new Date(),
  });

  return document;
};

const processDocument = async (documentId: string) => {
  const document = await Document.findById(documentId);

  if (!document) {
    throw new Error(`Document not found: ${documentId}`);
  }

  // Transition to EXTRACTING
  document.processingStatus = ProcessingStatus.EXTRACTING;
  await document.save();

  try {
    const { text, pageCount, textLength, pageOffsets } = await extractTextFromPDF(document.filePath);

    // Persist extraction results (text is now saved for chunking)
    document.pageCount = pageCount;
    document.textLength = textLength;
    document.extractedText = text;
    document.pageOffsets = pageOffsets;
    document.processingStatus = ProcessingStatus.EXTRACTED;
    await document.save();

    // Continue pipeline: chunk the extracted text
    const chunkCount = await chunkDocument(documentId);

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    // Continue pipeline: generate embeddings for all chunks
    await embedDocument(documentId);

    // Re-read the document to get the final processingStatus (READY)
    const finalDocument = await Document.findById(documentId);
    const finalStatus = finalDocument?.processingStatus ?? ProcessingStatus.READY;

    return { text, pageCount, textLength, chunkCount, processingStatus: finalStatus };
  } catch (error) {
    // Ensure FAILED status is set (embedDocument/chunkDocument may have already set it)
    const currentDoc = await Document.findById(documentId);
    if (currentDoc && currentDoc.processingStatus !== ProcessingStatus.FAILED) {
      currentDoc.processingStatus = ProcessingStatus.FAILED;
      await currentDoc.save();
    }

    throw new Error(
      `Processing failed for ${document.originalName}: ${error instanceof Error ? error.message : error}`
    );
  }
};

export { createDocument, processDocument, removeFile, CreateDocumentInput };
