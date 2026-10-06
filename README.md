<div align="center">

# 📄 AskPDF

### **Conversational Document Intelligence with RAG**

**Upload a PDF → ask questions → retrieve grounded context → jump directly to the source page.**

<p>
  <a href="https://ask-pdf-vert.vercel.app/"><strong>🚀 Live Demo</strong></a>
  ·
  <a href="https://github.com/Jyatin/AskPDF"><strong>📦 Repository</strong></a>
</p>

<p>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white">
  <img src="https://img.shields.io/badge/Vite-Frontend-646CFF?style=flat-square&logo=vite&logoColor=white">
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=flat-square&logo=node.js&logoColor=white">
  <img src="https://img.shields.io/badge/Express.js-API-000000?style=flat-square&logo=express&logoColor=white">
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb&logoColor=white">
  <img src="https://img.shields.io/badge/Gemini-LLM%20%2B%20Embeddings-4285F4?style=flat-square&logo=google&logoColor=white">
  <img src="https://img.shields.io/badge/RAG-Retrieval%20Augmented%20Generation-7C3AED?style=flat-square">
</p>

</div>

---

## Overview

**AskPDF** is a full-stack Retrieval-Augmented Generation (RAG) application that turns PDF documents into conversational knowledge sources.

Instead of generating an answer from an LLM's general knowledge, AskPDF processes the uploaded document, retrieves relevant passages, provides that context to Gemini, and surfaces the source page alongside the response.

The core product idea is simple:

> **Answer the question — and show where the answer came from.**

### Core capabilities

- PDF upload and text extraction
- Page-aware document processing
- Document chunking
- Gemini-powered embeddings
- Semantic retrieval using cosine similarity
- Page-aware retrieval for page-specific questions
- Retrieval-Augmented Generation
- Grounded answers based on retrieved document context
- Source/page citations
- Clickable citation navigation back to the PDF
- Conversational follow-up questions
- MongoDB-backed document/chat persistence
- Gemini API error and rate-limit handling

---

## Why it is different from a basic "Chat with PDF" project

Many document-chat applications stop after generating an answer from a PDF.

AskPDF adds a **verification-oriented retrieval experience**: responses can expose the relevant source page and allow the user to navigate directly to that location in the document viewer.

That makes the retrieval pipeline visible to the user rather than treating the LLM response as a black box.

---

## 🧠 RAG Pipeline

```text
┌─────────────────────┐
│      Upload PDF     │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Extract Text +      │
│ Page Information    │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Chunk Document      │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Generate Embeddings │
│      via Gemini     │
└──────────┬──────────┘
           ↓
      User Question
           │
     ┌─────┴─────┐
     ↓           ↓
Semantic       Page-aware
Retrieval      Retrieval
     │           │
     └─────┬─────┘
           ↓
┌─────────────────────┐
│ Rank / Select       │
│ Relevant Context    │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Gemini Generation   │
│ with Retrieved      │
│ Document Context    │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Grounded Answer +   │
│ Source Page         │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Click Citation →    │
│ Jump to PDF Page    │
└─────────────────────┘
```

### Retrieval flow

1. Extract text while retaining page information.
2. Split the document into retrievable chunks.
3. Generate embeddings for the document content.
4. Embed the user's question.
5. Rank candidate chunks using cosine similarity.
6. Apply page-aware retrieval when the question targets a specific page.
7. Inject the most relevant context into the Gemini generation request.
8. Return the answer together with source/page information.
9. Allow the user to navigate directly to the cited page.

---

## 🏗️ Architecture

```text
                         ASKPDF
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
      React + TypeScript         Node + Express + TypeScript
           Vite                         │
      Tailwind CSS                     │
      TanStack Query                   ▼
      Axios                    ┌────────────────────┐
              │                 │ Application Layer  │
              │                 │ Routes/Controllers │
              │                 └─────────┬──────────┘
              │                           │
              │                           ▼
              │                 ┌────────────────────┐
              │                 │ RAG / PDF / Chat   │
              │                 │ Services           │
              │                 └──────┬──────┬──────┘
              │                        │      │
              │                        ▼      ▼
              │                    Gemini   pdf-parse
              │
              └──────────── HTTP API ───────────────┐
                                                     ▼
                                                MongoDB
```

### Frontend

- React + TypeScript
- Vite
- Tailwind CSS
- TanStack Query
- Axios
- PDF viewer and citation navigation
- Conversational chat interface

### Backend

- Node.js
- Express
- TypeScript
- REST API
- RAG/PDF/chat services
- MongoDB + Mongoose
- Gemini API integration

---

## 🛠️ Tech Stack

| Layer | Technology | Role |
|---|---|---|
| Frontend | React + TypeScript | Document and chat UI |
| Build | Vite | Frontend development/build |
| Styling | Tailwind CSS | UI system |
| Server State | TanStack Query | API/server-state management |
| HTTP | Axios | Client-server communication |
| Backend | Node.js + Express | REST API and application server |
| Database | MongoDB + Mongoose | Persistence |
| AI | Gemini API | Embeddings + answer generation |
| Retrieval | Cosine similarity | Semantic ranking |
| PDF | pdf-parse | Document extraction |
| Deployment | Vercel + Render | Cloud deployment |
| Database Hosting | MongoDB Atlas | Managed database |

---

## ✨ Key Features

### 📄 Document Processing

- PDF upload
- Text extraction
- Page-offset tracking
- Automatic chunking
- Temporary upload cleanup

### 🔎 Semantic Retrieval

- Embedding-based search
- Cosine-similarity ranking
- Meaning-aware retrieval rather than keyword-only matching
- Relevant-context selection before LLM generation

### 📑 Page-Aware Retrieval

Questions such as:

```text
What is mentioned on page 20?
```

can be handled using page-specific context rather than treating the document as one undifferentiated text corpus.

### 🎯 Grounded Answers

- Responses are generated from retrieved document context
- Source pages can be surfaced with responses
- Citations can be clicked to navigate to the corresponding PDF page
- Designed to make generated answers easier to inspect and verify

### 💬 Conversational Interaction

The interface supports follow-up questions such as:

```text
What is the main argument?

Can you explain that in simpler terms?

What evidence supports that?
```

---

## 🎨 Product UI

AskPDF is designed as a complete document-reading and conversational experience rather than only an API demo.

The interface includes:

- PDF document viewer
- Chat interface
- Citation/source navigation
- Upload workflow
- Loading and error states
- Conversational follow-ups
- Responsive layouts

---

## 🧪 Testing & Reliability

The current repository does **not** claim a formal automated unit/integration test suite. Instead, it includes a Postman API collection for manual API verification and documents the reliability safeguards implemented in the application.

### Manual/API verification

`AskPDF.postman_collection.json` is included for API testing.

### Reliability considerations

- Gemini API error handling
- Gemini rate-limit handling
- Environment-variable validation
- CORS configuration
- Temporary upload cleanup
- Production frontend/backend deployment

> This README intentionally does not claim a test count or coverage percentage that is not currently represented by an automated test suite.

---

## ☁️ Deployment

```text
Frontend       → Vercel
Backend        → Render
Database       → MongoDB Atlas
AI             → Gemini API
```

### Live application

**https://ask-pdf-vert.vercel.app/**

### Backend

`https://askpdf-backend-xt83.onrender.com`

### Health check

`https://askpdf-backend-xt83.onrender.com/health`

---

## 📁 Project Structure

```text
AskPDF/
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── lib/
│       └── pages/
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── workers/
│   └── uploads/
│
├── AskPDF.postman_collection.json
├── DEVELOPMENT.md
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB / MongoDB Atlas
- Gemini API key
- npm

### Clone

```bash
git clone https://github.com/Jyatin/AskPDF.git
cd AskPDF
```

### Backend

```bash
cd server
npm install
npm run dev
```

Backend:

```text
http://localhost:5000
```

### Frontend

In another terminal:

```bash
cd client
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🔐 Environment Variables

Create `server/.env`:

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/askpdf
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
CORS_ORIGIN=https://ask-pdf-vert.vercel.app
```

**Never commit real credentials or API keys.**

---

## 📦 Production Build

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

---

## ⚠️ Current Engineering Trade-offs

AskPDF is intentionally documented honestly about its current architecture.

### In-memory semantic ranking

Semantic retrieval currently performs cosine-similarity ranking in application memory rather than using a dedicated vector database/index.

**Why this matters:** it keeps the implementation straightforward for the current scale, but it is not the preferred architecture for very large document collections.

### Temporary document storage

Uploaded PDFs currently use temporary backend storage during processing.

### Conversation persistence

Conversation history is currently held in frontend state and is not yet a persistent multi-session conversation system.

These are planned areas for the next iteration rather than claims of functionality that does not currently exist.

---

## 🗺️ Roadmap

### Completed

- [x] PDF upload and extraction
- [x] Document chunking
- [x] Semantic retrieval
- [x] RAG-based question answering
- [x] Page-aware retrieval
- [x] Clickable source/page citations
- [x] Production deployment

### Next iteration

- [ ] Persistent conversations
- [ ] Multi-document conversations
- [ ] Dedicated vector index / vector database
- [ ] Retrieval evaluation dataset and metrics
- [ ] Streaming responses
- [ ] User authentication
- [ ] Persistent cloud document storage
- [ ] Background processing for large documents
- [ ] Improved table/image understanding

---

## Engineering Highlights

- Built a **5-stage RAG pipeline in Node.js** for PDFs up to **20 MB**, covering text extraction, document chunking, **768-dimensional embeddings**, semantic vector search, and context-grounded response generation.
- Engineered **Redis BRPOP background workers** with **202 Accepted** asynchronous responses, hash-based job tracking, and stale-job cleanup for reliable document processing.
- Reduced hallucination risk by enforcing a **>0.7 cosine-similarity threshold** before passing retrieved context to Gemini for generation.
- Implemented **page-aware retrieval and clickable source citations**, allowing users to inspect the document page behind an answer.
- Built separate **React/TypeScript frontend** and **Node.js/Express/TypeScript backend** with MongoDB persistence and Gemini API integration.
- Deployed the frontend and backend using **Vercel and Render**, with **MongoDB Atlas** as the managed database layer.

### Tech Stack

**Node.js · Express · TypeScript · React · MongoDB · Redis · Gemini API · RAG · Embeddings · Vector Search · Vercel · Render**

---
## Author

<div align="center">

### Jyatin Singh

<a href="https://github.com/Jyatin">GitHub</a> ·
<a href="https://www.linkedin.com/in/jyatinsingh/">LinkedIn</a>

</div>
