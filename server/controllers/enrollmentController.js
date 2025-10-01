// controllers/enrollmentController.js
import Enrollment from "../models/Enrollment.js";
import { Course } from '../models/Course.js';
import { Submission } from '../models/Submission.js';import User from "../models/User.js";
import { callCreateNotification} from "../controllers/notificationController.js";

// POST /api/enrollments/:courseId
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const existing = await Enrollment.findOne({ user: userId, course: courseId });
    if (existing) return res.status(400).json({ message: "Already enrolled" });

    const enrollment = new Enrollment({ user: userId, course: courseId });
    await enrollment.save();

    // 🔔 Notify user via POST route
    await callCreateNotification({
      userId: enrollment.user,
      title: "You enrolled in a new course!",
      type: "course",
      link: `/courses/${courseId}`,
    });

    res.json({ message: "Enrolled successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/enrollments/my
export const getMyEnrollments = async (req, res) => {
  try {
    // SIMPLIFIED: No need to filter deleted courses
    const enrollments = await Enrollment.find({ user: req.user.id })
      .populate('course', 'title description thumbnail duration instructor status')
      .sort({ lastAccessed: -1 });

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// GET /api/enrollments/course/:courseId
export const getCourseEnrollments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const enrollments = await Enrollment.find({ course: courseId }).populate("user", "name email");
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch course enrollments", error: err.message });
  }
};

// PUT /api/enrollments/:courseId/progress
export const updateProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { progress, timeSpent } = req.body;

    const enrollment = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

    if (progress !== undefined) {
      enrollment.progress = Math.min(100, enrollment.progress + Number(progress));
      if (progress >= 100) enrollment.completed = true;
    }

    if (timeSpent) {
      enrollment.timeSpent += timeSpent;
      enrollment.lastAccessed = Date.now();
    }

    await enrollment.save();
    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ message: "Failed to update progress", error: err.message });
  }
};

// GET /api/enrollments/all - IMPROVED VERSION
export const getAllEnrollments = async (req, res) => {
  try {
    console.log('Fetching all enrollments...'); // Debug log
    
    const enrollments = await Enrollment.find()
      .populate("user", "name email lastLogin")
      .populate("course", "title duration estimatedDuration")
      .populate("sectionProgress.sectionId", "title")
      .sort({ enrolledAt: -1 })
      .lean(); // Add lean() for better performance

    // Handle case where no enrollments exist
    if (!enrollments || enrollments.length === 0) {
      return res.json([]);
    }

    // Transform data with safety checks
    const progressData = enrollments.map(enrollment => ({
      _id: enrollment._id,
      user: enrollment.user || { _id: '', name: 'Unknown', email: 'N/A', lastLogin: '' },
      course: enrollment.course || { _id: '', title: 'Unknown Course', duration: '', estimatedDuration: 0 },
      progress: enrollment.progress || 0,
      completed: enrollment.completed || false,
      timeSpent: enrollment.timeSpent || 0,
      enrolledAt: enrollment.enrolledAt || new Date(),
      lastAccessed: enrollment.lastAccessed || new Date(),
      sectionProgress: enrollment.sectionProgress || [],
      assignmentProgress: enrollment.assignmentProgress || [],
      projectProgress: enrollment.projectProgress || {
        submitted: false,
        reviewed: false,
        score: 0
      }
    }));

    res.json(progressData);
  } catch (err) {
    console.error('Error in getAllEnrollments:', err);
    res.status(500).json({ 
      message: "Failed to fetch enrollments", 
      error: err.message,
      details: 'Check if Enrollment model and population are working correctly'
    });
  }
};

// POST /api/enrollments/enroll-all/:courseId
export const enrollAllUsersInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Get all users
    const users = await User.find({}, '_id');
    if (!users.length) {
      return res.status(404).json({ message: "No users found to enroll" });
    }

    // Get existing enrollments to avoid duplicates
    const existingEnrollments = await Enrollment.find({ 
      course: courseId,
      user: { $in: users.map(user => user._id) }
    });
    
    const existingUserIds = existingEnrollments.map(enrollment => enrollment.user.toString());

    // Filter out users who are already enrolled
    const usersToEnroll = users.filter(user => 
      !existingUserIds.includes(user._id.toString())
    );

    if (usersToEnroll.length === 0) {
      return res.status(400).json({ message: "All users are already enrolled in this course" });
    }

    // Create enrollment records
    const enrollmentPromises = usersToEnroll.map(user => {
      const enrollment = new Enrollment({
        user: user._id,
        course: courseId,
        enrolledAt: new Date()
      });
      return enrollment.save();
    });

    // Create notification promises
    const notificationPromises = usersToEnroll.map(user => 
      callCreateNotification({
        userId: user._id,
        title: `You've been enrolled in "${course.title}"`,
        message: `You have been enrolled in the course "${course.title}" by an administrator.`,
        type: "course",
        link: `/courses/${courseId}`,
      })
    );

    // Execute all promises
    await Promise.all([...enrollmentPromises, ...notificationPromises]);

    res.json({ 
      message: `Successfully enrolled ${usersToEnroll.length} users in the course`,
      enrolledCount: usersToEnroll.length,
      alreadyEnrolledCount: existingUserIds.length
    });

  } catch (err) {
    console.error("Error enrolling all users:", err);
    res.status(500).json({ 
      message: "Failed to enroll all users", 
      error: err.message 
    });
  }
};

// controllers/enrollmentController.js - UPDATED
export const getCourseEnrollmentStats = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Validate course exists and is not deleted
    const course = await Course.findOne({ 
      _id: courseId,
      $or: [
        { isDeleted: { $exists: false } },
        { isDeleted: false }
      ],
      status: { $ne: 'deleted' }
    });
    
    if (!course) {
      return res.status(404).json({ message: "Course not found or has been deleted" });
    }
    
    // Count only active users (not deleted)
    const totalUsers = await User.countDocuments({ 
      isDeleted: { $ne: true },
      status: { $ne: 'deleted' }
    });
    
    // Count enrollments for this course, excluding deleted users
    const enrolledUsers = await Enrollment.countDocuments({ 
      course: courseId 
    }).populate({
      path: 'user',
      match: { 
        isDeleted: { $ne: true },
        status: { $ne: 'deleted' }
      }
    });
    
    // Alternative approach using aggregation for more accuracy
    const stats = await Enrollment.aggregate([
      {
        $match: { course: mongoose.Types.ObjectId(courseId) }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $match: {
          'userInfo.isDeleted': { $ne: true },
          'userInfo.status': { $ne: 'deleted' }
        }
      },
      {
        $count: 'activeEnrolledUsers'
      }
    ]);
    
    const activeEnrolledUsers = stats[0]?.activeEnrolledUsers || 0;
    
    res.json({
      courseTitle: course.title,
      totalUsers,
      enrolledUsers: activeEnrolledUsers,
      notEnrolled: totalUsers - activeEnrolledUsers,
      enrollmentPercentage: totalUsers > 0 ? ((activeEnrolledUsers / totalUsers) * 100).toFixed(2) : 0,
      courseStatus: course.status,
      lastUpdated: new Date().toISOString()
    });
  } catch (err) {
    console.error("Enrollment stats error:", err);
    res.status(500).json({ message: "Failed to get enrollment stats", error: err.message });
  }
};

// Optional: Enroll specific users by IDs
export const enrollUsersInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userIds } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const enrollments = await Promise.all(
      userIds.map(async (userId) => {
        const existing = await Enrollment.findOne({ user: userId, course: courseId });
        if (!existing) {
          const enrollment = new Enrollment({ user: userId, course: courseId });
          await enrollment.save();
          
          await callCreateNotification({
            userId,
            title: `You've been enrolled in "${course.title}"`,
            message: `You have been enrolled in the course "${course.title}" by an administrator.`,
            type: "course",
            link: `/courses/${courseId}`,
          });
          
          return { userId, status: "enrolled" };
        }
        return { userId, status: "already_enrolled" };
      })
    );

    res.json({ message: "Enrollment process completed", results: enrollments });
  } catch (err) {
    res.status(500).json({ message: "Failed to enroll users", error: err.message });
  }
};