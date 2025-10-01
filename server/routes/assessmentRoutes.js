// routes/assessmentRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Enrollment from '../models/enrollmentModel.js';
import { isCourseInstructorOrSuperAdmin } from '../middleware/isCourseInstructor.js';

const router = express.Router();

// Grade assignment (only course instructor)
router.put('/:courseId/assignments/:assignmentId/grade', 
  protect, 
  isCourseInstructorOrSuperAdmin,
  async (req, res) => {
    // Only course instructor can grade
    const enrollment = await Enrollment.findOne({
      course: req.params.courseId,
      user: req.body.studentId
    });
    
    // Update assignment grade
    const assignment = enrollment.assignmentProgress.id(req.params.assignmentId);
    assignment.score = req.body.score;
    assignment.graded = true;
    
    await enrollment.save();
    res.json({ message: 'Assignment graded successfully' });
  }
);

// Review project (only course instructor)
router.put('/:courseId/project/review', 
  protect, 
  isCourseInstructorOrSuperAdmin,
  async (req, res) => {
    const enrollment = await Enrollment.findOne({
      course: req.params.courseId,
      user: req.body.studentId
    });
    
    enrollment.projectProgress = {
      ...enrollment.projectProgress,
      reviewed: true,
      score: req.body.score,
      feedback: req.body.feedback,
      resubmitRequired: req.body.resubmitRequired || false
    };
    
    await enrollment.save();
    res.json({ message: 'Project reviewed successfully' });
  }
);