import fs from "fs/promises";
import { Document, ProcessingStatus } from "../models/document.model";
import { extractTextFromPDF } from "./pdf.service";
import { chunkDocument } from "./chunking.service";

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
  } catch {
    console.error(`Failed to clean up file: ${filePath}`);
  }
};

const createDocument = async (input: CreateDocumentInput) => {
  try {
    const document = await Document.create({
      ...input,
      processingStatus: ProcessingStatus.UPLOADED,
      uploadedAt: new Date(),
    });

    return document;
  } catch (error) {
    await removeFile(input.filePath);
    throw error;
  }
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
    const { text, pageCount, textLength } = await extractTextFromPDF(document.filePath);

    // Persist extraction results (text is now saved for chunking)
    document.pageCount = pageCount;
    document.textLength = textLength;
    document.extractedText = text;
    document.processingStatus = ProcessingStatus.EXTRACTED;
    await document.save();

    // Continue pipeline: chunk the extracted text
    const chunkCount = await chunkDocument(documentId);

    return { text, pageCount, textLength, chunkCount };
  } catch (error) {
    document.processingStatus = ProcessingStatus.FAILED;
    await document.save();

    throw new Error(
      `Processing failed for ${document.originalName}: ${error instanceof Error ? error.message : error}`
    );
  }
};

export { createDocument, processDocument, CreateDocumentInput };
