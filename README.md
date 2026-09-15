<div align="center">

# 📄 AskPDF

### Chat with your PDFs. Get grounded answers. Jump straight to the source.

An AI-powered document intelligence application that combines **RAG, semantic retrieval, Gemini, and page-aware citations** to turn static PDFs into interactive, conversational knowledge.

<br/>

<a href="https://ask-pdf-vert.vercel.app/">
  <img src="https://img.shields.io/badge/🚀%20Live%20Demo-ask--pdf--vert.vercel.app-111827?style=for-the-badge" alt="Live Demo" />
</a>
<a href="https://github.com/Jyatin/AskPDF">
  <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" alt="GitHub" />
</a>

<br/><br/>

<img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" />
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white" />
<img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" />
<img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" />
<img src="https://img.shields.io/badge/Gemini-4285F4?style=flat-square&logo=google&logoColor=white" />
<img src="https://img.shields.io/badge/RAG-AI-7C3AED?style=flat-square" />

</div>

---

## ✨ What is AskPDF?

**AskPDF** turns a PDF from a file you read into a document you can **talk to**.

Upload a document, ask a question in natural language, and AskPDF retrieves the most relevant context before asking Gemini to generate a grounded answer. When the answer comes from a specific part of the document, the application can surface the **page reference directly in the conversation** and let you jump to that page in the PDF viewer.

The project combines:

- 📄 PDF text extraction
- 🧩 document chunking
- 🔎 embedding-based semantic retrieval
- 🧠 Retrieval-Augmented Generation (RAG)
- 📑 page-aware retrieval
- 🎯 source/page citations
- 🔗 clickable citation navigation
- 💬 conversational follow-up questions

The current implementation uses a React + TypeScript frontend and a Node.js + Express + TypeScript backend, with MongoDB for persistence and Gemini for AI capabilities. fileciteturn13file0L42-L64

---

## 🎥 Live Demo

<div align="center">

### 👉 [Open AskPDF](https://ask-pdf-vert.vercel.app/)

**Upload a PDF → ask a question → inspect the source.**

</div>

---

## 🌟 Why AskPDF?

Most document chat applications stop at:

> “Here is an answer generated from your PDF.”

AskPDF is designed around a more useful workflow:

> **“Here is the answer — and here is where it came from.”**

That means the system is not only focused on answering questions, but also on making those answers easier to **verify, navigate, and trust**.

---

# 🚀 Features

<details open>
<summary><strong>📄 Document Intelligence</strong></summary>

<br/>

- PDF upload and text extraction
- Page offset calculation
- Automatic document chunking
- Temporary file cleanup after processing
- Support for document-grounded conversational queries

</details>

<details>
<summary><strong>🔍 Semantic Retrieval</strong></summary>

<br/>

- Embedding-based retrieval
- Cosine-similarity ranking
- Meaning-aware search instead of simple keyword matching
- Relevant context selection before generation

</details>

<details>
<summary><strong>📑 Page-Aware Retrieval</strong></summary>

<br/>

Ask questions such as:

```text
What is mentioned on page 20?
```

AskPDF can use the requested page context instead of treating the entire document as an undifferentiated text corpus.

</details>

<details>
<summary><strong>🎯 Grounded Answers & Citations</strong></summary>

<br/>

- Answers are generated from retrieved document context
- Source pages are surfaced with responses
- Citations can be clicked to navigate to the relevant PDF page
- Designed to make answers easier to fact-check

</details>

<details>
<summary><strong>💬 Conversational UX</strong></summary>

<br/>

Ask follow-up questions naturally:

```text
What is the main argument?

Can you explain that in simpler terms?

What evidence supports that?
```

The application is designed to preserve the conversational context needed for follow-up interactions.

</details>

<details>
<summary><strong>🛡️ Reliability & Production Considerations</strong></summary>

<br/>

- Gemini API error/rate-limit handling
- Required environment-variable validation
- CORS configuration
- Temporary upload cleanup
- Production frontend/backend deployment

</details>

---

# 🧠 How AskPDF Works

AskPDF follows a **Retrieval-Augmented Generation (RAG)** pipeline with additional page-aware logic.

```text
                         ┌─────────────────────┐
                         │     Upload PDF      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Extract Text      │
                         │ + Page Information  │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Chunk Document    │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Generate Embeddings │
                         │      via Gemini     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   User Question     │
                         └──────────┬──────────┘
                                    │
                         ┌──────────┴──────────┐
                         ▼                     ▼
                Semantic Retrieval      Page Retrieval
                         │                     │
                         └──────────┬──────────┘
                                    ▼
                         ┌─────────────────────┐
                         │ Relevant Context    │
                         │   Selected/Ranked   │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Gemini Generation │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Grounded Answer +   │
                         │ Page Citations      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Click Citation →    │
                         │ Jump to PDF Page    │
                         └─────────────────────┘
```

The repository describes this flow as text extraction with page offsets, chunking, embedding generation, semantic or page-aware retrieval, context injection, grounded Gemini generation, and clickable PDF navigation. fileciteturn13file0L107-L131

---

# 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                         ASKPDF PLATFORM                         │
├──────────────────────────────┬──────────────────────────────────┤
│          FRONTEND            │             BACKEND               │
│                              │                                  │
│  React + TypeScript          │  Node.js + Express + TypeScript │
│  Vite                        │                                  │
│  Tailwind CSS                │  ┌────────────────────────────┐  │
│  TanStack Query              │  │ Controllers / Routes       │  │
│  Axios                       │  └─────────────┬──────────────┘  │
│                              │                │                  │
│  PDF Viewer                  │                ▼                  │
│  Chat Interface              │  ┌────────────────────────────┐  │
│  Citation Navigation         │  │ RAG / PDF / Chat Services │  │
│                              │  └─────────────┬──────────────┘  │
└──────────────┬───────────────┘                │                 │
               │                                │                 │
               └────────────── HTTP ────────────┘                 │
                                                │                 │
                         ┌──────────────────────┼───────────────┐ │
                         │                      │               │ │
                         ▼                      ▼               ▼ │
                    MongoDB                 Gemini          pdf-parse
                         │                      │               │ │
                         └──────────────────────┴───────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

The repository is organized around a React/Vite client and a Node/Express server with configuration, controllers, middleware, models, routes, services, utilities, and workers. fileciteturn13file0L139-L164

---

# 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React | Interactive document/chat UI |
| Language | TypeScript | Type-safe application code |
| Build Tool | Vite | Fast frontend development/builds |
| Styling | Tailwind CSS | UI styling |
| Data Fetching | TanStack Query | Server-state management |
| HTTP | Axios | API communication |
| Backend | Node.js + Express | API and application server |
| Database | MongoDB + Mongoose | Persistence |
| AI | Gemini API | Embeddings and generation |
| PDF | pdf-parse | PDF text extraction |
| Deployment | Vercel + Render | Frontend/backend hosting |
| Database Hosting | MongoDB Atlas | Managed MongoDB |

This stack reflects the repository's documented frontend, backend, AI/RAG, and deployment technologies. fileciteturn13file0L69-L103

---

# 📁 Project Structure

```text
AskPDF/
│
├── client/                         # React + Vite frontend
│   ├── public/                     # Static assets
│   └── src/
│       ├── assets/                 # Images and global styles
│       ├── components/             # Reusable UI components
│       ├── lib/                    # Utilities and API clients
│       └── pages/                  # Main views/routes
│
├── server/                         # Node + Express backend
│   ├── src/
│   │   ├── config/                 # Configuration/database setup
│   │   ├── constants/              # Shared constants
│   │   ├── controllers/            # Request handlers
│   │   ├── middleware/             # Express middleware
│   │   ├── models/                 # Mongoose models
│   │   ├── routes/                 # API routes
│   │   ├── services/               # RAG, chat, PDF logic
│   │   ├── utils/                  # Helper utilities
│   │   └── workers/                # Background processing
│   └── uploads/                    # Temporary PDF storage
│
├── AskPDF.postman_collection.json  # API testing collection
├── DEVELOPMENT.md                  # Development notes/log
└── README.md                       # Project documentation
```

The repository also includes a Postman collection for manual API testing. fileciteturn13file0L24-L26

---

# 🚀 Getting Started

## Prerequisites

- **Node.js:** v18+
- **MongoDB:** local MongoDB or MongoDB Atlas
- **Gemini API Key**
- npm

These prerequisites match the project's documented setup. fileciteturn13file0L173-L183

## 1. Clone

```bash
git clone https://github.com/Jyatin/AskPDF.git
cd AskPDF
```

## 2. Backend

```bash
cd server
npm install
```

Create `server/.env`, then start the backend:

```bash
npm run dev
```

Backend development server:

```text
http://localhost:5000
```

## 3. Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Frontend development server:

```text
http://localhost:5173
```

The repository documents these backend/frontend development flows and ports. fileciteturn13file0L173-L233

---

# 🔑 Environment Variables

Create `server/.env`:

```env
# Required
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/askpdf
GEMINI_API_KEY=your_gemini_api_key
PORT=5000

# Required in production
CORS_ORIGIN=https://ask-pdf-vert.vercel.app
```

> 🔒 **Never commit real credentials or API keys to Git.**

The repository currently documents these environment variables, including the production CORS origin. fileciteturn13file0L261-L275

---

# 📦 Production Build

### Backend

```bash
cd server
npm run build
```

### Frontend

```bash
cd client
npm run build
```

These production build commands are part of the documented workflow. fileciteturn13file0L235-L257

---

# ☁️ Deployment

AskPDF is currently documented as deployed using:

```text
Frontend       → Vercel
Backend        → Render
Database       → MongoDB Atlas
AI             → Gemini API
```

### Production

**Frontend**

https://ask-pdf-vert.vercel.app/

**Backend API**

`https://askpdf-backend-xt83.onrender.com`

**Health Check**

`https://askpdf-backend-xt83.onrender.com/health`

The repository documents the Vercel frontend, Render backend, MongoDB Atlas database, and Gemini-based AI deployment. fileciteturn13file0L281-L296

---

# 🧪 Testing

AskPDF currently does not have a formal automated test suite.

For API testing and manual verification, the repository includes:

```text
AskPDF.postman_collection.json
```

This matches the current project documentation. fileciteturn13file0L300-L304

---

# ⚠️ Current Limitations

AskPDF is actively evolving. Current documented limitations include:

- Conversation history is currently stored in frontend React state and is lost after a page reload.
- Semantic retrieval currently calculates cosine similarity in application memory rather than using a dedicated vector database.
- Retrieval is not optimized for very large document collections.
- Uploaded PDFs use temporary backend local storage during processing.

These are explicitly documented in the current project README. fileciteturn13file0L308-L315

---

# 🗺️ Roadmap — V2

```text
[x] PDF upload + extraction
[x] Document chunking
[x] Semantic retrieval
[x] RAG-based QA
[x] Page-aware retrieval
[x] Clickable page citations
[ ] Persistent conversations
[ ] Multi-document conversations
[ ] Improved retrieval/ranking
[ ] Dedicated vector database
[ ] Streaming responses
[ ] User authentication
[ ] Persistent cloud document storage
[ ] Large-document background processing
[ ] Advanced table/image understanding
```

The planned V2 direction currently includes persistent conversations, multi-document support, improved ranking, scalable vector search, streaming responses, authentication, cloud storage, background processing, security improvements, and richer document understanding. fileciteturn13file0L319-L334

---

# 🤝 Contributing

Contributions, ideas, bug reports, issues, and pull requests are welcome.

```bash
git checkout -b feature/your-feature

# make your changes

git add .
git commit -m "feat: describe your change"
git push origin feature/your-feature
```

Then open a Pull Request with:

- what changed
- why it changed
- how it was tested
- screenshots or recordings for UI changes

---

# 📌 Project Status

<div align="center">

### 🟢 Active Development

AskPDF is an evolving project focused on making document interaction more grounded, navigable, and useful through retrieval-augmented AI.

</div>

---

# 👨‍💻 Author

<div align="center">

## Jyatin Singh

Full-Stack Developer · AI Builder · Open Source Contributor

[![GitHub](https://img.shields.io/badge/GitHub-Jyatin-181717?style=for-the-badge&logo=github)](https://github.com/Jyatin)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Jyatin%20Singh-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/jyatin-singh-88984831b/)
[![Email](https://img.shields.io/badge/Email-singhjyatin%40gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:singhjyatin@gmail.com)

</div>

---

# ⭐ Support AskPDF

If AskPDF is useful or interesting, consider giving the repository a ⭐.

It helps the project get discovered and encourages continued development.

<div align="center">

### Upload. Ask. Retrieve. Verify.

**📄 AskPDF**

</div>

---

## 📄 License

No license is currently specified in the repository.

Add a `LICENSE` file when you are ready to define how the project may be used, modified, and distributed.
