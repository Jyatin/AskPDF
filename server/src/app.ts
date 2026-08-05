import express from "express";
import cors from "cors";
import documentRoutes from "./routes/document.routes";

const app = express();

// Middleware
app.use(cors());
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