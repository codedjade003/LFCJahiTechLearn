// routes/submissionRoutes.js - CORRECTED
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { isAdminOnly } from '../middleware/isAdminOnly.js';
import {
  submitAssignment,
  submitProject,
  submitQuiz,
  getSubmissions,
  gradeSubmission,
  getSubmission,
  getAssignmentSubmission,
  getProjectSubmission,
  upload,
  bulkGradeSubmissions,
  getStudentSubmissions,
  getCourseSubmissions,
  getSubmissionDetails,
  getSubmissionStats,
  getAllSubmissions
} from '../controllers/submissionController.js';
import { logAction } from '../middleware/logAction.js';

const router = express.Router();

// Add debug logging to see which routes are hit
router.use((req, res, next) => {
  console.log(`📥 SUBMISSION ROUTE: ${req.method} ${req.originalUrl}`);
  next();
});

// Student routes
router.get('/course/:courseId', protect, getSubmissions);

// FIXED: Assignment and Project submission routes
router.get('/course/:courseId/assignments/:assignmentId', protect, getAssignmentSubmission);
router.get('/course/:courseId/project', protect, getProjectSubmission);

// Remove the conflicting route - it's causing issues
// router.get('/course/:courseId/assignments/:assignmentId/submission', protect, getSubmission);

// Submission creation routes
router.post('/course/:courseId/assignments/:assignmentId', protect, upload.single('submissionFile'), logAction('upload', 'assignment'), submitAssignment);
router.post('/course/:courseId/project', protect, upload.single('submissionFile'), logAction('upload', 'project'), submitProject);
router.post('/course/:courseId/quizzes/:quizId', protect, submitQuiz);

// Admin submission management routes
router.get('/admin/submissions', protect, isAdminOnly, getAllSubmissions);
router.get('/admin/submissions/stats', protect, isAdminOnly, getSubmissionStats);
router.get('/admin/submissions/:submissionId', protect, isAdminOnly, getSubmissionDetails);
router.get('/admin/courses/:courseId/submissions', protect, isAdminOnly, getCourseSubmissions);
router.get('/admin/students/:studentId/submissions', protect, isAdminOnly, getStudentSubmissions);

// Enhanced grading routes
router.put('/:submissionId/grade', protect, isAdminOnly, gradeSubmission);
router.post('/admin/bulk-grade', protect, isAdminOnly, bulkGradeSubmissions);

export default router;