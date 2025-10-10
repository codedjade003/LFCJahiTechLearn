import multer from "multer";
import path from "path";
import { uploadToCloudinary } from "../utils/fileUploader.js";

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Use Cloudinary upload instead of local storage
    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      req.user._id
    );

    res.json({ 
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      message: "File uploaded successfully to cloud storage" 
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ 
      message: "File upload failed", 
      error: error.message 
    });
  }
};