// controllers/proctoringController.js
import { Submission } from '../models/Submission.js';
import { Course } from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';

// Enhanced quiz submission with proctoring analysis
export const submitQuizWithProctoring = async (req, res) => {
  try {
    const { quizId, courseId } = req.params;
    const { answers, score, percentage, passed, proctoringData } = req.body;
    const userId = req.user._id;

    console.log('📊 Quiz submission with proctoring:', {
      userId,
      quizId,
      score,
      percentage,
      proctoringData
    });

    const course = await Course.findById(courseId);
    
    // Find the quiz module
    let quizModule = null;
    for (const section of course.sections) {
      for (const module of section.modules) {
        if (module._id.toString() === quizId && module.type === 'quiz') {
          quizModule = module;
          break;
        }
      }
      if (quizModule) break;
    }

    if (!quizModule) {
      return res.status(404).json({ message: 'Quiz not found in course' });
    }

    // Analyze proctoring data for suspicious activity
    const proctoringFlags = analyzeProctoringData(proctoringData, {
      answers,
      score,
      percentage,
      passed,
      totalQuestions: quizModule.quiz.questions.length
    });

    const trustScore = calculateTrustScore(proctoringFlags);
    const requiresReview = trustScore < 70 && passed; // Auto-flag suspicious passes

    // Create enhanced submission record with proctoring data
    const quizSubmission = new Submission({
      courseId,
      moduleId: quizId,
      studentId: userId,
      submissionType: 'quiz',
      submission: { 
        answers, 
        score, 
        passed,
        proctoring: {
          flags: proctoringFlags,
          trustScore,
          data: proctoringData,
          requiresReview,
          status: requiresReview ? 'flagged' : 'clean'
        }
      },
      grade: score
    });

    await quizSubmission.save();

    // Update enrollment progress (only if not flagged or if admin approves later)
    if (!requiresReview || passed) {
      await updateEnrollmentProgress(userId, courseId, quizId, score, passed);
    }

    res.json({
      score,
      totalQuestions: quizModule.quiz.questions.length,
      correctAnswers: Math.round((score / 100) * quizModule.quiz.questions.length),
      passed,
      requiresReview,
      trustScore,
      flags: proctoringFlags.length > 0 ? proctoringFlags : undefined,
      message: requiresReview ? 
        'Quiz submitted but requires manual review due to suspicious activity' : 
        'Quiz submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting quiz with proctoring:', error);
    res.status(500).json({ message: 'Error submitting quiz', error: error.message });
  }
};

// Log individual proctoring violations
export const logQuizViolation = async (req, res) => {
  try {
    const { quizId, courseId } = req.params;
    const { type, timestamp, tabSwitches, violations } = req.body;
    const userId = req.user._id;

    console.log('🚨 Proctoring violation:', {
      userId,
      quizId,
      type,
      timestamp
    });

    // Store violation in a separate collection or add to existing submission
    const violationRecord = {
      userId,
      courseId,
      quizId,
      type,
      timestamp: new Date(timestamp),
      tabSwitches,
      totalViolations: violations,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    // You might want to create a separate Violation model for this
    // For now, we'll log it and associate with the next submission

    res.json({ 
      message: 'Violation logged successfully',
      violationId: violationRecord._id 
    });

  } catch (error) {
    console.error('Error logging violation:', error);
    res.status(500).json({ message: 'Error logging violation', error: error.message });
  }
};

// Get proctoring data for a specific quiz attempt
export const getQuizProctoringData = async (req, res) => {
  try {
    const { quizId, courseId } = req.params;
    const userId = req.user._id;

    const submission = await Submission.findOne({
      courseId,
      moduleId: quizId,
      studentId: userId,
      submissionType: 'quiz'
    }).sort({ createdAt: -1 });

    if (!submission) {
      return res.status(404).json({ message: 'No quiz submission found' });
    }

    res.json({
      submission: {
        score: submission.grade,
        passed: submission.submission.passed,
        proctoring: submission.submission.proctoring,
        submittedAt: submission.createdAt
      }
    });

  } catch (error) {
    console.error('Error fetching proctoring data:', error);
    res.status(500).json({ message: 'Error fetching proctoring data', error: error.message });
  }
};

// Analyze quiz attempt for suspicious patterns
export const analyzeQuizAttempt = async (req, res) => {
  try {
    const { quizId, courseId } = req.params;
    const userId = req.user._id;

    const submissions = await Submission.find({
      courseId,
      moduleId: quizId,
      studentId: userId,
      submissionType: 'quiz'
    }).sort({ createdAt: -1 });

    if (submissions.length === 0) {
      return res.status(404).json({ message: 'No quiz attempts found' });
    }

    const analysis = {
      totalAttempts: submissions.length,
      bestScore: Math.max(...submissions.map(s => s.grade)),
      averageScore: submissions.reduce((acc, s) => acc + s.grade, 0) / submissions.length,
      latestAttempt: submissions[0],
      suspiciousPatterns: detectSuspiciousPatterns(submissions),
      recommendation: generateRecommendation(submissions)
    };

    res.json(analysis);

  } catch (error) {
    console.error('Error analyzing quiz attempts:', error);
    res.status(500).json({ message: 'Error analyzing quiz attempts', error: error.message });
  }
};

// Admin: Get all flagged attempts for review
export const getFlaggedAttempts = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const filter = {
      submissionType: 'quiz',
      'submission.proctoring.requiresReview': true
    };

    if (status) {
      filter['submission.proctoring.status'] = status;
    }

    const submissions = await Submission.find(filter)
      .populate('studentId', 'name email profilePicture')
      .populate('courseId', 'title instructor')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Submission.countDocuments(filter);

    res.json({
      submissions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error fetching flagged attempts:', error);
    res.status(500).json({ message: 'Error fetching flagged attempts', error: error.message });
  }
};

// Admin: Review and approve/reject flagged attempt
export const reviewQuizAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { action, notes } = req.body; // 'approve' or 'reject'

    const submission = await Submission.findById(attemptId)
      .populate('studentId', 'name email')
      .populate('courseId', 'title');

    if (!submission) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    if (action === 'approve') {
      // Update enrollment progress since it's now approved
      await updateEnrollmentProgress(
        submission.studentId._id,
        submission.courseId._id,
        submission.moduleId,
        submission.grade,
        submission.submission.passed
      );

      submission.submission.proctoring.status = 'approved';
      submission.submission.proctoring.reviewedBy = req.user._id;
      submission.submission.proctoring.reviewedAt = new Date();
      submission.submission.proctoring.reviewNotes = notes;

      await submission.save();

      res.json({ 
        message: 'Attempt approved successfully',
        enrollmentUpdated: true 
      });

    } else if (action === 'reject') {
      submission.submission.proctoring.status = 'rejected';
      submission.submission.proctoring.reviewedBy = req.user._id;
      submission.submission.proctoring.reviewedAt = new Date();
      submission.submission.proctoring.reviewNotes = notes;

      await submission.save();

      res.json({ 
        message: 'Attempt rejected successfully',
        enrollmentUpdated: false 
      });
    } else {
      return res.status(400).json({ message: 'Invalid action. Use "approve" or "reject".' });
    }

  } catch (error) {
    console.error('Error reviewing attempt:', error);
    res.status(500).json({ message: 'Error reviewing attempt', error: error.message });
  }
};

// ===== HELPER FUNCTIONS =====

// Analyze proctoring data for suspicious patterns
const analyzeProctoringData = (proctoringData, quizData) => {
  const flags = [];
  const totalQuestions = quizData.totalQuestions;
  
  // Time-based analysis
  const timePerQuestion = proctoringData.timeSpent / (totalQuestions * 1000); // in seconds
  if (timePerQuestion < 5) {
    flags.push({
      type: 'suspicious_timing',
      severity: 'high',
      message: `Extremely fast responses: ${timePerQuestion.toFixed(1)}s per question`,
      data: { timePerQuestion, threshold: 5 }
    });
  } else if (timePerQuestion < 10) {
    flags.push({
      type: 'fast_timing',
      severity: 'medium',
      message: `Fast responses: ${timePerQuestion.toFixed(1)}s per question`,
      data: { timePerQuestion, threshold: 10 }
    });
  }
  
  // Tab switching analysis
  if (proctoringData.tabSwitches > 2) {
    flags.push({
      type: 'excessive_tab_switching',
      severity: 'high',
      message: `User switched tabs ${proctoringData.tabSwitches} times`,
      data: { tabSwitches: proctoringData.tabSwitches, threshold: 2 }
    });
  } else if (proctoringData.tabSwitches > 0) {
    flags.push({
      type: 'minor_tab_switching',
      severity: 'low',
      message: `User switched tabs ${proctoringData.tabSwitches} time(s)`,
      data: { tabSwitches: proctoringData.tabSwitches }
    });
  }
  
  // Violation analysis
  if (proctoringData.violations > 3) {
    flags.push({
      type: 'multiple_violations',
      severity: 'high',
      message: `Detected ${proctoringData.violations} proctoring violations`,
      data: { violations: proctoringData.violations, threshold: 3 }
    });
  }
  
  // Perfect score with suspicious activity
  if (quizData.percentage === 100 && (proctoringData.tabSwitches > 0 || proctoringData.violations > 0)) {
    flags.push({
      type: 'perfect_score_suspicious',
      severity: 'medium',
      message: 'Perfect score with proctoring violations',
      data: { score: quizData.percentage, violations: proctoringData.violations }
    });
  }

  // Inconsistent timing patterns
  if (timePerQuestion > 60 && quizData.percentage > 80) {
    flags.push({
      type: 'inconsistent_timing',
      severity: 'medium',
      message: 'High score with unusually slow response time',
      data: { timePerQuestion, score: quizData.percentage }
    });
  }

  return flags;
};

// Calculate trust score based on flags
const calculateTrustScore = (flags) => {
  let score = 100;
  
  flags.forEach(flag => {
    if (flag.severity === 'high') score -= 25;
    if (flag.severity === 'medium') score -= 15;
    if (flag.severity === 'low') score -= 5;
  });
  
  return Math.max(0, score);
};

// Update enrollment progress
const updateEnrollmentProgress = async (userId, courseId, quizId, score, passed) => {
  try {
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    
    if (!enrollment.quizProgress) {
      enrollment.quizProgress = [];
    }

    const existingQuiz = enrollment.quizProgress.find(q => q.quizId && q.quizId.toString() === quizId);
    
    if (existingQuiz) {
      existingQuiz.attempts += 1;
      if (score > existingQuiz.bestScore) {
        existingQuiz.bestScore = score;
      }
      existingQuiz.score = score;
      existingQuiz.completedAt = new Date();
    } else {
      enrollment.quizProgress.push({
        quizId,
        score,
        attempts: 1,
        bestScore: score,
        completedAt: new Date()
      });
    }

    // Mark module as completed if passed
    if (passed) {
      if (!enrollment.moduleProgress) {
        enrollment.moduleProgress = [];
      }

      const existingModule = enrollment.moduleProgress.find(
        mp => mp.moduleId && mp.moduleId.toString() === quizId
      );

      if (!existingModule) {
        enrollment.moduleProgress.push({
          moduleId: quizId,
          completed: true,
          completedAt: new Date()
        });
      } else if (!existingModule.completed) {
        existingModule.completed = true;
        existingModule.completedAt = new Date();
      }
    }

    await enrollment.save();
    console.log('✅ Enrollment progress updated for quiz:', quizId);

  } catch (error) {
    console.error('❌ Error updating enrollment progress:', error);
    throw error;
  }
};

// Detect suspicious patterns across multiple attempts
const detectSuspiciousPatterns = (submissions) => {
  const patterns = [];
  
  if (submissions.length > 3) {
    patterns.push({
      type: 'multiple_attempts',
      message: `User has attempted this quiz ${submissions.length} times`,
      severity: 'medium'
    });
  }

  // Check for rapid improvement
  if (submissions.length >= 2) {
    const firstScore = submissions[submissions.length - 1].grade;
    const lastScore = submissions[0].grade;
    
    if (lastScore - firstScore > 50) {
      patterns.push({
        type: 'rapid_improvement',
        message: `Score improved from ${firstScore}% to ${lastScore}%`,
        severity: 'low'
      });
    }
  }

  return patterns;
};

// Generate recommendation based on analysis
const generateRecommendation = (submissions) => {
  const latest = submissions[0];
  const trustScore = latest.submission.proctoring?.trustScore || 100;

  if (trustScore < 50) {
    return {
      action: 'review_required',
      message: 'High suspicion of cheating. Manual review recommended.',
      priority: 'high'
    };
  } else if (trustScore < 70) {
    return {
      action: 'monitor',
      message: 'Some suspicious activity detected. Monitor future attempts.',
      priority: 'medium'
    };
  } else {
    return {
      action: 'no_action',
      message: 'No significant issues detected.',
      priority: 'low'
    };
  }
};