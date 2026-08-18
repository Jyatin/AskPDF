import { Document } from "../models/document.model";
import { Chunk } from "../models/chunk.model";
import { generateQueryEmbedding } from "./embedding.service";
import { generateAnswer } from "./llm.service";
import { cosineSimilarity } from "../utils/math";

interface ChatSource {
  chunkIndex: number;
  score: number;
  pageNumber?: number;
}

interface ChatResponse {
  answer: string;
  sources: ChatSource[];
}

interface HistoryMessage {
  role: "user" | "ai";
  content: string;
}

const detectPageNumber = (question: string): number | null => {
  // Matches "page X", "page number X", "page no X", "page no. X", "pg X", "pg. X" (case-insensitive)
  const match = question.match(/(?:page|pg)\.?\s*(?:no\.?\s*|number\s*)?(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
};

/**
 * Checks if a follow-up question contains anaphoric references (e.g., "there", "that page",
 * "it", "this") that likely refer to a previously discussed page. If so, scans backward
 * through conversation history to find the most recent page-specific user question.
 */
const resolvePageFromHistory = (
  question: string,
  history: HistoryMessage[]
): number | null => {
  // Only trigger if the question itself has no explicit page reference
  if (detectPageNumber(question) !== null) return null;

  // Check for anaphoric/follow-up patterns
  const followUpPatterns = /\b(there|that page|this page|that section|this section|mentioned there|mentioned above|the same page|same page|it|this|that|above|previous|earlier|the page)\b/i;
  if (!followUpPatterns.test(question)) return null;

  // Scan history backward for the most recent user message with a page reference
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role === "user") {
      const page = detectPageNumber(history[i].content);
      if (page !== null) return page;
    }
  }

  return null;
};

/**
 * Builds a formatted conversation history string for the LLM prompt.
 * Only includes the most recent messages to stay within reasonable token limits.
 */
const buildConversationContext = (history: HistoryMessage[]): string => {
  if (history.length === 0) return "";

  const formatted = history
    .map((msg) => {
      const role = msg.role === "user" ? "User" : "Assistant";
      // Truncate very long AI responses to avoid bloating the prompt
      const content = msg.content.length > 500
        ? msg.content.substring(0, 500) + "..."
        : msg.content;
      return `${role}: ${content}`;
    })
    .join("\n");

  return `\n--- Previous Conversation ---\nThe following is the recent conversation history. Use it ONLY to understand what the user is referring to (e.g., "there", "that", "it", "this concept"). Do NOT use conversation history as a source of factual information.\n${formatted}\n--- End of Conversation History ---\n`;
};

export const chatWithDocument = async (
  documentId: string,
  question: string,
  history: HistoryMessage[] = []
): Promise<ChatResponse> => {
  const document = await Document.findById(documentId);
  if (!document) {
    throw new Error(`Document not found: ${documentId}`);
  }

  // Try explicit page detection first, then resolve from conversation history
  let pageNumber = detectPageNumber(question);
  const resolvedFromHistory = pageNumber === null ? resolvePageFromHistory(question, history) : null;
  if (resolvedFromHistory !== null) {
    pageNumber = resolvedFromHistory;
  }

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

  // Build conversation history section
  const conversationContext = buildConversationContext(history);

  const prompt = `You are an AI assistant answering questions based strictly on the provided document context.
Your instructions:
- Answer the user's question using ONLY the information from the provided document context below.
- If the context does not contain enough information to answer the question, explicitly say "The document does not contain enough information to answer this question." and do not guess.
- Do not mention the "context" or "chunks" in your final answer, just provide the information naturally.
- If previous conversation history is provided, use it ONLY to understand what the user is referring to (such as "there", "that", "it", "this concept", "explain further"). The conversation history is NOT a source of facts — only the document context below contains factual information.
- Formatting rule: Do not use $ for ordinary numbers, values, or quantities. If the document contains a dollar sign as part of an actual monetary value, preserve it only when it is necessary to accurately represent the document. For mathematical/electrical values, write units normally, e.g. 110 V, 7.33 A, 15 Ω instead of $110 V$, $7.33 A$, etc. Do not wrap equations or ordinary mathematical expressions in $...$ LaTeX delimiters. Keep the answer clean and natural for a normal chat interface.
${conversationContext}
${contextHeader}
${contextText}

Question:
${question}

Answer:`;

  // 6. Generate answer using Gemini
  const answer = await generateAnswer(prompt);

  // 7. Format sources with page numbers
  const sources: ChatSource[] = topChunks.map((tc) => {
    let resolvedPage: number | undefined;

    if (isPageSpecific && pageNumber !== null) {
      // For page-specific queries, use the requested page number
      resolvedPage = pageNumber;
    } else {
      // For semantic retrieval, resolve page from document's pageOffsets
      const matchingPage = document.pageOffsets.find(
        (p: any) =>
          tc.chunk.startOffset >= p.startOffset &&
          tc.chunk.startOffset < p.endOffset
      );
      if (matchingPage) {
        resolvedPage = matchingPage.pageNumber;
      } else if (tc.chunk.pageNumber && tc.chunk.pageNumber > 0) {
        // Fallback to chunk's stored pageNumber
        resolvedPage = tc.chunk.pageNumber;
      }
    }

    const source: ChatSource = {
      chunkIndex: tc.chunk.chunkIndex,
      score: Number(tc.score.toFixed(4)),
    };
    if (resolvedPage !== undefined) {
      source.pageNumber = resolvedPage;
    }
    return source;
  });

  return { answer, sources };
};
