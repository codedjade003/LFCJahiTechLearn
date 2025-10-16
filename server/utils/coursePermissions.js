// utils/coursePermissions.js
import { Course } from '../models/Course.js';
import User from "../models/User.js";

export const canManageCourse = (user, course) => {
  if (!user || !course) return false;
  
  // Super admin can do anything
  if (user.email === 'codedjade003@gmail.com') return true;
  
  // Check if user is course creator
  if (course.createdBy && course.createdBy.toString() === user._id.toString()) return true;
  
  // Check if user is assigned instructor
  if (course.instructors && course.instructors.some(instructor => 
    instructor.userId && instructor.userId.toString() === user._id.toString()
  )) return true;
  
  return false;
};

export const getUserCoursePermissions = async (userId, courseId) => {
  try {
    const course = await Course.findById(courseId);
    const user = await User.findById(userId);
    
    if (!course || !user) {
      return {
        canGrade: false,
        canReview: false,
        isInstructor: false
      };
    }
    
    const canManage = canManageCourse(user, course);
    
    return {
      canGrade: canManage,
      canReview: canManage,
      isInstructor: canManage,
      canManage: canManage // Add this for clarity
    };
  } catch (error) {
    console.error('Error getting user course permissions:', error);
    return {
      canGrade: false,
      canReview: false,
      isInstructor: false,
      canManage: false
    };
  }
};