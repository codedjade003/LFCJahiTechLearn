// utils/fileUploader.js - FIXED VERSION
import { cloudinary } from '../config/cloudinary.js';

export const uploadToCloudinary = (fileBuffer, originalName, userId, uploadType = 'submission') => {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const cleanName = originalName.split('.')[0].replace(/[^a-zA-Z0-9]/g, '-');
    const public_id = `${uploadType}-${userId}-${cleanName}-${timestamp}-${random}`;

    // Determine resource type based on file extension
    const ext = originalName.split('.').pop().toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
    const pdfExts = ['pdf', 'doc', 'docx', 'txt'];
    
    let resource_type = 'raw'; // Default for documents
    let folder = 'submissions';
    
    if (imageExts.includes(ext)) {
      resource_type = 'image';
      folder = 'submissions/images';
    } else if (videoExts.includes(ext)) {
      resource_type = 'video';
      folder = 'submissions/videos';
    } else if (pdfExts.includes(ext)) {
      folder = 'submissions/documents';
    }

    // Set different folders based on upload type
    if (uploadType === 'assignment') {
      folder = 'assignments' + folder.substring(10); // assignments/images, assignments/videos, etc.
    } else if (uploadType === 'project') {
      folder = 'projects' + folder.substring(10); // projects/images, projects/videos, etc.
    }

    console.log(`📁 Uploading ${originalName} as ${resource_type} type to ${folder}`);

    const uploadOptions = {
      resource_type: resource_type,
      folder: folder,
      public_id: public_id,
      use_filename: true,
      unique_filename: true
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
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else {
          console.log('✅ Cloudinary upload successful:', {
            url: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type
          });
          resolve(result);
        }
      }
    ).end(fileBuffer);
  });
};