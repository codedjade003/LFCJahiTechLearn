// middleware/isCourseInstructor.js
import Course from '../models/courseModel.js';
export const isCourseInstructor = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is course creator or assigned instructor
    const isInstructor = course.createdBy.toString() === req.user._id.toString() ||
                         course.instructors.some(instructor => 
                           instructor.userId.toString() === req.user._id.toString()
                         );

    if (!isInstructor && req.user.role !== 'admin' && req.user.email !== 'codedjade003@gmail.com') {
      return res.status(403).json({ 
        message: 'Access denied. Only course instructors can perform this action.' 
      });
    }

    req.course = course; // Attach course to request
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error verifying course ownership', error: error.message });
  }
};

// Middleware for super admin override
export const isCourseInstructorOrSuperAdmin = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Super admin override
    if (req.user.email === 'codedjade003@gmail.com') {
      req.course = course;
      return next();
    }

    // Check if user is course creator or assigned instructor
    const isInstructor = course.createdBy.toString() === req.user._id.toString() ||
                         course.instructors.some(instructor => 
                           instructor.userId.toString() === req.user._id.toString()
                         );

    if (!isInstructor && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Only course instructors can perform this action.' 
      });
    }

    req.course = course;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error verifying course ownership', error: error.message });
  }
};