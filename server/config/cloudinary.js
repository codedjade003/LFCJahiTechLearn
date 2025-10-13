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

// Unified storage configuration for ALL file types
const unifiedStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine resource type based on file mimetype
    let resource_type = 'auto';
    let folder = 'uploads';
    
    if (file.mimetype.startsWith('image/')) {
      resource_type = 'image';
    } else if (file.mimetype.startsWith('video/')) {
      resource_type = 'video';
    } else if (file.mimetype.includes('pdf') || 
               file.mimetype.includes('document') || 
               file.mimetype.includes('sheet') ||
               file.mimetype.includes('text') ||
               file.mimetype.includes('zip')) {
      resource_type = 'raw';
    }

    // Determine folder based on upload type
    const uploadType = req.params.type || 'general';
  switch(uploadType) {
    case 'thumbnail':
    case 'avatar':
      folder = 'course-materials/images';
      break;
    case 'promo':
      folder = 'course-materials/videos';
      break;
    case 'pdf':
    case 'document':
      folder = 'course-materials/documents';
      break;
    case 'submission':
      folder = 'submissions';
      break;
    case 'assignment':
      folder = 'assignments';
      break;
    case 'profile':
      folder = 'user-profiles';
      break;
    case 'cover':
      folder = 'user-covers';
      break;
    case 'material':  // Add this case
      folder = 'course-materials';
      break;
    default:
      folder = 'uploads/general';
  }

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const userId = req.user?._id || 'anonymous';
    const originalName = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '-');
    
    const params = {
      folder: folder,
      resource_type: resource_type,
      public_id: `${uploadType}-${userId}-${originalName}-${timestamp}-${random}`,
    };

    // Apply optimizations for images
    if (resource_type === 'image') {
      params.transformation = [
        { quality: 'auto' },
        { format: 'auto' }
      ];
    }

    // Apply optimizations for videos
    if (resource_type === 'video') {
      params.chunk_size = 6000000; // 6MB chunks for large videos
    }

    return params;
  }
});

export { 
  cloudinary, 
  unifiedStorage
};