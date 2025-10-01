// utils/fileUploader.js
import { cloudinary } from '../config/cloudinary.js';

export const uploadToCloudinary = (fileBuffer, originalName, userId) => {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const cleanName = originalName.split('.')[0].replace(/[^a-zA-Z0-9]/g, '-');
    const public_id = `submission-${userId}-${cleanName}-${timestamp}-${random}`;

    // Determine resource type based on file extension
    const ext = originalName.split('.').pop().toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
    
    let resource_type = 'raw'; // Default for documents, PDFs, etc.
    if (imageExts.includes(ext)) resource_type = 'image';
    if (videoExts.includes(ext)) resource_type = 'video';

    console.log(`📁 Uploading ${originalName} as ${resource_type} type`);

    const uploadOptions = {
      resource_type: resource_type,
      folder: 'project-submissions',
      public_id: public_id
    };

    // Only add transformations for images
    if (resource_type === 'image') {
      uploadOptions.transformation = [{ quality: 'auto' }];
    }

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('✅ Cloudinary upload successful:', result);
          resolve(result);
        }
      }
    ).end(fileBuffer);
  });
};