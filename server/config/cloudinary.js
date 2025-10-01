// config/cloudinary.js - Add submission storage
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from "dotenv";
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage for profile pictures
const profilePictureStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'user-profiles',
    format: async (req, file) => 'jpg',
    public_id: (req, file) => {
      const timestamp = Date.now();
      return `profile-${req.user.id}-${timestamp}`;
    },
    transformation: [
      { width: 500, height: 500, crop: 'limit' },
      { quality: 'auto' },
      { format: 'jpg' }
    ]
  }
});

// Configure storage for cover photos
const coverPhotoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'user-covers',
    format: async (req, file) => 'jpg',
    public_id: (req, file) => {
      const timestamp = Date.now();
      return `cover-${req.user.id}-${timestamp}`;
    },
    transformation: [
      { width: 1920, height: 1080, crop: 'limit' }, // bigger than before
      { quality: 'auto:best' }, // Cloudinary will pick highest needed
      { format: 'jpg' }
    ]
  }
});

// Configure storage for project submissions - FIXED for all file types
const submissionStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine resource type based on file mimetype
    let resource_type = 'auto'; // Let Cloudinary auto-detect
    
    // For specific file types, set resource_type explicitly
    if (file.mimetype.startsWith('image/')) {
      resource_type = 'image';
    } else if (file.mimetype.startsWith('video/')) {
      resource_type = 'video';
    } else if (file.mimetype.includes('pdf') || 
               file.mimetype.includes('document') || 
               file.mimetype.includes('sheet') ||
               file.mimetype.includes('text') ||
               file.mimetype.includes('zip')) {
      resource_type = 'raw'; // Use 'raw' for documents, PDFs, etc.
    }

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const userId = req.user?._id || 'anonymous';
    const originalName = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '-');
    
    return {
      folder: 'project-submissions',
      resource_type: resource_type, // This is the key fix!
      public_id: `submission-${userId}-${originalName}-${timestamp}-${random}`,
      // Only apply transformations for images
      ...(resource_type === 'image' && {
        transformation: [
          { quality: 'auto' },
          { format: 'auto' }
        ]
      })
    };
  }
});


export { 
  cloudinary, 
  profilePictureStorage, 
  coverPhotoStorage,
  submissionStorage  // Add this export
};