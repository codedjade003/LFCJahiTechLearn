// routes/proctoringRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  logQuizViolation,
  submitQuizWithProctoring,
  getQuizProctoringData,
  analyzeQuizAttempt,
  getFlaggedAttempts,
  reviewQuizAttempt
} from '../controllers/proctoringController.js';

const router = express.Router();

// Quiz proctoring routes
router.post('/:courseId/quizzes/:quizId/violation', protect, logQuizViolation);
router.post('/:courseId/quizzes/:quizId/submit', protect, submitQuizWithProctoring);
router.get('/:courseId/quizzes/:quizId/proctoring-data', protect, getQuizProctoringData);
router.get('/:courseId/quizzes/:quizId/analysis', protect, analyzeQuizAttempt);

// Admin proctoring review routes
router.get('/admin/flagged-attempts', protect, getFlaggedAttempts);
router.post('/admin/attempts/:attemptId/review', protect, reviewQuizAttempt);

export default router;