import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { upload } from "../middleware/upload.middleware";
import { chat } from "../controllers/chat.controller";
import { uploadDocument } from "../controllers/document.controller";

const router = Router();

// Multer error handler wrapper
const handleUpload = (req: Request, res: Response, next: NextFunction): void => {
  upload.single("file")(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        res.status(413).json({ error: "File size exceeds the 20 MB limit." });
        return;
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        res.status(415).json({ error: "Only PDF files are allowed." });
        return;
      }
      res.status(400).json({ error: err.message });
      return;
    }

    if (err) {
      res.status(500).json({ error: "File upload failed." });
      return;
    }

    next();
  });
};

router.post("/upload", handleUpload, uploadDocument);
router.post("/:documentId/chat", chat);

export default router;
