import localforage from "localforage";

export interface LocalDocument {
  documentId: string;
  originalName: string;
  fileSize: number;
  uploadedAt: Date;
  processingStatus: string;
  pageCount: number;
  file: Blob | File;
}

const db = localforage.createInstance({
  name: "AskPDF",
  storeName: "documents",
  description: "Local storage for AskPDF documents and metadata",
});

export async function saveDocument(doc: LocalDocument): Promise<void> {
  await db.setItem(doc.documentId, doc);
}

export async function getDocument(documentId: string): Promise<LocalDocument | null> {
  return await db.getItem<LocalDocument>(documentId);
}

export async function getAllDocuments(): Promise<LocalDocument[]> {
  const docs: LocalDocument[] = [];
  await db.iterate<LocalDocument, void>((value) => {
    docs.push(value);
  });
  // Sort by uploadedAt descending
  return docs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}
