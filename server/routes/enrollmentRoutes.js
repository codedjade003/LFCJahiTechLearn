// routes/enrollmentRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { isAdminOnly } from "../middleware/isAdminOnly.js";
import {
  enrollInCourse,
  getMyEnrollments,
  getCourseEnrollments,
  updateProgress,
  getAllEnrollments,
  enrollAllUsersInCourse, // Add the new function
  enrollUsersInCourse,
  getCourseEnrollmentStats
} from "../controllers/enrollmentController.js";
import { logAction } from "../middleware/logAction.js";
import Enrollment from '../models/Enrollment.js';
import { calculateStudentRisk } from '../controllers/progressController.js'; // Add this import

const router = express.Router();

router.post("/:courseId", protect, logAction('enroll', 'course'), enrollInCourse);
router.get("/my", protect, getMyEnrollments); // No logging
router.get("/course/:courseId", protect, getCourseEnrollments); // No logging
router.put("/:courseId/progress", protect, logAction('update', 'progress'), updateProgress);

// Get progress overview for admin dashboard
// FIXED enrollmentRoutes.js - Better filtering
// In enrollmentRoutes.js - UPDATE the progress overview route
router.get('/progress/overview', protect, isAdminOnly, async (req, res) => {
  try {
    // SIMPLIFIED: No need to filter deleted courses since they're hard deleted
    const enrollments = await Enrollment.find({ status: 'active' })
      .populate('user', 'name email')
      .populate('course', 'title duration type');

    // No need for aggressive filtering since deleted courses are gone
    const validEnrollments = enrollments.filter(enrollment => enrollment.course);

    console.log(`Total enrollments: ${enrollments.length}, Valid: ${validEnrollments.length}`);

    // Calculate risk levels and stats
    const coursesWithRisk = validEnrollments.map(enrollment => {
      const riskLevel = calculateStudentRisk(enrollment, enrollment.course);
      
      const timeSpentHours = Math.round((enrollment.timeSpent || 0) / 60);
      const progress = enrollment.progress || 0;
      
      return {
        _id: enrollment.course._id,
        name: enrollment.course.title,
        percentage: enrollment.progress || 0,
        color: getProgressColor(enrollment.progress),
        icon: getCourseIcon(enrollment.course.type),
        riskLevel,
        timeSpent: timeSpentHours,
        enrolledAt: enrollment.enrolledAt,
        estimatedDuration: enrollment.course.duration || '1 month'
      };
    });

    const stats = {
      atRisk: coursesWithRisk.filter(course => course.riskLevel !== 'none').length,
      onTrack: coursesWithRisk.filter(course => course.riskLevel === 'none' && course.percentage < 100).length,
      completed: coursesWithRisk.filter(course => course.percentage === 100).length,
      total: coursesWithRisk.length
    };

    res.json({
      courses: coursesWithRisk,
      stats
    });
  } catch (error) {
    console.error('Error fetching progress overview:', error);
    res.status(500).json({ message: 'Error fetching progress overview', error: error.message });
  }
});
// Helper functions
const getProgressColor = (progress) => {
  if (progress >= 80) return 'bg-green-600';
  if (progress >= 50) return 'bg-yellow-500';
  if (progress >= 25) return 'bg-blue-600';
  return 'bg-red-500';
};

const getCourseIcon = (courseType) => {
  // You'll need to import these icons
  const icons = {
    'Video': '🎬', 'Audio': '🎵', 'Graphics': '🎨', 
    'Required': '📋', 'Content Creation': '✏️', 
    'Utility': '🛠️', 'Secretariat': '📊'
  };
  return icons[courseType] || '📚';
};

// Admin-only routes
router.get("/all", protect, isAdminOnly, getAllEnrollments); // No logging
router.post("/enroll-all/:courseId", protect, logAction('enroll_all', 'course'), isAdminOnly, enrollAllUsersInCourse);
router.get("/stats/:courseId", protect, isAdminOnly, getCourseEnrollmentStats); // No logging
router.post("/enroll-users/:courseId", protect, logAction('enroll_users', 'course'), isAdminOnly, enrollUsersInCourse);

export default router;