// routes/courseUploadRoutes.js
import express from "express";
import multer from "multer";
import { courseMaterialStorage } from "../config/cloudinary.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer with Cloudinary storage for course materials
const uploadCourseMaterial = multer({ 
  storage: courseMaterialStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    // Allow images, videos, and PDFs
    if (file.mimetype.startsWith('image/') || 
        file.mimetype.startsWith('video/') || 
        file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image, video, and PDF files are allowed for course materials!'), false);
    }
  }
});

// Upload course materials (thumbnails, promo videos, avatars, PDFs)
// CHANGED: Removed "/courses/upload" from the path since it's now in the base path
router.post("/:type", protect, uploadCourseMaterial.single("file"), (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "No file uploaded or upload failed" });
    }

    console.log("✅ Course material uploaded:", {
      type: req.params.type,
      filename: req.file.originalname,
      url: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Determine resource type for proper Cloudinary handling
    let resourceType = 'auto';
    if (req.file.mimetype.startsWith('image/')) {
      resourceType = 'image';
    } else if (req.file.mimetype.startsWith('video/')) {
      resourceType = 'video';
    } else if (req.file.mimetype === 'application/pdf') {
      resourceType = 'raw'; // PDFs should be treated as raw files in Cloudinary
    }

    res.json({
      url: req.file.path,
      secure_url: req.file.path,
      public_id: req.file.filename,
      original_filename: req.file.originalname,
      resource_type: resourceType,
      mimetype: req.file.mimetype,
      message: "File uploaded successfully to cloud storage"
    });
  } catch (error) {
    console.error("❌ Course upload error:", error);
    res.status(500).json({ 
      message: "File upload failed", 
      error: error.message 
    });
  }
});

export default router;