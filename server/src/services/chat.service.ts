import { Document } from "../models/document.model";
import { Chunk } from "../models/chunk.model";
import { generateQueryEmbedding } from "./embedding.service";
import { generateAnswer } from "./llm.service";
import { cosineSimilarity } from "../utils/math";

interface ChatSource {
  chunkIndex: number;
  score: number;
}

interface ChatResponse {
  answer: string;
  sources: ChatSource[];
}

const detectPageNumber = (question: string): number | null => {
  // Matches "page X", "page number X", "page no X", "page no. X", "pg X", "pg. X" (case-insensitive)
  const match = question.match(/(?:page|pg)\.?\s*(?:no\.?\s*|number\s*)?(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
};

export const chatWithDocument = async (
  documentId: string,
  question: string
): Promise<ChatResponse> => {
  const document = await Document.findById(documentId);
  if (!document) {
    throw new Error(`Document not found: ${documentId}`);
  }

  const pageNumber = detectPageNumber(question);
  let topChunks: { chunk: any; score: number }[] = [];
  let isPageSpecific = false;

  if (pageNumber !== null) {
    if (pageNumber <= 0 || pageNumber > document.pageCount) {
      return {
        answer: `The document does not contain page number ${pageNumber}. It has only ${document.pageCount} pages.`,
        sources: [],
      };
    }

    const pageMeta = document.pageOffsets.find((p: any) => p.pageNumber === pageNumber);
    if (!pageMeta) {
      return {
        answer: `The document does not contain valid offset information for page ${pageNumber}.`,
        sources: [],
      };
    }

    const pageChunks = await Chunk.find({ 
      documentId: document._id, 
      startOffset: { $lte: pageMeta.endOffset },
      endOffset: { $gte: pageMeta.startOffset }
    })
      .sort({ chunkIndex: 1 })
      .exec();

    if (pageChunks.length > 0) {
      topChunks = pageChunks.map((chunk) => ({ chunk, score: 1.0 }));
      isPageSpecific = true;
    }
  }

  if (!isPageSpecific) {
    // 1. Generate query embedding
    const queryEmbedding = await generateQueryEmbedding(question);

    // 2. Fetch chunks
    const chunks = await Chunk.find({ documentId: document._id }).exec();
    if (chunks.length === 0) {
      throw new Error(`No chunks found for document: ${documentId}`);
    }

    // 3. Compute cosine similarity and sort
    const scoredChunks = chunks
      .filter((chunk) => chunk.embedding && chunk.embedding.length > 0)
      .map((chunk) => {
        const score = cosineSimilarity(queryEmbedding, chunk.embedding);
        return { chunk, score };
      })
      .sort((a, b) => b.score - a.score);

    // 4. Take top 5
    topChunks = scoredChunks.slice(0, 5);
  }

  // 5. Build context
  const contextText = topChunks
    .map(
      (tc, index) =>
        `--- Chunk ${tc.chunk.chunkIndex} (Score: ${tc.score.toFixed(4)}) ---\n${tc.chunk.content}`
    )
    .join("\n\n");

  const contextHeader = isPageSpecific
    ? `The following is the complete text content extracted from Page ${pageNumber} of the document.`
    : `Context:`;

  const prompt = `You are an AI assistant answering questions based strictly on the provided document context.
Your instructions:
- Answer the user's question using ONLY the information from the provided context.
- If the context does not contain enough information to answer the question, explicitly say "The document does not contain enough information to answer this question." and do not guess.
- Do not mention the "context" or "chunks" in your final answer, just provide the information naturally.

${contextHeader}
${contextText}

Question:
${question}

Answer:`;

  // 6. Generate answer using Gemini
  const answer = await generateAnswer(prompt);

  // 7. Format sources
  const sources: ChatSource[] = topChunks.map((tc) => ({
    chunkIndex: tc.chunk.chunkIndex,
    score: Number(tc.score.toFixed(4)),
  }));

  return { answer, sources };
};
