// routes/enrollmentRoutes.js
import express from "express";
import User from "../models/User.js";
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
  getCourseEnrollmentStats,
  unenrollUserFromCourse,
  unenrollAllUsersFromCourse,
  selfUnenrollFromCourse
} from "../controllers/enrollmentController.js";
import { logAction } from "../middleware/logAction.js";
import Enrollment from '../models/Enrollment.js';
import { calculateStudentRisk } from '../controllers/progressController.js'; // Add this import

const router = express.Router();

router.post("/:courseId", protect, logAction('enroll', 'course'), enrollInCourse);
router.get("/my", protect, getMyEnrollments); // No logging
router.get("/course/:courseId", protect, getCourseEnrollments); // No logging
router.put("/:courseId/progress", protect, logAction('update', 'progress'), updateProgress);
router.delete("/unenroll/:courseId/:userId", protect, logAction('unenroll', 'course'), isAdminOnly, unenrollUserFromCourse);
router.delete("/self-unenroll/:courseId", protect, logAction('unenroll', 'course'), selfUnenrollFromCourse);
router.delete("/unenroll-all/:courseId", protect, logAction('unenroll all', 'course'), isAdminOnly, unenrollAllUsersFromCourse);

// Get progress overview for admin dashboard
// In enrollmentRoutes.js - UPDATE the progress overview route
router.get('/progress/overview', protect, isAdminOnly, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ status: 'active' })
      .populate('user', 'name email profilePicture')
      .populate('course', 'title duration type');

    const validEnrollments = enrollments.filter(e => e.course);

    const coursesWithRisk = validEnrollments.map(e => {
      const riskLevel = calculateStudentRisk(e, e.course);
      const timeSpentHours = Math.round((e.timeSpent || 0) / 60);
      return {
        _id: e.course._id,
        name: e.course.title,
        percentage: e.progress || 0,
        color: getProgressColor(e.progress),
        icon: getCourseIcon(e.course.type),
        riskLevel,
        timeSpent: timeSpentHours,
        enrolledAt: e.enrolledAt,
        estimatedDuration: e.course.duration || '1 month',
        user: e.user ? {
          _id: e.user._id,
          name: e.user.name,
          email: e.user.email,
          profilePicture: e.user.profilePicture
        } : null
      };
    });

    const totalUsers = await User.countDocuments();

    const stats = {
      atRisk: coursesWithRisk.filter(c => c.riskLevel !== 'none').length,
      onTrack: coursesWithRisk.filter(c => c.riskLevel === 'none' && c.percentage < 100).length,
      completed: coursesWithRisk.filter(c => c.percentage === 100).length,
      totalEnrollments: coursesWithRisk.length,
      totalUsers // 👈 new field
    };

    res.json({ courses: coursesWithRisk, stats });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching progress overview', error: err.message });
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