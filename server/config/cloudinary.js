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
    // Default resource type
    let resource_type = 'auto';
    let folder = 'uploads';

    // Determine folder based on upload type or route
    const uploadType = req.params.type || 'general';
    
    // Check if this is a submission route
    if (req.originalUrl && req.originalUrl.includes('/api/submissions/')) {
      if (req.originalUrl.includes('/project')) {
        folder = 'submissions/projects';
      } else if (req.originalUrl.includes('/assignments/')) {
        folder = 'submissions/assignments';
      } else {
        folder = 'submissions';
      }
      
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const userId = req.user?._id || 'anonymous';
      const originalName = file.originalname
        .split('.')[0]
        .replace(/[^a-zA-Z0-9]/g, '-');
      const ext = file.originalname.split('.').pop();

      return {
        folder,
        resource_type,
        public_id: `submission-${userId}-${originalName}-${timestamp}-${random}`,
        format: ext,
      };
    }
    
    // Handle other upload types
    switch (uploadType) {
      case 'thumbnail':
      case 'avatar':
        folder = 'course-materials/images';
        break;
      case 'promo':
        folder = 'course-materials/videos';
        break;
      case 'pdf':
      case 'document':
      case 'material':
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
      default:
        folder = 'uploads/general';
    }

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const userId = req.user?._id || 'anonymous';

    // Keep the original extension so Cloudinary URL stays file-type-friendly
    const originalName = file.originalname
      .split('.')[0]
      .replace(/[^a-zA-Z0-9]/g, '-');
    const ext = file.originalname.split('.').pop();

    const params = {
      folder,
      resource_type, // ✅ Always auto
      // Don't add extension to public_id - Cloudinary handles it automatically
      public_id: `${uploadType}-${userId}-${originalName}-${timestamp}-${random}`,
      // Add format to preserve the original file type
      format: ext,
    };

    // Image optimizations
    if (file.mimetype.startsWith('image/')) {
      params.transformation = [{ quality: 'auto' }, { format: 'auto' }];
    }

    // Video optimizations
    if (file.mimetype.startsWith('video/')) {
      params.chunk_size = 6000000;
    }

    return params;
  }

});

export { 
  cloudinary, 
  unifiedStorage
};