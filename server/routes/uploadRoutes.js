import express from "express";
import multer from "multer";
import { unifiedStorage } from "../config/cloudinary.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer with unified storage
const upload = multer({ 
  storage: unifiedStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all common file types including octet-stream
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/mov', 'video/avi', 'video/webm', 'video/x-matroska',
      'video/quicktime', 'video/mpeg',
      'application/pdf', 
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'application/x-zip-compressed',
      'application/octet-stream' // Add this to accept generic files
    ];

    // Also check file extensions as fallback
    const allowedExtensions = [
      '.jpg', '.jpeg', '.png', '.gif', '.webp',
      '.mp4', '.mov', '.avi', '.webm', '.mkv', '.mpeg', '.mpg',
      '.pdf', '.txt',
      '.doc', '.docx',
      '.xls', '.xlsx',
      '.zip'
    ];

    const fileExtension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));

    if (allowedTypes.includes(file.mimetype) || 
        allowedExtensions.includes(fileExtension) ||
        file.mimetype === 'application/octet-stream') {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} with extension ${fileExtension} is not allowed`), false);
    }
  }
});

// Unified upload endpoint for ALL file types
router.post("/:type", protect, upload.single("file"), (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "No file uploaded or upload failed" });
    }

    console.log("✅ File uploaded successfully:", {
      type: req.params.type,
      filename: req.file.originalname,
      url: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      folder: req.file.folder
    });

    // Determine resource type for response
    let resourceType = 'auto';
    if (req.file.mimetype.startsWith('image/')) {
      resourceType = 'image';
    } else if (req.file.mimetype.startsWith('video/')) {
      resourceType = 'video';
    } else if (req.file.mimetype === 'application/pdf') {
      resourceType = 'raw';
    }

    res.json({
      success: true,
      url: req.file.path,
      secure_url: req.file.path,
      public_id: req.file.filename,
      original_filename: req.file.originalname,
      resource_type: resourceType,
      mimetype: req.file.mimetype,
      size: req.file.size,
      message: "File uploaded successfully to cloud storage"
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ 
      success: false,
      message: "File upload failed", 
      error: error.message 
    });
  }
});

// Health check for upload route
router.get("/health", (req, res) => {
  res.json({ 
    status: "Upload route is working",
    timestamp: new Date().toISOString()
  });
});

export default router;