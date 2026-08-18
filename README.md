# AskPDF

AskPDF is an AI-powered document question-answering application that allows users to upload PDFs, ask questions about their documents, receive grounded answers, and navigate directly to cited pages.

## Features

- PDF upload and text extraction
- Document chunking
- Embedding-based semantic retrieval
- AI-powered question answering with Gemini
- Page-based source citations
- Clickable source citations that navigate the PDF viewer
- Conversational context/history
- Follow-up questions such as "What is KCL mentioned there?"
- Page-aware retrieval
- Graceful Gemini API error handling
- Clean responsive frontend

## Tech Stack

**Frontend:**
- React
- TypeScript
- Vite
- Tailwind CSS
- TanStack Query
- Axios

**Backend:**
- Node.js
- Express
- TypeScript
- MongoDB / Mongoose
- Gemini API
- pdf-parse

## How It Works

1. User uploads a PDF.
2. Backend extracts text and page offsets.
3. Text is divided into chunks.
4. Embeddings are generated for retrieval.
5. User asks a question.
6. Relevant chunks are retrieved using cosine similarity, or the requested page is retrieved directly for page-specific questions.
7. Gemini generates an answer using the retrieved document content.
8. Sources are mapped back to PDF pages.
9. Clicking a source navigates the PDF viewer to that page.
10. Recent conversation history can be used to resolve follow-up references.

## Project Structure

```
AskPDF/
├── client/                 # React frontend
│   ├── public/             # Static assets
│   └── src/                # Frontend source code
│       ├── components/     # UI components
│       ├── lib/            # Utilities and API functions
│       └── pages/          # Route components
├── server/                 # Node.js backend
│   ├── scripts/            # Development/test scripts
│   ├── src/                # Backend source code
│   │   ├── config/         # Database and app configurations
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middlewares
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routes
│   │   └── services/       # Core business logic (RAG, Chunking, etc.)
│   └── uploads/            # Temporary storage for uploaded PDFs
├── test-assets/            # Assets for testing
├── .gitignore              # Git ignore rules
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites

- Node.js
- MongoDB / MongoDB Atlas
- Gemini API key

### Backend

To start the backend server:

```powershell
cd server
npm install
npm run dev
```

- `npm install`: Installs the required Node.js dependencies.
- `npm run dev`: Starts the backend server in development mode.

**Required Environment Variables:**
Create a `.env` file in the `server` directory with the following variables:
```
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```
*Note: Never commit real secret values to version control.*

### Frontend

To start the frontend client:

```powershell
cd client
npm install
npm run dev
```

- `npm install`: Installs the required frontend dependencies.
- `npm run dev`: Starts the Vite development server.

By default, the backend will run at `http://localhost:5000` and the frontend development server will usually be available at `http://localhost:5173`.

## Environment Variables

Secrets belong in `.env` files and must never be committed. Only `.env.example` should be checked into version control. Ensure your local `.env` values match the variables required by the application.

## Development

To build the application for production:

**Backend:**
```powershell
cd server
npm run build
```

**Frontend:**
```powershell
cd client
npm run build
```

## Testing

The project currently contains a few diagnostic scripts (such as `diagnose.ts`, `test-chat.ts`, `test_upload.ts`, and `scripts/generate-test-pdf.js`). These are provided strictly as local development utilities and are not part of a formal automated test suite.

## Current Limitations

- Conversation history is currently stored in frontend React state and is lost after reload.
- Semantic retrieval currently calculates cosine similarity in application memory.
- Production deployment requires environment-based API URL and CORS configuration.

## Roadmap

- Production environment configuration
- Secure CORS
- Temporary upload cleanup
- Better upload error UI
- Retrieval scalability/vector search
- Persistent conversations
- Deployment

## License

License: To be determined.
