// controllers/submissionController.js - UPDATED with Cloudinary
import multer from 'multer';
import { uploadToCloudinary } from '../utils/fileUploader.js';

// Use memory storage to get file buffer
export const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory as buffer
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'text/plain',
      'application/octet-stream'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`), false);
    }
  }
});

import Enrollment from '../models/Enrollment.js';
import { Course } from '../models/Course.js';
import { Submission } from '../models/Submission.js';

// Get all submissions for a course (student view)
export const getSubmission = async (req, res) => {
  try {
    const { courseId, assignmentId } = req.params;
    const userId = req.user._id;

    const submission = await Submission.findOne({
      courseId,
      assignmentId,
      studentId: userId
    });

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submission', error: error.message });
  }
};

export const getSubmissions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const submissions = await Submission.find({
      courseId,
      studentId: userId
    }).sort({ createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submissions', error: error.message });
  }
};

// UPDATED submitAssignment function to handle file uploads
export const submitAssignment = async (req, res) => {
  try {
    console.log('Submit assignment called with:', {
      params: req.params,
      body: req.body,
      file: req.file,
      user: req.user?._id
    });

    const { assignmentId } = req.params;
    const { submissionType } = req.body;
    const userId = req.user._id;
    const courseId = req.params.courseId;

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Validate assignment exists
    const assignment = course.assignments.id(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Validate submission type
    if (!assignment.submissionTypes.includes(submissionType)) {
      return res.status(400).json({ 
        message: `Invalid submission type. Allowed: ${assignment.submissionTypes.join(', ')}` 
      });
    }

    // Validate deadline
    if (assignment.dueDate && new Date() > assignment.dueDate) {
      return res.status(400).json({ message: 'Assignment submission deadline has passed' });
    }

    let formattedSubmission = {};

    // Handle different submission types
    if (submissionType === "text") {
      formattedSubmission.text = req.body.submission?.text || req.body.text;
    } else if (submissionType === "link") {
      formattedSubmission.link = req.body.submission?.link || req.body.link;
    } else if (submissionType === "file_upload") {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded for file_upload submission type' });
      }
      formattedSubmission.file = {
        url: `/uploads/submissions/${req.file.filename}`,
        name: req.file.originalname,
        type: req.file.mimetype
      };
    }

    // Create submission record
    const newSubmission = new Submission({
      courseId,
      assignmentId,
      studentId: userId,
      submissionType,
      submission: formattedSubmission
    });

    await newSubmission.save();

    // Update enrollment progress
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (!enrollment) {
      console.log('No enrollment found for user:', userId, 'in course:', courseId);
    } else {
      if (!enrollment.assignmentProgress) {
        enrollment.assignmentProgress = [];
      }

      const existingAssignment = enrollment.assignmentProgress.find(
        ap => ap.assignmentId.toString() === assignmentId
      );

      if (existingAssignment) {
        existingAssignment.submitted = true;
        existingAssignment.submittedAt = new Date();
      } else {
        enrollment.assignmentProgress.push({
          assignmentId,
          submitted: true,
          submittedAt: new Date()
        });
      }

      await enrollment.save();
    }

    res.status(201).json({ 
      message: 'Assignment submitted successfully', 
      submission: newSubmission 
    });

  } catch (error) {
    console.error('❌ SUBMISSION ERROR DETAILS:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Request params:', req.params);
    console.error('Request body:', req.body);
    
    res.status(500).json({ 
      message: 'Error submitting assignment', 
      error: error.message
    });
  }
};

// controllers/submissionController.js
export const getAssignmentSubmission = async (req, res) => {
  try {
    const { courseId, assignmentId } = req.params;
    const userId = req.user._id;

    const submission = await Submission.findOne({
      courseId,
      assignmentId,
      studentId: userId
    });

    if (!submission) {
      return res.status(404).json({ message: 'No submission found' });
    }

    res.json(submission);
  } catch (error) {
    console.error("Error fetching assignment submission:", error);
    res.status(500).json({ message: 'Error fetching submission', error: error.message });
  }
};

// Get project submission for a course
export const getProjectSubmission = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const submission = await Submission.findOne({
      courseId,
      projectId: { $exists: true }, // Look for submissions with projectId
      studentId: userId
    });

    if (!submission) {
      return res.status(404).json({ message: 'No project submission found' });
    }

    res.json(submission);
  } catch (error) {
    console.error("Error fetching project submission:", error);
    res.status(500).json({ message: 'Error fetching project submission', error: error.message });
  }
};

export const submitProject = async (req, res) => {
  try {
    console.log('Submit project called with:', {
      params: req.params,
      body: req.body,
      file: req.file,
      user: req.user?._id
    });

    const { courseId } = req.params;
    const submissionType = req.body.submissionType;
    const userId = req.user._id;

    // Validate course exists and has project
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!course.project) {
      return res.status(404).json({ message: 'This course does not have a project' });
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      courseId,
      projectId: { $exists: true },
      studentId: userId
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'Project already submitted' });
    }

    // Validate submission type
    if (!course.project.submissionTypes.includes(submissionType)) {
      return res.status(400).json({ 
        message: `Invalid submission type. Allowed: ${course.project.submissionTypes.join(', ')}` 
      });
    }

    // Validate deadline
    if (course.project.dueDate && new Date() > course.project.dueDate) {
      return res.status(400).json({ message: 'Project submission deadline has passed' });
    }

    let formattedSubmission = {};

    // Handle different submission types
    if (submissionType === "text") {
      formattedSubmission.text = req.body.text || '';
    } else if (submissionType === "link") {
      formattedSubmission.link = req.body.link || '';
    } else if (submissionType === "file_upload") {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded for file_upload submission type' });
      }
      
      try {
        // Upload to Cloudinary directly
        const uploadResult = await uploadToCloudinary(
          req.file.buffer,
          req.file.originalname,
          userId
        );

        console.log('✅ Cloudinary upload result:', uploadResult);

        formattedSubmission.file = {
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          name: req.file.originalname,
          type: req.file.mimetype,
          size: req.file.size,
          format: uploadResult.format,
          resource_type: uploadResult.resource_type
        };
      } catch (uploadError) {
        console.error('❌ Cloudinary upload failed:', uploadError);
        return res.status(500).json({ 
          message: 'Failed to upload file to cloud storage', 
          error: uploadError.message 
        });
      }
    }

    // Create submission record
    const projectSubmission = new Submission({
      courseId,
      projectId: courseId,
      studentId: userId,
      submissionType,
      submission: formattedSubmission
    });

    await projectSubmission.save();

    // Update enrollment progress
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (enrollment) {
      enrollment.projectProgress = {
        submitted: true,
        submittedAt: new Date(),
        reviewed: false,
        score: 0,
        feedback: ''
      };
      await enrollment.save();
    }

    res.status(201).json({ 
      message: 'Project submitted successfully', 
      submission: projectSubmission 
    });

  } catch (error) {
    console.error('❌ PROJECT SUBMISSION ERROR:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      message: 'Error submitting project', 
      error: error.message
    });
  }
};

// Submit quiz
export const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;
    const userId = req.user._id;
    const courseId = req.params.courseId;

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

    // Calculate score
    let correctAnswers = 0;
    quizModule.quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / quizModule.quiz.questions.length) * 100);
    const passed = score >= 70;

    // Create submission record
    const quizSubmission = new Submission({
      courseId,
      moduleId: quizId,
      studentId: userId,
      submissionType: 'quiz',
      submission: { answers, score, passed },
      grade: score
    });

    await quizSubmission.save();

    // Update enrollment progress
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    
    if (!enrollment.quizProgress) {
      enrollment.quizProgress = [];
    }

    const existingQuiz = enrollment.quizProgress.find(q => q.quizId.toString() === quizId);
    
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
        mp => mp.moduleId.toString() === quizId
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

    res.json({
      score,
      totalQuestions: quizModule.quiz.questions.length,
      correctAnswers,
      passed,
      attempts: existingQuiz ? existingQuiz.attempts : 1
    });

  } catch (error) {
    res.status(500).json({ message: 'Error submitting quiz', error: error.message });
  }
};

// ADMIN ENDPOINTS - Add to submissionController.js

// Get all submissions with advanced filtering
export const getAllSubmissions = async (req, res) => {
  try {
    const { 
      type, 
      status, 
      courseId, 
      studentId, 
      graded, 
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const filter = {};
    
    // Build filter object
    if (type) filter.submissionType = type;
    if (courseId) filter.courseId = courseId;
    if (studentId) filter.studentId = studentId;
    
    // Grading status filter
    if (graded === 'true') filter.grade = { $exists: true };
    if (graded === 'false') filter.grade = { $exists: false };
    
    // Status filter (overdue, submitted, graded)
    if (status === 'overdue') {
      // We'll handle this in aggregation
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const submissions = await Submission.find(filter)
      .populate('studentId', 'name email profilePicture')
      .populate('courseId', 'title thumbnail instructor')
      .populate('gradedBy', 'name email')
      .populate('assignmentId')
      .populate('projectId')
      .sort(sortOptions)
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
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Error fetching submissions', error: error.message });
  }
};

// Get submission statistics for dashboard
export const getSubmissionStats = async (req, res) => {
  try {
    const stats = await Submission.aggregate([
      {
        $facet: {
          typeStats: [
            {
              $group: {
                _id: '$submissionType',
                total: { $sum: 1 },
                graded: { $sum: { $cond: [{ $ifNull: ['$grade', false] }, 1, 0] } },
                averageGrade: { $avg: '$grade' }
              }
            }
          ],
          recentSubmissions: [
            {
              $sort: { createdAt: -1 }
            },
            {
              $limit: 10
            },
            {
              $lookup: {
                from: 'users',
                localField: 'studentId',
                foreignField: '_id',
                as: 'student'
              }
            },
            {
              $lookup: {
                from: 'courses',
                localField: 'courseId',
                foreignField: '_id',
                as: 'course'
              }
            }
          ],
          gradingProgress: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                pending: { $sum: { $cond: [{ $ifNull: ['$grade', false] }, 0, 1] } },
                graded: { $sum: { $cond: [{ $ifNull: ['$grade', false] }, 1, 0] } }
              }
            }
          ]
        }
      }
    ]);

    res.json(stats[0]);
  } catch (error) {
    console.error('Error fetching submission stats:', error);
    res.status(500).json({ message: 'Error fetching submission statistics', error: error.message });
  }
};

// Get detailed submission information
export const getSubmissionDetails = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId)
      .populate('studentId', 'name email profilePicture')
      .populate('courseId', 'title instructor objectives')
      .populate('gradedBy', 'name email')
      .populate('assignmentId')
      .populate('projectId');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Get student's enrollment progress for context
    const enrollment = await Enrollment.findOne({
      user: submission.studentId,
      course: submission.courseId
    }).populate('user', 'name email');

    // Get other submissions by same student in this course for comparison
    const studentSubmissions = await Submission.find({
      studentId: submission.studentId,
      courseId: submission.courseId,
      _id: { $ne: submissionId }
    })
    .populate('assignmentId')
    .populate('projectId')
    .sort({ createdAt: -1 });

    res.json({
      submission,
      enrollment,
      studentSubmissions,
      studentPerformance: {
        totalSubmissions: studentSubmissions.length + 1,
        averageGrade: studentSubmissions.reduce((acc, sub) => acc + (sub.grade || 0), 0) / (studentSubmissions.length || 1),
        gradedSubmissions: studentSubmissions.filter(sub => sub.grade).length
      }
    });
  } catch (error) {
    console.error('Error fetching submission details:', error);
    res.status(500).json({ message: 'Error fetching submission details', error: error.message });
  }
};

// Get submissions by course with student progress
export const getCourseSubmissions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { assignmentId, projectOnly } = req.query;

    const filter = { courseId };
    if (assignmentId) filter.assignmentId = assignmentId;
    if (projectOnly === 'true') filter.projectId = { $exists: true };

    const submissions = await Submission.find(filter)
      .populate('studentId', 'name email profilePicture')
      .populate('assignmentId')
      .populate('projectId')
      .populate('gradedBy', 'name')
      .sort({ createdAt: -1 });

    // Get course details and all enrolled students
    const course = await Course.findById(courseId).select('title assignments project');
    const enrollments = await Enrollment.find({ course: courseId })
      .populate('user', 'name email profilePicture');

    // Create a map of all students in the course
    const allStudents = enrollments.map(enrollment => ({
      student: enrollment.user,
      enrollmentProgress: enrollment
    }));

    res.json({
      submissions,
      course,
      allStudents,
      summary: {
        totalStudents: allStudents.length,
        totalSubmissions: submissions.length,
        pendingGrading: submissions.filter(s => !s.grade).length,
        averageGrade: submissions.filter(s => s.grade).reduce((acc, s) => acc + s.grade, 0) / (submissions.filter(s => s.grade).length || 1)
      }
    });
  } catch (error) {
    console.error('Error fetching course submissions:', error);
    res.status(500).json({ message: 'Error fetching course submissions', error: error.message });
  }
};

// Get student's submission history across courses
export const getStudentSubmissions = async (req, res) => {
  try {
    const { studentId } = req.params;

    const submissions = await Submission.find({ studentId })
      .populate('courseId', 'title instructor thumbnail')
      .populate('assignmentId')
      .populate('projectId')
      .populate('gradedBy', 'name')
      .sort({ createdAt: -1 });

    // Get student's enrollments for progress context
    const enrollments = await Enrollment.find({ user: studentId })
      .populate('course', 'title instructor');

    const performanceSummary = {
      totalSubmissions: submissions.length,
      gradedSubmissions: submissions.filter(s => s.grade).length,
      averageGrade: submissions.filter(s => s.grade).reduce((acc, s) => acc + s.grade, 0) / (submissions.filter(s => s.grade).length || 1),
      coursesEnrolled: enrollments.length,
      coursesCompleted: enrollments.filter(e => e.completed).length
    };

    res.json({
      submissions,
      enrollments,
      performanceSummary,
      student: await User.findById(studentId).select('name email profilePicture')
    });
  } catch (error) {
    console.error('Error fetching student submissions:', error);
    res.status(500).json({ message: 'Error fetching student submissions', error: error.message });
  }
};

// Enhanced grade submission with notification
export const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback, rubricScores, resubmitRequired, resubmitDeadline } = req.body;

    const submission = await Submission.findById(submissionId)
      .populate('studentId', 'name email')
      .populate('courseId', 'title');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Update submission
    submission.grade = grade;
    submission.feedback = feedback;
    submission.gradedBy = req.user._id;
    submission.gradedAt = new Date();
    submission.rubricScores = rubricScores;
    submission.resubmitRequired = resubmitRequired;
    if (resubmitDeadline) submission.resubmitDeadline = new Date(resubmitDeadline);

    await submission.save();

    // Update enrollment progress
    const enrollment = await Enrollment.findOne({
      user: submission.studentId,
      course: submission.courseId
    });

    if (submission.assignmentId) {
      const assignmentProgress = enrollment.assignmentProgress.find(
        ap => ap.assignmentId && ap.assignmentId.toString() === submission.assignmentId.toString()
      );
      if (assignmentProgress) {
        assignmentProgress.score = grade;
        assignmentProgress.graded = true;
        assignmentProgress.feedback = feedback;
        assignmentProgress.gradedAt = new Date();
      }
    } else if (submission.projectId) {
      enrollment.projectProgress.score = grade;
      enrollment.projectProgress.reviewed = true;
      enrollment.projectProgress.feedback = feedback;
      enrollment.projectProgress.gradedAt = new Date();
    }

    await enrollment.save();

    // TODO: Add notification system here
    console.log(`📝 Submission graded: Student ${submission.studentId.name}, Course: ${submission.courseId.title}, Grade: ${grade}`);

    res.json({ 
      message: 'Submission graded successfully', 
      submission: await Submission.findById(submissionId)
        .populate('studentId', 'name email')
        .populate('courseId', 'title')
        .populate('gradedBy', 'name'),
      enrollmentUpdate: {
        assignmentProgress: enrollment.assignmentProgress,
        projectProgress: enrollment.projectProgress
      }
    });

  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({ message: 'Error grading submission', error: error.message });
  }
};

// Bulk grade submissions
export const bulkGradeSubmissions = async (req, res) => {
  try {
    const { submissions } = req.body; // Array of { submissionId, grade, feedback }

    const results = [];
    
    for (const item of submissions) {
      try {
        const submission = await Submission.findById(item.submissionId);
        if (submission) {
          submission.grade = item.grade;
          submission.feedback = item.feedback;
          submission.gradedBy = req.user._id;
          submission.gradedAt = new Date();
          await submission.save();

          // Update enrollment
          const enrollment = await Enrollment.findOne({
            user: submission.studentId,
            course: submission.courseId
          });

          if (submission.assignmentId) {
            const assignmentProgress = enrollment.assignmentProgress.find(
              ap => ap.assignmentId && ap.assignmentId.toString() === submission.assignmentId.toString()
            );
            if (assignmentProgress) {
              assignmentProgress.score = item.grade;
              assignmentProgress.graded = true;
              assignmentProgress.feedback = item.feedback;
            }
          }

          await enrollment.save();
          results.push({ submissionId: item.submissionId, status: 'success' });
        }
      } catch (error) {
        results.push({ submissionId: item.submissionId, status: 'error', error: error.message });
      }
    }

    res.json({ 
      message: 'Bulk grading completed', 
      results,
      summary: {
        total: submissions.length,
        successful: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'error').length
      }
    });
  } catch (error) {
    console.error('Error in bulk grading:', error);
    res.status(500).json({ message: 'Error in bulk grading', error: error.message });
  }
};