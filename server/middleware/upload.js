// middleware/upload.js
import multer from 'multer';
import { unifiedStorage } from '../config/cloudinary.js';

// File filter for images
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Upload middleware for profile pictures - UPDATED
const uploadProfilePicture = multer({
  storage: unifiedStorage, // Use unified storage instead of profilePictureStorage
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload middleware for cover photos - UPDATED
const uploadCoverPhoto = multer({
  storage: unifiedStorage, // Use unified storage instead of coverPhotoStorage
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit (fixed from 100MB to 10MB)
  }
});

export { uploadProfilePicture, uploadCoverPhoto };