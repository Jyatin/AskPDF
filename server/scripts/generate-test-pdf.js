// Generates a valid multi-page PDF with readable text content
// Uses raw PDF syntax — no external dependencies required

const fs = require("fs");
const path = require("path");

const pages = [
  {
    title: "AskPDF — AI Document Intelligence Platform",
    body: [
      "AskPDF is a production-grade AI Document Intelligence Platform.",
      "Users upload PDF documents and the system processes them using",
      "Retrieval Augmented Generation to enable natural language chat.",
      "",
      "The platform extracts text from uploaded PDFs, chunks the content",
      "into semantically meaningful segments, generates vector embeddings,",
      "and stores them for efficient similarity search at query time.",
      "",
      "Key Features:",
      "  - Secure PDF upload with MIME type validation",
      "  - Automatic text extraction using pdf-parse",
      "  - Document processing pipeline with status tracking",
      "  - MongoDB Atlas for persistent document storage",
      "  - RESTful API built with Express and TypeScript",
    ],
  },
  {
    title: "Architecture Overview",
    body: [
      "The backend follows clean architecture principles:",
      "",
      "Routes: Register endpoints and delegate to controllers.",
      "Controllers: Coordinate requests and shape responses.",
      "Services: Contain all business logic and data operations.",
      "Models: Define MongoDB schemas with Mongoose.",
      "Middleware: Handle cross-cutting concerns like file uploads.",
      "Config: Manage database connections and environment setup.",
      "",
      "Processing Pipeline:",
      "  1. Upload PDF to server storage",
      "  2. Create document record in MongoDB (status: uploaded)",
      "  3. Extract text from PDF (status: extracting -> extracted)",
      "  4. Chunk text into segments (status: chunking -> chunked)",
      "  5. Generate embeddings (status: embedding -> ready)",
      "  6. Enable AI chat over document content",
    ],
  },
  {
    title: "Technology Stack",
    body: [
      "Backend: Node.js, Express, TypeScript, Mongoose",
      "Database: MongoDB Atlas",
      "AI: Google Gemini, Google Embeddings",
      "Vector Store: ChromaDB (initial), Pinecone (future)",
      "File Processing: Multer, pdf-parse",
      "Validation: Zod",
      "Authentication: JWT, bcrypt",
      "",
      "Frontend: React, TypeScript, Vite, Tailwind CSS",
      "UI Components: shadcn/ui, Framer Motion, Lucide Icons",
      "Data Fetching: TanStack Query, Axios",
      "Forms: React Hook Form",
      "Routing: React Router",
      "",
      "This document is a test asset for verifying the PDF upload",
      "and text extraction pipeline of the AskPDF platform.",
    ],
  },
];

function buildPDF(pages) {
  const objects = [];
  let objectCount = 0;

  const addObject = (content) => {
    objectCount++;
    const obj = `${objectCount} 0 obj\n${content}\nendobj\n`;
    objects.push(obj);
    return objectCount;
  };

  // 1. Catalog
  const catalogId = addObject("<< /Type /Catalog /Pages 2 0 R >>");

  // 2. Pages (placeholder — will be replaced)
  const pagesId = addObject("PLACEHOLDER");

  // 3. Font
  const fontId = addObject(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
  );
  const boldFontId = addObject(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"
  );

  const pageIds = [];

  for (const page of pages) {
    // Build stream content
    let stream = "";

    // Title
    stream += "BT\n";
    stream += "/F2 18 Tf\n";
    stream += "72 750 Td\n";
    stream += `(${escapePDF(page.title)}) Tj\n`;
    stream += "ET\n";

    // Separator line
    stream += "0.7 0.7 0.7 RG\n";
    stream += "72 740 m 540 740 l S\n";
    stream += "0 0 0 RG\n";

    // Body text
    let y = 710;
    for (const line of page.body) {
      stream += "BT\n";
      stream += "/F1 11 Tf\n";
      stream += `72 ${y} Td\n`;
      stream += `(${escapePDF(line)}) Tj\n`;
      stream += "ET\n";
      y -= 18;
    }

    const streamBytes = Buffer.from(stream, "ascii");
    const streamId = addObject(
      `<< /Length ${streamBytes.length} >>\nstream\n${stream}endstream`
    );

    const pageId = addObject(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Contents ${streamId} 0 R /Resources << /Font << /F1 ${fontId} 0 R /F2 ${boldFontId} 0 R >> >> >>`
    );
    pageIds.push(pageId);
  }

  // Replace pages object
  const kids = pageIds.map((id) => `${id} 0 R`).join(" ");
  objects[pagesId - 1] =
    `${pagesId} 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pageIds.length} >>\nendobj\n`;

  // Build file
  let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets = [];

  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, "binary"));
    pdf += obj + "\n";
  }

  const xrefOffset = Buffer.byteLength(pdf, "binary");
  pdf += "xref\n";
  pdf += `0 ${objectCount + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }

  pdf += "trailer\n";
  pdf += `<< /Size ${objectCount + 1} /Root ${catalogId} 0 R >>\n`;
  pdf += "startxref\n";
  pdf += `${xrefOffset}\n`;
  pdf += "%%EOF\n";

  return Buffer.from(pdf, "binary");
}

function escapePDF(str) {
  return str.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

const outputDir = path.resolve(__dirname, "..", "test-assets");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, "sample.pdf");
const pdfBuffer = buildPDF(pages);
fs.writeFileSync(outputPath, pdfBuffer);
console.log(`✅ Generated ${outputPath} (${pdfBuffer.length} bytes, ${pages.length} pages)`);
