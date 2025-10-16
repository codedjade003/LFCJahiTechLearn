// routes/nuke.js
import express from 'express';
import mongoose from 'mongoose';
import { Course } from '../models/Course.js';
import { Submission } from '../models/Submission.js';
import SupportTicket from '../models/SupportTicket.js';
import Enrollment from '../models/Enrollment.js';
import Notification from '../models/Notification.js';
import Log from '../models/Log.js';
import Feedback from '../models/Feedback.js';
import User from '../models/User.js';
import { v2 as cloudinary } from 'cloudinary';
import { protect } from '../middleware/authMiddleware.js'; // Import your auth middleware

const router = express.Router();

// Fixed super admin check - use email instead of ID
const isSuperAdmin = (req, res, next) => {
  // Check if user exists and has the super admin email
  if (req.user && req.user.email === 'codedjade003@gmail.com') {
    return next();
  }

  return res.status(403).json({ 
    message: "Super admin access required",
    error: "FORBIDDEN"
  });
};

// Function to delete all files from Cloudinary in a folder
const deleteCloudinaryFolder = async (folder) => {
  try {
    console.log(`🗑️ Deleting Cloudinary folder: ${folder}`);
    
    // List all resources in the folder
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder,
      max_results: 500
    });

    if (result.resources.length > 0) {
      const publicIds = result.resources.map(resource => resource.public_id);
      
      // Delete all files in batch
      const deleteResult = await cloudinary.api.delete_resources(publicIds);
      console.log(`✅ Deleted ${publicIds.length} files from ${folder}`);
      
      return deleteResult;
    } else {
      console.log(`📁 No files found in ${folder}`);
      return { deleted: {} };
    }
  } catch (error) {
    console.error(`❌ Error deleting Cloudinary folder ${folder}:`, error);
    throw error;
  }
};

// Function to delete all Cloudinary content except user avatars
const cleanupCloudinary = async () => {
  try {
    console.log('🚀 Starting Cloudinary cleanup...');
    
    // Define folders to delete (everything except user-related)
    const foldersToDelete = [
      'courses/thumbnails',
      'courses/promo_videos', 
      'courses/instructor_avatars',
      'courses/module_videos',
      'courses/module_pdfs',
      'assignments',
      'projects',
      'submissions'
    ];

    for (const folder of foldersToDelete) {
      await deleteCloudinaryFolder(folder);
    }

    console.log('✅ Cloudinary cleanup completed');
    return { success: true, message: 'Cloudinary cleanup completed' };
  } catch (error) {
    console.error('❌ Cloudinary cleanup failed:', error);
    throw error;
  }
};

// Function to wipe all database collections except users
const wipeDatabase = async () => {
  try {
    console.log('🗄️ Starting database wipe...');
    
    // List of collections to wipe (in order to handle dependencies)
    const collectionsToWipe = [
      { name: 'notifications', model: Notification },
      { name: 'logs', model: Log },
      { name: 'feedbacks', model: Feedback },
      { name: 'supporttickets', model: SupportTicket },
      { name: 'submissions', model: Submission },
      { name: 'enrollments', model: Enrollment },
      { name: 'courses', model: Course }
    ];

    let results = {};
    
    for (const { name, model } of collectionsToWipe) {
      try {
        const deleteResult = await model.deleteMany({});
        results[name] = deleteResult.deletedCount;
        console.log(`✅ Wiped ${deleteResult.deletedCount} documents from ${name}`);
      } catch (error) {
        console.error(`❌ Error wiping ${name}:`, error);
        results[name] = { error: error.message };
      }
    }

    // Clean up user data (remove course-related fields but keep users)
    try {
      const userUpdateResult = await User.updateMany(
        {},
        {
          $unset: {
            enrolledCourses: 1,
            completedCourses: 1,
            progress: 1,
            notifications: 1,
            lastLogin: 1,
            loginCount: 1
          },
        }
      );
      results.users_cleaned = userUpdateResult.modifiedCount;
      console.log(`✅ Cleaned ${userUpdateResult.modifiedCount} user records`);
    } catch (error) {
      console.error('❌ Error cleaning user data:', error);
      results.users_cleaned = { error: error.message };
    }

    console.log('✅ Database wipe completed');
    return results;
  } catch (error) {
    console.error('❌ Database wipe failed:', error);
    throw error;
  }
};

// Apply auth middleware ONLY to nuke routes
// Main nuke route - requires authentication AND super admin
router.post('/nuke', protect, isSuperAdmin, async (req, res) => {
  try {
    console.log('💥 NUKE COMMAND INITIATED BY:', req.user.email);
    console.log('⏰ Timestamp:', new Date().toISOString());
    
    const { confirm } = req.body;
    
    if (!confirm || confirm !== 'I_UNDERSTAND_THIS_WILL_DELETE_EVERYTHING') {
      return res.status(400).json({
        message: 'Safety confirmation required. Send confirm: "I_UNDERSTAND_THIS_WILL_DELETE_EVERYTHING" in the request body.',
        warning: 'THIS ACTION IS IRREVERSIBLE AND WILL DELETE ALL COURSES, PROGRESS, SUBMISSIONS, AND MEDIA FILES.'
      });
    }

    // Start the nuke process
    const dbResults = await wipeDatabase();
    const cloudinaryResults = await cleanupCloudinary();

    // Log the nuke action
    console.log('💥 NUKE COMPLETED SUCCESSFULLY');
    console.log('📊 Results:', {
      database: dbResults,
      cloudinary: cloudinaryResults
    });

    res.json({
      message: '💥 NUKE COMPLETED SUCCESSFULLY',
      timestamp: new Date().toISOString(),
      initiatedBy: req.user.email,
      results: {
        database: dbResults,
        cloudinary: cloudinaryResults
      },
      warning: 'All course data, progress, submissions, and media files have been permanently deleted. User accounts preserved.'
    });

  } catch (error) {
    console.error('💥 NUKE FAILED:', error);
    res.status(500).json({
      message: 'Nuke operation failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route to get nuke status (dry run) - requires authentication AND super admin
router.get('/nuke/status', protect, isSuperAdmin, async (req, res) => {
  try {
    console.log('🔍 NUKE STATUS CHECK BY:', req.user.email);
    
    // Count documents in each collection
    const status = {
      database: {
        courses: await Course.countDocuments(),
        submissions: await Submission.countDocuments(),
        supporttickets: await SupportTicket.countDocuments(),
        enrollments: await Enrollment.countDocuments(),
        notifications: await Notification.countDocuments(),
        logs: await Log.countDocuments(),
        feedbacks: await Feedback.countDocuments(),
        users: await User.countDocuments()
      },
      cloudinary: {
        note: 'Cloudinary folder status would be checked here'
      },
      warning: 'THIS IS A READ-ONLY STATUS CHECK. NO DATA WILL BE DELETED.'
    };

    res.json({
      message: 'Nuke status check completed',
      timestamp: new Date().toISOString(),
      status,
      nextSteps: {
        toExecute: 'POST /api/nuke with { "confirm": "I_UNDERSTAND_THIS_WILL_DELETE_EVERYTHING" }'
      }
    });

  } catch (error) {
    console.error('Status check failed:', error);
    res.status(500).json({
      message: 'Status check failed',
      error: error.message
    });
  }
});

export default router;