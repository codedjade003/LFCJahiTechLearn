// middleware/upload.js
import multer from 'multer';
import { profilePictureStorage, coverPhotoStorage } from '../config/cloudinary.js';

// File filter for images
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Upload middleware for profile pictures
const uploadProfilePicture = multer({
  storage: profilePictureStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload middleware for cover photos
const uploadCoverPhoto = multer({
  storage: coverPhotoStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 10MB limit
  }
});

export { uploadProfilePicture, uploadCoverPhoto };