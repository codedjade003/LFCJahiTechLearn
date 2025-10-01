// middleware/progressValidation.js - FIXED
import Enrollment from '../models/Enrollment.js';
import { Course } from '../models/Course.js';

export const validateProgressUpdate = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId
    });
    
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found. Please enroll in the course first." });
    }

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Store for use in controllers
    req.enrollment = enrollment;
    req.course = course;
    next();

  } catch (error) {
    res.status(500).json({ message: "Validation error", error: error.message });
  }
};