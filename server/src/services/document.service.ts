import fs from "fs/promises";
import { Document, ProcessingStatus } from "../models/document.model";

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

export { createDocument, CreateDocumentInput };
