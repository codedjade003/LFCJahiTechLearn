import Enrollment from "../models/Enrollment.js";
import User from "../models/User.js";
import { Course } from '../models/Course.js';
import { Submission } from '../models/Submission.js';

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user with streak data
    const user = await User.findById(userId).select("streak lastLogin loginCount");
    
    // Get enrollments and populate course details to filter out deleted courses
    const enrollments = await Enrollment.find({ user: userId })
      .populate({
        path: 'course',
        match: { 
          $or: [
            { isDeleted: { $exists: false } }, // Backward compatibility
            { isDeleted: false } // Only non-deleted courses
          ],
          status: { $ne: 'deleted' } // Additional safety check
        }
      });

    // Filter out enrollments where the course is null (deleted courses)
    const validEnrollments = enrollments.filter(enrollment => enrollment.course !== null);

    const total = validEnrollments.length;
    const completed = validEnrollments.filter(e => e.completed).length;
    const active = total - completed;
    const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      streak: user.streak?.current || 0,
      longestStreak: user.streak?.longest || 0,
      totalCourses: total,
      completedCourses: completed,
      activeCourses: active,
      completionPercent,
      loginCount: user.loginCount || 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};