import express from "express";
import cors from "cors";
import documentRoutes from "./routes/document.routes";

const app = express();

// Middleware
const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "OK",
    message: "AskPDF Backend is running 🚀",
  });
});

// Routes
app.use("/api/documents", documentRoutes);

export default app;