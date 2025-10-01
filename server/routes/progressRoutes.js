// routes/progressRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  markModuleComplete,
  submitAssignment,
  submitProject,
  submitQuiz,
  updateTimeSpent,
  trackModuleTime,
  calculateStudentRisk,
  getUserProgressOverview
} from '../controllers/progressController.js';

const router = express.Router();

// Progress overview for dashboard
router.get('/overview', protect, async (req, res) => {
  try {
    const overview = await getUserProgressOverview(req.user._id);
    res.json(overview);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching progress overview', error: error.message });
  }
});

// Mark module as completed
router.put('/:courseId/modules/:moduleId/complete', protect, async (req, res) => {
  try {
    const enrollment = await markModuleComplete(
      req.user._id, 
      req.params.courseId, 
      req.params.moduleId
    );
    res.json({ progress: enrollment.progress, enrollment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Track time spent on module
router.post('/:courseId/modules/:moduleId/track-time', protect, async (req, res) => {
  try {
    const { timeSpentMinutes } = req.body;
    await trackModuleTime(
      req.user._id,
      req.params.courseId,
      req.params.moduleId,
      timeSpentMinutes
    );
    res.json({ message: 'Time tracked successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Submit assignment
router.post('/:courseId/assignments/:assignmentId/submit', protect, async (req, res) => {
  try {
    const enrollment = await submitAssignment(
      req.user._id,
      req.params.courseId,
      req.params.assignmentId,
      req.body
    );
    res.json({ progress: enrollment.progress, enrollment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Submit project
router.post('/:courseId/project/submit', protect, async (req, res) => {
  try {
    const enrollment = await submitProject(
      req.user._id,
      req.params.courseId,
      req.body
    );
    res.json({ message: "Project submitted successfully", enrollment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Submit quiz
router.post('/:courseId/quizzes/:quizId/submit', protect, async (req, res) => {
  try {
    const result = await submitQuiz(
      req.user._id,
      req.params.courseId,
      req.params.quizId,
      req.body.answers
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user progress for a course
router.get('/:courseId', protect, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: req.params.courseId
    }).populate('course');
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    
    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching progress', error: error.message });
  }
});

export default router;