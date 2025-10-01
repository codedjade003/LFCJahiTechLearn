// utils/coursePermissions.js
import { Course } from '../models/Course.js';
import { Submission } from '../models/Submission.js';import User from "../models/User.js";

export const canManageCourse = (user, course) => {
  // Super admin can do anything
  if (user.email === 'codedjade003@gmail.com') return true;
  
  // Check if user is course creator
  if (course.createdBy.toString() === user._id.toString()) return true;
  
  // Check if user is assigned instructor
  if (course.instructors.some(instructor => 
    instructor.userId.toString() === user._id.toString()
  )) return true;
  
  // Regular admins can't automatically manage courses
  return false;
};

// Use in frontend to show/hide assessment buttons
export const getUserCoursePermissions = async (userId, courseId) => {
  const course = await Course.findById(courseId);
  const user = await User.findById(userId);
  
  return {
    canGrade: canManageCourse(user, course),
    canReview: canManageCourse(user, course),
    isInstructor: canManageCourse(user, course)
  };
};