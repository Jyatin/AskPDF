import { Request, Response } from "express";
import { createDocument, processDocument } from "../services/document.service";

const uploadDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: "No file uploaded." });
      return;
    }

    const document = await createDocument({
      originalName: file.originalname,
      storedName: file.filename,
      filePath: file.path,
      mimeType: file.mimetype,
      fileSize: file.size,
    });

    // Extract text and chunk synchronously during upload
    const result = await processDocument(document._id.toString());

    res.status(201).json({
      message: "Document uploaded and processed successfully.",
      document: {
        id: document._id,
        originalName: document.originalName,
        fileSize: document.fileSize,
        processingStatus: "chunked",
        pageCount: result.pageCount,
        textLength: result.textLength,
        chunkCount: result.chunkCount,
        uploadedAt: document.uploadedAt,
      },
    });
  } catch (error) {
    console.error("Upload failed:", error instanceof Error ? error.message : error);
    res.status(500).json({ error: "Failed to upload document." });
  }
};

export { uploadDocument };
