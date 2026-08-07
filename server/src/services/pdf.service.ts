import fs from "fs/promises";
import pdfParse from "pdf-parse";

interface PDFExtractionResult {
  text: string;
  pageCount: number;
  textLength: number;
}

const extractTextFromPDF = async (filePath: string): Promise<PDFExtractionResult> => {
  const buffer = await fs.readFile(filePath);
  const data = await pdfParse(buffer);

  const text = data.text.trim();

  return {
    text,
    pageCount: data.numpages,
    textLength: text.length,
  };
};

export { extractTextFromPDF, PDFExtractionResult };
