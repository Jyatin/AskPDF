import fs from "fs/promises";
const pdfParse = require("pdf-parse");

export interface PageOffset {
  pageNumber: number;
  startOffset: number;
  endOffset: number;
}

export interface PDFExtractionResult {
  text: string;
  pageCount: number;
  textLength: number;
  pageOffsets: PageOffset[];
}

/**
 * Build the canonical document text and page offsets from the same string.
 * End offsets are exclusive: [startOffset, endOffset).
 */
export const buildPDFExtractionResult = (
  pageTexts: string[],
  pageCount: number = pageTexts.length
): PDFExtractionResult => {
  const pages = pageTexts.map((pageText) => (pageText ?? "").trim());
  let text = "";
  const pageOffsets: PageOffset[] = [];

  pages.forEach((pageText, index) => {
    if (index > 0) text += "\n\n";
    const startOffset = text.length;
    text += pageText;
    pageOffsets.push({
      pageNumber: index + 1,
      startOffset,
      endOffset: text.length,
    });
  });

  return {
    text,
    pageCount,
    textLength: text.length,
    pageOffsets,
  };
};

const extractTextFromPDF = async (filePath: string): Promise<PDFExtractionResult> => {
  const buffer = await fs.readFile(filePath);
  const pageTexts: string[] = [];

  const options = {
    pagerender: async (pageData: any) => {
      const textContent = await pageData.getTextContent({
        normalizeWhitespace: false,
        disableCombineTextItems: false,
      });

      let lastY: number | undefined;
      let text = "";
      for (const item of textContent.items) {
        if (lastY === item.transform[5] || !lastY) {
          text += item.str;
        } else {
          text += "\n" + item.str;
        }
        lastY = item.transform[5];
      }

      pageTexts[pageData.pageIndex] = text;
      return text;
    },
  };

  const data = await pdfParse(new Uint8Array(buffer), options);
  // Do not use data.text.trim(): offsets must be calculated against this exact text.
  return buildPDFExtractionResult(pageTexts, data.numpages);
};

export { extractTextFromPDF };
