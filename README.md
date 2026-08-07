# AskPDF

AI Document Intelligence Platform — upload PDFs and chat with them using RAG.

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, Mongoose
- **Database**: MongoDB Atlas
- **AI**: Google Gemini, Google Embeddings
- **Vector Store**: ChromaDB
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui

## Getting Started

```bash
cd server
npm install
```

Create `server/.env`:

```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
GEMINI_API_KEY=
```

Start the dev server:

```bash
npm run dev
```

## Testing the Upload API

1. Start the backend:

   ```bash
   cd server
   npm run dev
   ```

2. Open **Postman**.

3. Create a new request:

   ```
   POST http://localhost:5000/api/documents/upload
   ```

4. Go to **Body → form-data**:

   | Key  | Type | Value                    |
   |------|------|--------------------------|
   | file | File | `test-assets/sample.pdf` |

5. Click **Send**.

6. Expected response:

   ```json
   {
     "message": "Document uploaded and processed successfully.",
     "document": {
       "id": "...",
       "originalName": "sample.pdf",
       "fileSize": 4792,
       "processingStatus": "extracted",
       "pageCount": 3,
       "textLength": 1990,
       "uploadedAt": "..."
     }
   }
   ```

### Using curl

```bash
curl -X POST http://localhost:5000/api/documents/upload -F "file=@test-assets/sample.pdf"
```

## API Endpoints

| Method | Endpoint                      | Description        |
|--------|-------------------------------|--------------------|
| GET    | `/health`                     | Health check       |
| POST   | `/api/documents/upload`       | Upload a PDF       |

## License

ISC
