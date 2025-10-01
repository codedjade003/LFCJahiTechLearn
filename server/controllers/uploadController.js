import multer from "multer";
import path from "path";

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

const upload = multer({ storage });

export const uploadFile = (req, res) => {
  const uploadHandler = upload.single("file");
  
  uploadHandler(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: "File upload failed", error: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    // Return the file path/URL
    res.json({ 
      url: `/uploads/${req.file.filename}`,
      message: "File uploaded successfully" 
    });
  });
};