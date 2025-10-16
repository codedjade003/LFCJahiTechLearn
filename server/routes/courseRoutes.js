import express from "express";
import {
  createCourse,
  addSection,
  addModule,
  getAllCourses,
  getCourseById,
  getSections,
  getSectionById,
  getModules,
  getModuleById,
  updateCourse,
  updateSection,
  updateModule,
  deleteCourse,
  deleteSection,
  deleteModule,
  createProject,
  updateProject,
  deleteProject,
  getProject,
  addAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  deleteAllCourses,
  getCategories,
  updateIsPublic,
  getEnums,
  migrateInstructors,
  addInstructors,
  getCoursePermissions,
} from "../controllers/courseController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdminOnly } from "../middleware/isAdminOnly.js";
import { uploadFile } from "../controllers/uploadController.js";
import { logAction } from "../middleware/logAction.js";
import { submitCourseFeedback } from "../controllers/feedbackController.js";
import { isSuperAdmin } from "../middleware/isSuperAdmin.js";

const router = express.Router();

/**
 * IMPORTANT: 
 * Always define STATIC routes BEFORE dynamic ones (/:courseId)
 * Otherwise "visibility", "enums", etc. will be treated as courseId.
 */

// STATIC COURSE-LEVEL ROUTES
router.post("/", protect, logAction('create', 'course'), isAdminOnly, createCourse);
router.put("/visibility", protect, logAction('update', 'course_visibility'), isAdminOnly, updateIsPublic);
router.post("/upload/:fileType", protect, logAction('upload', 'course_file'), isAdminOnly, uploadFile);
router.get("/", getAllCourses); // No logging
router.post('/:courseId/instructors', protect, isSuperAdmin, addInstructors)
router.get("/enums", getEnums); // No logging
router.get("/categories", getCategories); // No logging
router.post('/migrate-creators-to-instructors', protect, isSuperAdmin, migrateInstructors);
router.delete("/", protect, logAction('delete', 'all_courses'), isAdminOnly, deleteAllCourses);

// DYNAMIC COURSE ROUTES
router.get("/:courseId", getCourseById); // No logging
router.get('/:courseId/permissions', protect, getCoursePermissions); // No logging
router.post('/:courseId/feedback', logAction('feedback', 'course'), protect, submitCourseFeedback);
router.put("/:courseId", protect, logAction('update', 'course'), isAdminOnly, updateCourse);
router.delete("/:courseId", protect, logAction('delete', 'course'), isAdminOnly, deleteCourse);

// SECTIONS
router.post("/:courseId/sections", protect, logAction('create', 'section'), isAdminOnly, addSection);
router.get("/:courseId/sections", getSections); // No logging
router.get("/:courseId/sections/:sectionId", getSectionById); // No logging
router.put("/:courseId/sections/:sectionId", protect, logAction('update', 'section'), isAdminOnly, updateSection);
router.delete("/:courseId/sections/:sectionId", protect, logAction('delete', 'section'), isAdminOnly, deleteSection);

// MODULES
router.post("/:courseId/sections/:sectionId/modules", protect, logAction('create', 'module'), isAdminOnly, addModule);
router.get("/:courseId/sections/:sectionId/modules", getModules); // No logging
router.get("/:courseId/sections/:sectionId/modules/:moduleId", getModuleById); // No logging
router.put("/:courseId/sections/:sectionId/modules/:moduleId", protect, logAction('update', 'module'), isAdminOnly, updateModule);
router.delete("/:courseId/sections/:sectionId/modules/:moduleId", protect, logAction('delete', 'module'), isAdminOnly, deleteModule);

// PROJECT
router.post("/:courseId/project", protect, logAction('create', 'project'), isAdminOnly, createProject);
router.get("/:courseId/project", getProject); // No logging
router.put("/:courseId/project", protect, logAction('update', 'project'), isAdminOnly, updateProject);
router.delete("/:courseId/project", protect, logAction('delete', 'project'), isAdminOnly, deleteProject);

// ASSIGNMENTS
router.post("/:courseId/assignments", protect, logAction('create', 'assignment'), isAdminOnly, addAssignment);
router.get("/:courseId/assignments", getAssignments); // No logging
router.get("/:courseId/assignments/:assignmentId", getAssignmentById); // No logging
router.put("/:courseId/assignments/:assignmentId", protect, logAction('update', 'assignment'), isAdminOnly, updateAssignment);
router.delete("/:courseId/assignments/:assignmentId", protect, logAction('delete', 'assignment'), isAdminOnly, deleteAssignment);

export default router;
