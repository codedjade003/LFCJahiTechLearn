// routes/adminRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { isAdminOnly } from '../middleware/isAdminOnly.js';
import { Course } from '../models/Course.js';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import { Submission } from '../models/Submission.js';

const router = express.Router();

// GET /api/admin/dashboard
router.get('/dashboard', protect, isAdminOnly, async (req, res) => {
  try {
    // Get counts in parallel for better performance
    const [
      totalCourses,
      activeUsers,
      pendingAssessments,
      atRiskUsers,
      recentEnrollments,
      recentSubmissions
    ] = await Promise.all([
      // Total courses
      Course.countDocuments(),
      
      // Active users (non-deleted users)
      User.countDocuments({ 
        isDeleted: { $ne: true },
        status: { $ne: 'deleted' }
      }),
      
      // Pending assessments (submissions without grades)
      Submission.countDocuments({ grade: { $exists: false } }),
      
      // At-risk users (enrollments with low progress and high time enrolled)
      Enrollment.countDocuments({
        progress: { $lt: 25 },
        enrolledAt: { $lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // 30+ days ago
      }),
      
      // Recent enrollments for activity feed
      Enrollment.find()
        .populate('user', 'name')
        .populate('course', 'title')
        .sort({ enrolledAt: -1 })
        .limit(5),
        
      // Recent submissions for activity feed
      Submission.find({ grade: { $exists: false } })
        .populate('studentId', 'name')
        .populate('courseId', 'title')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    // Format activity items
    const activityItems = [
      ...recentEnrollments.map(enrollment => ({
        id: enrollment._id,
        Icon: FaUserPlus,
        iconBgClass: "bg-lfc-gold/20",
        iconColorClass: "text-lfc-red",
        title: "New enrollment",
        detail: `${enrollment.user?.name || 'User'} enrolled in "${enrollment.course?.title || 'Course'}"`,
        time: formatTimeAgo(enrollment.enrolledAt)
      })),
      ...recentSubmissions.map(submission => ({
        id: submission._id,
        Icon: FaCheckCircle,
        iconBgClass: "bg-green-100",
        iconColorClass: "text-green-600",
        title: "Assignment submitted",
        detail: `${submission.studentId?.name || 'Student'} submitted "${submission.courseId?.title || 'Course'}"`,
        time: formatTimeAgo(submission.createdAt)
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 4);

    res.json({
      totalCourses,
      activeUsers,
      pendingAssessments,
      atRiskUsers,
      recentActivity: activityItems
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard data', 
      error: error.message 
    });
  }
});

// GET /api/admin/recent-users - FIXED VERSION
router.get('/recent-users', protect, isAdminOnly, async (req, res) => {
  try {
    const { limit = 3 } = req.query; // Get limit from query, default to 3
    
    const users = await User.find({ 
      isDeleted: { $ne: true },
      status: { $ne: 'deleted' }
    })
      .select('name email createdAt lastLogin')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    // Get enrollment stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const enrollments = await Enrollment.find({ user: user._id });
        const totalProgress = enrollments.reduce((acc, curr) => acc + (curr.progress || 0), 0);
        const avgProgress = enrollments.length > 0 ? Math.round(totalProgress / enrollments.length) : 0;

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          courses: enrollments.length,
          progress: avgProgress,
          lastLogin: user.lastLogin || user.createdAt // Fallback to createdAt if no lastLogin
        };
      })
    );

    res.json({ 
      users: usersWithStats,
      totalUsers: usersWithStats.length // Since we're limiting to recent users only
    });
  } catch (error) {
    console.error('Error fetching recent users:', error);
    res.status(500).json({ message: 'Error fetching recent users', error: error.message });
  }
});

// GET /api/admin/pending-assessments
router.get('/pending-assessments', protect, isAdminOnly, async (req, res) => {
  try {
    const pendingSubmissions = await Submission.find({ grade: { $exists: false } })
      .populate('studentId', 'name')
      .populate('courseId', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    const assessments = pendingSubmissions.map(submission => ({
      _id: submission._id,
      title: submission.assignmentId ? 'Assignment' : submission.projectId ? 'Project' : 'Quiz',
      dueDate: submission.createdAt,
      submittedBy: submission.studentId?.name || 'Unknown',
      type: submission.assignmentId ? 'assignment' : submission.projectId ? 'project' : 'quiz',
      status: new Date() > new Date(submission.createdAt) ? 'overdue' : 'pending'
    }));

    res.json({ assessments });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending assessments', error: error.message });
  }
});

// GET /api/admin/analytics - FIXED VERSION (NO STATIC DATA)
router.get('/analytics', protect, isAdminOnly, async (req, res) => {
  try {
    const { courseId } = req.query;
    
    const enrollments = courseId 
      ? await Enrollment.find({ course: courseId })
      : await Enrollment.find();

    const total = enrollments.length;
    
    if (total === 0) {
      return res.json({
        completionRate: 0,
        passRate: 0,
        averageTime: "0 weeks",
        averageScore: 0,
        dropoutRate: 0,
        totalEnrollments: 0
      });
    }

    // Calculate real completion rate
    const completed = enrollments.filter(e => e.completed).length;
    const completionRate = Math.round((completed / total) * 100);

    // Calculate real pass rate (assuming 70% progress means passed)
    const passed = enrollments.filter(e => e.progress >= 70).length;
    const passRate = Math.round((passed / total) * 100);

    // Calculate average time spent (convert from minutes to weeks)
    const totalTimeMinutes = enrollments.reduce((acc, curr) => acc + (curr.timeSpent || 0), 0);
    const averageTimeWeeks = (totalTimeMinutes / total) / (60 * 24 * 7); // Convert minutes to weeks
    const averageTime = averageTimeWeeks > 0 ? `${averageTimeWeeks.toFixed(1)} weeks` : "0 weeks";

    // Calculate average score from submissions
    const submissions = await Submission.find({ 
      grade: { $exists: true },
      ...(courseId && { courseId })
    });
    const totalScore = submissions.reduce((acc, curr) => acc + (curr.grade || 0), 0);
    const averageScore = submissions.length > 0 ? Math.round(totalScore / submissions.length) : 0;

    // Calculate dropout rate (enrollments with no activity in 30 days and low progress)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dropouts = enrollments.filter(e => 
      e.progress < 50 && 
      (!e.lastActivity || new Date(e.lastActivity) < thirtyDaysAgo)
    ).length;
    const dropoutRate = Math.round((dropouts / total) * 100);

    res.json({
      completionRate,
      passRate,
      averageTime,
      averageScore,
      dropoutRate,
      totalEnrollments: total
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ 
      message: 'Error fetching analytics', 
      error: error.message 
    });
  }
});

// Helper function to format time ago
const formatTimeAgo = (date) => {
  if (!date) return 'Never';
  
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Date(date).toLocaleDateString();
};

// You'll need to import these icons or create a mapping
const FaUserPlus = { name: 'FaUserPlus' };
const FaCheckCircle = { name: 'FaCheckCircle' };

export default router;