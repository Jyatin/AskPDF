import { Request, Response } from "express";
import { chatWithDocument } from "../services/chat.service";

export const chat = async (req: Request, res: Response): Promise<void> => {
  try {
    const documentId = req.params.documentId as string;
    const { question, history } = req.body;

    if (!documentId) {
      res.status(400).json({ error: "documentId parameter is required." });
      return;
    }

    if (!question || typeof question !== "string" || question.trim() === "") {
      res.status(400).json({ error: "A valid 'question' string is required in the request body." });
      return;
    }

    // Validate history if provided
    const validHistory = Array.isArray(history)
      ? history.filter(
          (msg: any) =>
            msg &&
            typeof msg.role === "string" &&
            (msg.role === "user" || msg.role === "ai") &&
            typeof msg.content === "string" &&
            msg.content.trim() !== ""
        )
      : [];

    const result = await chatWithDocument(documentId, question, validHistory);

    res.status(200).json({
      answer: result.answer,
      sources: result.sources,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Chat failed:", errorMsg);

    let statusCode = 500;
    let userMessage = "Unable to generate an answer right now. Please try again.";
    let errorCode = "INTERNAL_ERROR";

    const lowerError = errorMsg.toLowerCase();
    if (lowerError.includes("429") || lowerError.includes("resource_exhausted") || lowerError.includes("quota")) {
      statusCode = 429;
      userMessage = "AI usage limit reached. Please wait a little and try again.";
      errorCode = "RATE_LIMITED";
    } else if (lowerError.includes("503") || lowerError.includes("service unavailable") || lowerError.includes("overloaded")) {
      statusCode = 503;
      userMessage = "The AI service is temporarily unavailable. Please try again in a moment.";
      errorCode = "SERVICE_UNAVAILABLE";
    }

    res.status(statusCode).json({ error: userMessage, code: errorCode });
  }
};
