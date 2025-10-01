// routes/uploadRoutes.js
import express from "express";
import multer from "multer";
import { submissionStorage } from "../config/cloudinary.js";

const router = express.Router();
const upload = multer({ storage: submissionStorage });

router.post("/material", upload.single("file"), (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: "Upload failed" });
  }

  res.json({
    secure_url: req.file.path,
    original_filename: req.file.originalname,
    resource_type: req.file.mimetype.startsWith("image/")
      ? "image"
      : req.file.mimetype.startsWith("video/")
      ? "video"
      : "document",
  });
});

export default router;
