import { GoogleGenAI } from "@google/genai";
import { Document, ProcessingStatus } from "../models/document.model";
import { Chunk } from "../models/chunk.model";

const EMBEDDING_MODEL = "gemini-embedding-001";

let genaiClient: GoogleGenAI | null = null;

const getClient = (): GoogleGenAI => {
  if (genaiClient) return genaiClient;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  genaiClient = new GoogleGenAI({ apiKey });
  return genaiClient;
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
  if (!text || text.trim() === "") {
    throw new Error("Cannot generate embedding for empty text.");
  }

  const client = getClient();
  const response = await client.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: {
      taskType: "RETRIEVAL_DOCUMENT",
    },
  });

  const vector = response.embeddings?.[0]?.values;
  if (!vector || vector.length === 0) {
    throw new Error("Gemini returned an empty embedding.");
  }

  return vector;
};

export const generateQueryEmbedding = async (text: string): Promise<number[]> => {
  if (!text || text.trim() === "") {
    throw new Error("Cannot generate embedding for empty text.");
  }

  const client = getClient();
  const response = await client.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: {
      taskType: "RETRIEVAL_QUERY",
    },
  });

  const vector = response.embeddings?.[0]?.values;
  if (!vector || vector.length === 0) {
    throw new Error("Gemini returned an empty embedding.");
  }

  return vector;
};


export const embedDocument = async (
  documentId: string
): Promise<{ chunkCount: number; embeddingModel: string }> => {
  const document = await Document.findById(documentId);
  if (!document) {
    throw new Error(`Document not found: ${documentId}`);
  }

  document.processingStatus = ProcessingStatus.EMBEDDING;
  await document.save();

  try {
    const chunks = await Chunk.find({ documentId: document._id })
      .sort({ chunkIndex: 1 })
      .exec();

    if (chunks.length === 0) {
      throw new Error(`No chunks found for document: ${documentId}`);
    }

    const now = new Date();

    // Process sequentially as requested to avoid duplicate functions and API compatibility issues
    for (const chunk of chunks) {
      const vector = await generateEmbedding(chunk.content);
      chunk.embedding = vector;
      chunk.embeddingModel = EMBEDDING_MODEL;
      chunk.embeddedAt = now;
      await chunk.save();
    }

    document.processingStatus = ProcessingStatus.READY;
    await document.save();

    return {
      chunkCount: chunks.length,
      embeddingModel: EMBEDDING_MODEL,
    };
  } catch (error) {
    document.processingStatus = ProcessingStatus.FAILED;
    await document.save();

    throw new Error(
      `Embedding failed for ${document.originalName}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};
