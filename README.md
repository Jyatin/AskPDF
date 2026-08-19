# 📄 AskPDF

AskPDF is an AI-powered document question-answering application that allows users to upload PDFs, ask conversational questions about their documents, receive grounded answers, and seamlessly navigate directly to cited pages.

🚀 **Live Demo:** [https://ask-pdf-vert.vercel.app/](https://ask-pdf-vert.vercel.app/)  
💻 **GitHub:** [https://github.com/Jyatin/AskPDF](https://github.com/Jyatin/AskPDF)  
📧 **Contact:** singhjyatin@gmail.com  

---

## ✨ Features

- 📄 **PDF Upload & Text Extraction:** Upload PDF documents and extract textual content accurately.
- 🧩 **Document Chunking:** Automatically divides documents into optimal segments for context retrieval.
- 🔍 **Embedding-based Semantic Retrieval:** Finds the most relevant document sections using vector embeddings and cosine similarity.
- 🧠 **RAG & Gemini-Powered QA:** Uses Retrieval-Augmented Generation with the Gemini API to provide highly accurate, grounded answers.
- 📑 **Page-Aware Retrieval:** Understands queries like *"What is mentioned on page 20?"* and retrieves the exact page context.
- 🎯 **Page-Based Source Citations:** AI responses include precise page references for fact-checking.
- 🔗 **Clickable Citations:** Clicking a citation in the chat instantly navigates the built-in PDF viewer to that exact page.
- 💬 **Conversational Context:** Handles follow-up questions gracefully (e.g., *"Can you elaborate on that?"*).
- 🛡️ **Graceful Error Handling:** Robust handling of Gemini API rate limits and errors.
- 🧹 **Temporary PDF Cleanup:** Automatically removes temporary files from backend storage after processing.
- 🔒 **Production Validation & CORS:** Validates required environment variables on startup and secures API access via CORS.
- 📱 **Responsive Frontend:** Clean, modern, and fully responsive user interface.

---

## 🛠️ Tech Stack

**Frontend:**
- React
- TypeScript
- Vite
- Tailwind CSS
- TanStack Query
- Axios

**Backend:**
- Node.js
- Express.js
- TypeScript
- MongoDB / Mongoose
- Gemini API
- pdf-parse

**AI / RAG:**
- RAG (Retrieval-Augmented Generation)
- Embeddings
- Cosine similarity
- Page-aware retrieval
- Gemini

**Deployment:**
- Vercel (Frontend)
- Render (Backend)
- MongoDB Atlas (Database)

---

## 🧠 How It Works

The application follows a standard RAG (Retrieval-Augmented Generation) pipeline, enhanced with page-aware logic:

```text
User uploads PDF
       ↓
Text extraction + page offsets calculated
       ↓
Document chunking
       ↓
Embeddings generated via Gemini
       ↓
User asks a question
       ↓
Semantic retrieval OR Page-aware retrieval
(Extracts relevant chunks based on meaning or specific page requests)
       ↓
Relevant context injected into prompt
       ↓
Gemini API generates grounded answer + sources
       ↓
UI renders answer with clickable PDF page navigation
```

---

## 📁 Project Structure

```
AskPDF/
├── client/                 # React + Vite frontend
│   ├── public/             # Static assets
│   └── src/                # Frontend source code
│       ├── assets/         # Images and global styles
│       ├── components/     # Reusable UI components
│       ├── lib/            # Utility functions and API clients
│       └── pages/          # Main application views/routes
├── server/                 # Node.js + Express backend
│   ├── src/                # Backend source code
│   │   ├── config/         # Database connection configuration
│   │   ├── constants/      # App-wide constants
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middlewares (CORS, Multer)
│   │   ├── models/         # Mongoose database schemas
│   │   ├── routes/         # Express API routes
│   │   ├── services/       # Core business logic (RAG, Chat, PDF parsing)
│   │   ├── utils/          # Helper utilities
│   │   └── workers/        # Background tasks/workers
│   └── uploads/            # Temporary local storage for uploaded PDFs
├── AskPDF.postman_collection.json # API testing collection
└── README.md               # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB connection string (e.g., MongoDB Atlas)
- Gemini API Key

### 1. Clone the repository
```bash
git clone https://github.com/Jyatin/AskPDF.git
cd AskPDF
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory (see Environment Variables section below).

Start the development server:
```bash
npm run dev
```
*(Runs on http://localhost:5000)*

### 3. Frontend Setup
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```
*(Runs on http://localhost:5173)*

### 4. Production Builds
To build the projects for production:

**Backend:**
```bash
cd server
npm run build
```

**Frontend:**
```bash
cd client
npm run build
```

---

## 🔑 Environment Variables

Create a `.env` file in the `server` directory. **Real secrets must never be committed to version control.**

```env
# Required
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/askpdf
GEMINI_API_KEY=your_gemini_api_key
PORT=5000

# Required in Production (Matches your frontend URL)
CORS_ORIGIN=https://ask-pdf-vert.vercel.app
```

---

## 🏗️ Production Deployment

The application is deployed across the following services:

- **Frontend:** Vercel
- **Backend:** Render (Web Service)
- **Database:** MongoDB Atlas
- **AI Engine:** Gemini API

**Production URLs:**
- **Frontend:** [https://ask-pdf-vert.vercel.app/](https://ask-pdf-vert.vercel.app/)
- **Backend API:** `https://askpdf-backend-xt83.onrender.com`
- **Health Check:** `https://askpdf-backend-xt83.onrender.com/health` (Returns 200 OK status)

---

## 🧪 Testing & Development Utilities

There is currently no formal automated test suite. The repository includes an `AskPDF.postman_collection.json` file at the root for manual API testing and verification.

---

## ⚠️ Current Limitations

- Conversation history is stored in the frontend React state and is lost after a page reload.
- Semantic retrieval currently calculates cosine similarity in application memory rather than using a dedicated vector database.
- Retrieval is not optimized for very large document collections.
- Uploaded PDFs use temporary backend local storage (`/uploads`) during processing before being cleaned up.

---

## 🗺️ Roadmap — V2

The following features are planned for future releases:
- Persistent conversations (saving chat history to the database)
- Multi-document conversations
- Improved retrieval and ranking pipelines
- Scalable vector search integration (e.g., Pinecone, Milvus)
- Streaming AI responses for lower perceived latency
- User authentication and accounts
- Persistent cloud document storage (e.g., AWS S3)
- Background document processing for massive PDFs
- Rate limiting and API security improvements
- Advanced document understanding (tables, images, complex layouts)

---

## 🤝 Contributing

Contributions, suggestions, bug reports, issues, and pull requests are always welcome! 

Feel free to reach out via email: singhjyatin@gmail.com

---

## 👨‍💻 Author

**Jyatin Singh**  
- **GitHub:** [https://github.com/Jyatin/AskPDF](https://github.com/Jyatin/AskPDF)
- **Live Demo:** [https://ask-pdf-vert.vercel.app/](https://ask-pdf-vert.vercel.app/)
- **Email:** singhjyatin@gmail.com

---

## 📄 License

License: To be determined.
