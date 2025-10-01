// Enhanced feedback controller
import Enrollment from '../models/Enrollment.js';

export const submitCourseFeedback = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { feedback, rating = 5 } = req.body; // Add rating
    const userId = req.user._id;

    if (!feedback || feedback.trim().length === 0) {
      return res.status(400).json({ message: 'Feedback cannot be empty' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Check if feedback already submitted
    if (enrollment.feedback) {
      return res.status(400).json({ message: 'Feedback already submitted for this course' });
    }

    // Save to enrollment
    enrollment.feedback = feedback.trim();
    enrollment.rating = rating;
    enrollment.feedbackSubmittedAt = new Date();
    
    await enrollment.save();

    res.json({ 
      success: true, 
      message: 'Thank you for your feedback!',
      feedback: enrollment.feedback,
      rating: enrollment.rating
    });

  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ message: 'Failed to submit feedback', error: error.message });
  }
};