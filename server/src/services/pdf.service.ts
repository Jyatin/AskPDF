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

const extractTextFromPDF = async (filePath: string): Promise<PDFExtractionResult> => {
  const buffer = await fs.readFile(filePath);
  console.log(`[extractTextFromPDF] filePath: ${filePath}`);
  console.log(`[extractTextFromPDF] buffer length: ${buffer.length}`);

  const pageTexts: string[] = [];

  const options = {
    pagerender: async (pageData: any) => {
      const textContent = await pageData.getTextContent({
        normalizeWhitespace: false,
        disableCombineTextItems: false,
      });

      let lastY;
      let text = "";
      for (const item of textContent.items) {
        if (lastY === item.transform[5] || !lastY) {
          text += item.str;
        } else {
          text += "\n" + item.str;
        }
        lastY = item.transform[5];
      }

      const pageNumber = pageData.pageIndex + 1;
      pageTexts[pageNumber - 1] = text;
      return text;
    },
  };

  const data = await pdfParse(new Uint8Array(buffer), options);
  const text = data.text.trim();

  // Compute character offsets for each page based on pdf-parse's concatenation:
  // ret.text = `${ret.text}\n\n${pageText}` starting with ret.text = ""
  const pageOffsets: PageOffset[] = [];
  let currentOffset = 0;
  for (let i = 0; i < pageTexts.length; i++) {
    const pageText = pageTexts[i] || "";
    const pageNumber = i + 1;
    const startOffset = currentOffset + 2; // account for prepended "\n\n"
    const endOffset = startOffset + pageText.length;
    pageOffsets.push({
      pageNumber,
      startOffset,
      endOffset,
    });
    currentOffset = endOffset;
  }

  return {
    text,
    pageCount: data.numpages,
    textLength: text.length,
    pageOffsets,
  };
};

export { extractTextFromPDF };
