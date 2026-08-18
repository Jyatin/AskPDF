import { GoogleGenAI } from "@google/genai";

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

export const generateAnswer = async (prompt: string): Promise<string> => {
  const client = getClient();
  const response = await client.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });
  
  const text = response.text;
  if (!text) {
    throw new Error("Failed to generate an answer from Gemini.");
  }
  
  return text;
};
