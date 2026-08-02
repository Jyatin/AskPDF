import express from "express";

const app = express();

// Middleware
app.use(express.json());

// Route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "AskPDF Backend is running 🚀",
  });
});

export default app;