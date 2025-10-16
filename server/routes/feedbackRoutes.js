import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { ModuleFeedback } from '../models/ModuleFeedback.js';

const router = express.Router();

// Submit module feedback
router.post('/modules/:moduleId', protect, async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { courseId, difficulty, clarity, usefulness, feedback } = req.body;
    const studentId = req.user._id;

    // Check if feedback already exists
    const existingFeedback = await ModuleFeedback.findOne({
      courseId,
      moduleId,
      studentId
    });

    if (existingFeedback) {
      // Update existing feedback
      existingFeedback.difficulty = difficulty;
      existingFeedback.clarity = clarity;
      existingFeedback.usefulness = usefulness;
      existingFeedback.feedback = feedback;
      await existingFeedback.save();
      
      return res.json({ 
        message: 'Feedback updated successfully', 
        feedback: existingFeedback 
      });
    }

    // Create new feedback
    const newFeedback = new ModuleFeedback({
      courseId,
      moduleId,
      studentId,
      difficulty,
      clarity,
      usefulness,
      feedback
    });

    await newFeedback.save();

    res.status(201).json({ 
      message: 'Feedback submitted successfully', 
      feedback: newFeedback 
    });
  } catch (error) {
    console.error('Error submitting module feedback:', error);
    res.status(500).json({ 
      message: 'Error submitting feedback', 
      error: error.message 
    });
  }
});

// Get feedback for a specific module (admin only)
router.get('/modules/:moduleId', protect, async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { courseId } = req.query;

    const feedback = await ModuleFeedback.find({
      courseId,
      moduleId
    }).populate('studentId', 'name email');

    // Calculate averages
    const avgDifficulty = feedback.reduce((sum, f) => sum + f.difficulty, 0) / feedback.length || 0;
    const avgClarity = feedback.reduce((sum, f) => sum + f.clarity, 0) / feedback.length || 0;
    const avgUsefulness = feedback.reduce((sum, f) => sum + f.usefulness, 0) / feedback.length || 0;

    res.json({
      feedback,
      averages: {
        difficulty: avgDifficulty.toFixed(2),
        clarity: avgClarity.toFixed(2),
        usefulness: avgUsefulness.toFixed(2)
      },
      totalResponses: feedback.length
    });
  } catch (error) {
    console.error('Error fetching module feedback:', error);
    res.status(500).json({ 
      message: 'Error fetching feedback', 
      error: error.message 
    });
  }
});

export default router;
