// routes/progressRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  markModuleComplete,
  trackModuleAccess,
  submitAssignment,
  submitProject,
  submitQuiz,
  updateTimeSpent,
  trackModuleTime,
  calculateStudentRisk,
  getUserProgressOverview
} from '../controllers/progressController.js';
import Enrollment from '../models/Enrollment.js';
import { isAdminOnly } from '../middleware/isAdminOnly.js';
import {Course} from '../models/Course.js';

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

// Track module access/start
router.post('/:courseId/modules/:moduleId/access', protect, async (req, res) => {
  try {
    const result = await trackModuleAccess(
      req.user._id,
      req.params.courseId,
      req.params.moduleId
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mark module as completed
// ✅ CORRECT - find enrollment by user and course
router.put('/:courseId/modules/:moduleId/complete', protect, async (req, res) => {
  try {
    const enrollment = await markModuleComplete(
      req.user._id, 
      req.params.courseId,  // Use course ID from URL
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

router.post('/admin/:userId/:courseId/mark-complete', protect, isAdminOnly, async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    const { type, moduleIds, sectionIds } = req.body; // type: 'all', 'sections', 'modules'
    
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (type === 'all') {
      // Mark all modules as complete
      const allModules = [];
      course.sections.forEach(section => {
        section.modules.forEach(module => {
          allModules.push({
            moduleId: module._id,
            sectionId: section._id,
            completed: true,
            completedAt: new Date()
          });
        });
      });
      
      enrollment.moduleProgress = allModules;
      
      // Mark all assignments as complete if they exist
      if (course.assignments && course.assignments.length > 0) {
        enrollment.assignmentProgress = course.assignments.map(assignment => ({
          assignmentId: assignment._id,
          submitted: true,
          submittedAt: new Date(),
          score: 100,
          feedback: 'Manually marked as complete by admin'
        }));
      }
      
      // Mark project as complete if it exists
      if (course.project && course.project.title) {
        enrollment.projectProgress = {
          submitted: true,
          submittedAt: new Date(),
          score: 100,
          feedback: 'Manually marked as complete by admin'
        };
      }
      
    } else if (type === 'sections' && sectionIds) {
      // Mark specific sections as complete
      sectionIds.forEach(sectionId => {
        const section = course.sections.find(s => s._id.toString() === sectionId);
        if (section) {
          section.modules.forEach(module => {
            const existingProgress = enrollment.moduleProgress.find(
              mp => mp.moduleId.toString() === module._id.toString()
            );
            if (existingProgress) {
              existingProgress.completed = true;
              existingProgress.completedAt = new Date();
            } else {
              enrollment.moduleProgress.push({
                moduleId: module._id,
                sectionId: section._id,
                completed: true,
                completedAt: new Date()
              });
            }
          });
        }
      });
    } else if (type === 'modules' && moduleIds) {
      // Mark specific modules as complete
      moduleIds.forEach(moduleId => {
        const existingProgress = enrollment.moduleProgress.find(
          mp => mp.moduleId.toString() === moduleId
        );
        if (existingProgress) {
          existingProgress.completed = true;
          existingProgress.completedAt = new Date();
        } else {
          // Find the section for this module
          let sectionId;
          course.sections.forEach(section => {
            if (section.modules.some(m => m._id.toString() === moduleId)) {
              sectionId = section._id;
            }
          });
          if (sectionId) {
            enrollment.moduleProgress.push({
              moduleId,
              sectionId,
              completed: true,
              completedAt: new Date()
            });
          }
        }
      });
    }
    
    await enrollment.save();
    
    // Recalculate progress
    const { calculateCourseProgress } = await import('../controllers/progressController.js');
    const progress = calculateCourseProgress(enrollment, course);
    
    res.json({
      message: 'Progress updated successfully',
      progress,
      enrollment
    });
    
  } catch (error) {
    console.error('Error marking complete:', error);
    res.status(500).json({ message: 'Error updating progress', error: error.message });
  }
});

