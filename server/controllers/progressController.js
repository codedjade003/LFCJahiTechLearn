// controllers/progressController.js
import Enrollment from '../models/Enrollment.js';
import { Course } from '../models/Course.js';
import { Submission } from '../models/Submission.js';import mongoose from 'mongoose';
// NOTE: helper to build ISO date once
const now = () => new Date();


export const calculateCourseProgress = (enrollment, course) => {
  if (!course.sections) return 0;
  
  let totalItems = 0;
  let completedItems = 0;

  // Calculate based on sections and modules
  course.sections.forEach(section => {
    const sectionProgress = enrollment.sectionProgress.find(
      sp => sp.sectionId.toString() === section._id.toString()
    );
    
    if (sectionProgress) {
      completedItems += sectionProgress.modulesCompleted;
      totalItems += sectionProgress.totalModules;
    } else {
      totalItems += section.modules?.length || 0;
    }
  });

  // Include assignments
  totalItems += course.assignments?.length || 0;
  completedItems += enrollment.assignmentProgress?.filter(a => a.submitted).length || 0;

  // Include project
  if (course.project) {
    totalItems += 1;
    if (enrollment.projectProgress?.submitted) {
      completedItems += 1;
    }
  }

  return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
};

export const updateEnrollmentProgress = async (enrollmentId, courseId) => {
  try {
    const enrollment = await Enrollment.findById(enrollmentId);
    const course = await Course.findById(courseId).populate('sections');

    if (!enrollment || !course) return null;

    let totalWeight = 0;
    let completedWeight = 0;

    // Calculate progress based on different components with weights
    const weights = {
      modules: 0.4,    // 40% for module completion
      assignments: 0.3, // 30% for assignments
      project: 0.3     // 30% for project
    };

    // Module progress (40%)
    const totalModules = course.sections?.reduce((acc, section) => 
      acc + (section.modules?.length || 0), 0) || 0;
    
    const completedModules = enrollment.moduleProgress?.filter(mp => mp.completed).length || 0;
    const moduleProgress = totalModules > 0 ? (completedModules / totalModules) * weights.modules : 0;

    // Assignment progress (30%)
    const totalAssignments = course.assignments?.length || 0;
    const completedAssignments = enrollment.assignmentProgress?.filter(ap => 
      ap.submitted && ap.score >= 70 // Only count passing assignments
    ).length || 0;
    const assignmentProgress = totalAssignments > 0 ? 
      (completedAssignments / totalAssignments) * weights.assignments : 0;

    // Project progress (30%)
    const projectProgress = (enrollment.projectProgress?.submitted && 
                           enrollment.projectProgress?.score >= 70) ? weights.project : 0;

    // Calculate total progress
    const progress = Math.min(100, Math.round((moduleProgress + assignmentProgress + projectProgress) * 100));
    
    // Mark course as completed if all major components are done
    const completed = (
      (totalModules === 0 || completedModules >= totalModules) &&
      (totalAssignments === 0 || completedAssignments >= totalAssignments) &&
      (course.project ? (enrollment.projectProgress?.submitted && enrollment.projectProgress?.score >= 70) : true)
    );

    // Update section progress
    const sectionProgress = course.sections?.map(section => {
      const existing = enrollment.sectionProgress?.find(
        sp => sp.sectionId.toString() === section._id.toString()
      );

      const completedModulesInSection = enrollment.moduleProgress?.filter(
        mp => section.modules?.some(m => m._id.toString() === mp.moduleId.toString()) && mp.completed
      ).length || 0;

      const sectionCompleted = completedModulesInSection === (section.modules?.length || 0);

      return {
        sectionId: section._id,
        completed: sectionCompleted,
        modulesCompleted: completedModulesInSection,
        totalModules: section.modules?.length || 0,
        completedAt: sectionCompleted ? (existing?.completedAt || new Date()) : null
      };
    }) || [];

    // Atomic update
    const updated = await Enrollment.findByIdAndUpdate(
      enrollmentId,
      {
        $set: {
          sectionProgress,
          progress,
          completed,
          completedAt: completed ? (enrollment.completedAt || new Date()) : null
        }
      },
      { new: true }
    );

    console.log(`📊 Progress updated for enrollment ${enrollmentId}: ${progress}% completed: ${completed}`);

    return updated;
  } catch (error) {
    console.error('Error updating progress:', error);
    throw error;
  }
};

export const submitAssignment = async (userId, courseId, assignmentId, submissionData) => {
  // push or update assignmentProgress atomically:
  const existing = await Enrollment.findOne({
    user: userId,
    course: courseId,
    "assignmentProgress.assignmentId": assignmentId
  });

  if (existing) {
    // update the existing entry
    await Enrollment.findOneAndUpdate(
      {
        user: userId,
        course: courseId,
        "assignmentProgress.assignmentId": assignmentId
      },
      {
        $set: {
          "assignmentProgress.$.submitted": true,
          "assignmentProgress.$.submittedAt": new Date(),
          "assignmentProgress.$.submission": submissionData.submission || null,
          // copy other fields from submissionData as needed
        }
      }
    );
  } else {
    // push new
    await Enrollment.findOneAndUpdate(
      { user: userId, course: courseId },
      {
        $push: {
          assignmentProgress: {
            assignmentId,
            submitted: true,
            submittedAt: new Date(),
            ...submissionData
          }
        }
      }
    );
  }

  return await updateEnrollmentProgress((await Enrollment.findOne({ user: userId, course: courseId }))._id, courseId);
};

export const submitProject = async (userId, courseId, submissionData) => {
  try {
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    const course = await Course.findById(courseId);
    
    if (!course.project) {
      throw new Error("This course does not have a project");
    }
    
    // Check if project already submitted
    if (enrollment.projectProgress?.submitted) {
      throw new Error("Project already submitted");
    }
    
    // Validate submission deadline
    if (course.project.dueDate && new Date() > course.project.dueDate) {
      throw new Error("Project submission deadline has passed");
    }
    
    // Validate submission type
    if (!course.project.submissionTypes.includes(submissionData.submissionType)) {
      throw new Error(`Invalid submission type. Allowed: ${course.project.submissionTypes.join(', ')}`);
    }
    
    // Create submission record
    const submission = new Submission({
      courseId,
      projectId: course.project._id,
      studentId: userId,
      submissionType: submissionData.submissionType,
      submission: submissionData.submission
    });
    
    await submission.save();
    
    // Update enrollment progress
    enrollment.projectProgress = {
      submitted: true,
      submittedAt: new Date(),
      reviewed: false,
      score: 0,
      feedback: ""
    };
    
    return await updateEnrollmentProgress(enrollment._id, courseId);
  } catch (error) {
    throw error;
  }
};

export const submitQuiz = async (userId, courseId, quizId, answers) => {
  try {
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    const course = await Course.findById(courseId);
    
    // Find the quiz in course sections
    let quiz = null;
    let sectionWithQuiz = null;
    
    for (const section of course.sections) {
      for (const module of section.modules) {
        if (module._id.toString() === quizId && module.type === 'quiz') {
          quiz = module.quiz;
          sectionWithQuiz = section;
          break;
        }
      }
      if (quiz) break;
    }
    
    if (!quiz) {
      throw new Error("Quiz not found in course");
    }
    
    // Calculate score
    let correctAnswers = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    
    // Update quiz progress
    const existingQuiz = enrollment.quizProgress?.find(q => q.quizId.toString() === quizId);
    
    if (existingQuiz) {
      existingQuiz.attempts += 1;
      if (score > existingQuiz.bestScore) {
        existingQuiz.bestScore = score;
      }
      existingQuiz.score = score;
      existingQuiz.completedAt = new Date();
    } else {
      if (!enrollment.quizProgress) {
        enrollment.quizProgress = [];
      }
      enrollment.quizProgress.push({
        quizId,
        score,
        attempts: 1,
        bestScore: score,
        completedAt: new Date()
      });
    }
    
    // Mark module as completed if quiz passed (assuming 70% passing)
    if (score >= 70) {
      await markModuleComplete(userId, courseId, quizId);
    }
    
    await enrollment.save();
    
    return {
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      passed: score >= 70
    };
  } catch (error) {
    throw error;
  }
};

// Track when a module is started/accessed
export const trackModuleAccess = async (userId, courseId, moduleId) => {
  try {
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (!enrollment) throw new Error("Enrollment not found");

    const timestamp = now();
    
    // Check if module progress already exists
    const existingProgress = enrollment.moduleProgress.find(
      mp => mp.moduleId.toString() === moduleId.toString()
    );

    if (existingProgress) {
      // Update lastAccessed time
      await Enrollment.findOneAndUpdate(
        {
          user: userId,
          course: courseId,
          "moduleProgress.moduleId": moduleId
        },
        {
          $set: {
            "moduleProgress.$.lastAccessed": timestamp
          }
        }
      );
    } else {
      // Create new module progress entry with start time
      await Enrollment.findOneAndUpdate(
        { user: userId, course: courseId },
        {
          $push: {
            moduleProgress: {
              moduleId,
              completed: false,
              lastAccessed: timestamp
            }
          }
        }
      );
    }

    return { success: true, timestamp };
  } catch (error) {
    console.error("Error tracking module access:", error);
    throw error;
  }
};

export const markModuleComplete = async (userId, courseId, moduleId, completed = true) => {
  // ensure enrollment exists
  const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
  if (!enrollment) throw new Error("Enrollment not found");

  // ensure module exists in course
  const course = await Course.findById(courseId);
  const moduleExists = course.sections.some(section =>
    section.modules.some(m => m._id.toString() === moduleId.toString())
  );
  if (!moduleExists) throw new Error("Module not found in course");

  const timestamp = now();

  // 1) Try to atomically update an existing moduleProgress entry that is not completed
  const updateExisting = await Enrollment.findOneAndUpdate(
    {
      user: userId,
      course: courseId,
      "moduleProgress.moduleId": moduleId,
      "moduleProgress.completed": { $ne: true }
    },
    {
      $set: {
        "moduleProgress.$.completed": true,
        "moduleProgress.$.completedAt": timestamp
      }
    },
    { new: true }
  );

  if (updateExisting) {
    // successfully updated existing module entry
    return await updateEnrollmentProgress(updateExisting._id, courseId);
  }

  // 2) If no existing element was updated, either it already was completed or doesn't exist.
  // Check whether it already exists and is completed
  const already = await Enrollment.findOne({
    user: userId,
    course: courseId,
    "moduleProgress.moduleId": moduleId,
    "moduleProgress.completed": true
  });

  if (already) {
    // already completed -> throw or return current enrollment
    throw new Error("Module already completed");
  }

  // 3) No existing entry: push a new moduleProgress element atomically
  const pushed = await Enrollment.findOneAndUpdate(
    { user: userId, course: courseId },
    {
      $push: {
        moduleProgress: {
          moduleId,
          completed: true,
          completedAt: timestamp
        }
      }
    },
    { new: true }
  );

  if (!pushed) throw new Error("Enrollment not found when pushing moduleProgress");

  // 4) Recompute and persist the aggregated progress (see updated updateEnrollmentProgress below)
  return await updateEnrollmentProgress(pushed._id, courseId);
};

// Add this to your progressController.js
export const updateTimeSpent = async (enrollmentId, additionalTime = 0) => {
  try {
    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) return;
    
    enrollment.timeSpent = (enrollment.timeSpent || 0) + additionalTime;
    enrollment.lastAccessed = new Date();
    await enrollment.save();
  } catch (error) {
    console.error('Error updating time spent:', error);
  }
};

// Call this whenever a user interacts with course content
export const trackModuleTime = async (userId, courseId, moduleId, timeSpentMinutes) => {
  const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
  if (!enrollment) return;
  
  // Update module-specific time
  const moduleProgress = enrollment.moduleProgress.find(
    mp => mp.moduleId.toString() === moduleId.toString()
  );
  
  if (moduleProgress) {
    moduleProgress.timeSpent = (moduleProgress.timeSpent || 0) + timeSpentMinutes;
    moduleProgress.lastAccessed = new Date();
  }
  
  await updateTimeSpent(enrollment._id, timeSpentMinutes);
  await enrollment.save();
};

// controllers/progressController.js - ADD THIS FUNCTION
export const calculateStudentRisk = (enrollment, course) => {
  if (!enrollment || !course) return 'none';
  
  const enrolledDate = new Date(enrollment.enrolledAt);
  const now = new Date();
  const daysEnrolled = Math.floor((now - enrolledDate) / (1000 * 60 * 60 * 24));
  
  // Convert estimated duration to days
  let estimatedDays = 30; // default 1 month
  if (course.duration) {
    // Parse course duration (e.g., "2 months", "6 weeks")
    const match = course.duration.match(/(\d+)\s*(day|week|month)/i);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      if (unit === 'month') estimatedDays = value * 30;
      else if (unit === 'week') estimatedDays = value * 7;
      else estimatedDays = value;
    }
  }
  
  const progress = enrollment.progress || 0;
  const expectedProgress = Math.min(100, (daysEnrolled / estimatedDays) * 100);
  const progressGap = expectedProgress - progress;
  
  if (daysEnrolled > estimatedDays + 60) return 'high'; // 2+ months overdue
  if (daysEnrolled > estimatedDays + 30) return 'medium'; // 1+ month overdue
  if (progressGap > 50) return 'medium'; // 50% behind expected progress
  if (progressGap > 25) return 'low'; // 25% behind expected progress
  
  return 'none';
};

// Add these to your progressController.js
export const getUserProgressOverview = async (userId) => {
  try {
    const enrollments = await Enrollment.find({ user: userId, status: 'active' })
      .populate({
        path: 'course',
        match: { 
          $or: [
            { isDeleted: { $exists: false } },
            { isDeleted: false }
          ],
          status: { $ne: 'deleted' }
        }
      });

    const validEnrollments = enrollments.filter(enrollment => enrollment.course !== null);
    
    const coursesWithProgress = validEnrollments.map(enrollment => {
      const riskLevel = calculateStudentRisk(enrollment, enrollment.course);
      const timeSpentHours = Math.round((enrollment.timeSpent || 0) / 60);
      
      return {
        _id: enrollment.course._id,
        name: enrollment.course.title,
        percentage: enrollment.progress || 0,
        color: getProgressColor(enrollment.progress),
        riskLevel,
        timeSpent: timeSpentHours,
        enrolledAt: enrollment.enrolledAt,
        estimatedDuration: enrollment.course.duration || '1 month'
      };
    });

    const stats = {
      atRisk: coursesWithProgress.filter(course => course.riskLevel !== 'none').length,
      onTrack: coursesWithProgress.filter(course => course.riskLevel === 'none' && course.percentage < 100).length,
      completed: coursesWithProgress.filter(course => course.percentage === 100).length,
      total: coursesWithProgress.length
    };

    return { courses: coursesWithProgress, stats };
  } catch (error) {
    throw error;
  }
};

// Helper functions for the controller
const getProgressColor = (progress) => {
  if (progress >= 80) return 'bg-green-600';
  if (progress >= 50) return 'bg-yellow-500';
  if (progress >= 25) return 'bg-blue-600';
  return 'bg-red-500';
};