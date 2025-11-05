// controllers/courseController.js
import mongoose from "mongoose";
import { Course } from '../models/Course.js';
import { Submission } from '../models/Submission.js';import Enrollment from "../models/Enrollment.js";
import { callCreateNotification } from "./notificationController.js";
import { getUserCoursePermissions } from "../utils/coursePermissions.js";

/**
 * COURSES
 */
// In your createCourse controller
export const createCourse = async (req, res) => {
  console.log('🚀 POST /api/courses - START');
  try {
    console.log('📦 Request body received');
    const courseData = {
      ...req.body,
      createdBy: req.user._id,
      // Don't create empty project - let admin add it later if needed
      project: undefined // Remove any project data from creation
    };
    console.log('🗃️ Creating course in database...');
    const course = await Course.create(courseData);
    console.log('✅ Course created successfully');
    res.status(201).json(course);
  } catch (error) {
    console.error('❌ createCourse error:', error.message);
    res.status(400).json({ message: error.message });
  }
  console.log('🏁 POST /api/courses - END');
};

export const updateCourse = async (req, res) => {
  console.log('🚀 PUT /api/courses/:courseId - START');
  console.log('📝 Course ID:', req.params.courseId);
  
  try {
    console.log('📦 Request body received:', JSON.stringify(req.body, null, 2));
    
    // REMOVE all project handling from here - projects have their own endpoints now
    let updateData = { ...req.body };
    
    // Don't handle project data here anymore
    // Projects are managed through separate /project endpoints
    
    console.log('🔄 Updating course in database...');
    const course = await Course.findByIdAndUpdate(
      req.params.courseId, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!course) {
      console.log('❌ Course not found');
      return res.status(404).json({ message: "Course not found" });
    }
    
    console.log('✅ Course updated successfully');
    
    // Only send notifications for course updates, not project updates
    if (updateData.title) {
      console.log('🔔 Starting notifications...');
      await notifyEnrolledUsers(course._id, `Course updated: "${course.title}"`, "course");
      console.log('✅ Notifications sent');
    }
    
    res.json(course);
  } catch (err) {
    console.error('❌ updateCourse error:', err.message);
    
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        message: "Invalid data format", 
        error: `Cast error for field ${err.path}: ${err.value}`,
        details: err.message
      });
    }
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        error: err.message 
      });
    }
    
    res.status(500).json({ 
      message: "Failed to update course", 
      error: err.message 
    });
  }
  
  console.log('🏁 PUT /api/courses/:courseId - END');
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch courses", error: err.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate('createdBy', 'name email')  // ADD THIS
      .populate('instructors.userId', 'name email') // ADD THIS
      .select('+promoVideo');
    
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch course", error: err.message });
  }
};

// routes/courses.js - Add this route
export const getCoursePermissions = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const permissions = await getUserCoursePermissions(req.user._id, req.params.courseId);
    
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching course permissions:', error);
    res.status(500).json({ message: 'Error fetching permissions' });
  }
};

// Add to your course routes
export const addInstructors = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId, name, role = 'assistant' } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if instructor already assigned
    const alreadyInstructor = course.instructors.some(instructor => 
      instructor.userId.toString() === userId
    );

    if (alreadyInstructor) {
      return res.status(400).json({ message: 'User is already an instructor for this course' });
    }

    // Add instructor
    course.instructors.push({
      userId,
      name,
      role
    });

    await course.save();
    res.json({ message: 'Instructor added successfully', course });
  } catch (error) {
    res.status(500).json({ message: 'Error adding instructor', error: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    
    // HARD DELETE: Delete all enrollments for this course
    await Enrollment.deleteMany({ course: courseId });
    
    // HARD DELETE: Delete all submissions for this course
    await Submission.deleteMany({ courseId: courseId });
    
    // HARD DELETE: Delete the course itself
    await Course.findByIdAndDelete(courseId);
    
    // Notify enrolled users about the course deletion
    await notifyEnrolledUsers(course._id, `Course deleted: "${course.title}"`, "course");
    
    res.json({ 
      message: "Course and all associated data permanently deleted",
      courseId: course._id,
      title: course.title
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete course", error: err.message });
  }
};

export const deleteAllCourses = async (req, res) => {
  try {
    await Course.deleteMany();
    res.json({ message: "All courses deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete all courses", error: err.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Course.distinct("categories");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

export const updateIsPublic = async (req, res) => {
  try {
    const { updates } = req.body;
    
    console.log('Visibility update request:', updates); // Debug log
    
    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ message: "Invalid updates format" });
    }

    const updateResults = [];
    
    for (const update of updates) {
      try {
        const { courseId, isPublic } = update;
        
        if (!courseId) {
          updateResults.push({ courseId, success: false, error: 'Missing courseId' });
          continue;
        }

        // Validate courseId format
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
          updateResults.push({ courseId, success: false, error: 'Invalid course ID format' });
          continue;
        }

        const course = await Course.findByIdAndUpdate(
          courseId, 
          { isPublic: Boolean(isPublic) }, // Ensure boolean
          { new: true, runValidators: true }
        );
        
        if (!course) {
          updateResults.push({ courseId, success: false, error: 'Course not found' });
          continue;
        }
        
        updateResults.push({ courseId, success: true, isPublic: course.isPublic });
      } catch (error) {
        console.error(`Error updating course ${update.courseId}:`, error);
        updateResults.push({ courseId: update.courseId, success: false, error: error.message });
      }
    }

    // Check if all updates failed
    const successfulUpdates = updateResults.filter(result => result.success);
    
    if (successfulUpdates.length === 0) {
      return res.status(400).json({ 
        message: "All updates failed", 
        results: updateResults 
      });
    }
    
    res.status(200).json({ 
      message: "Visibility updated successfully",
      results: updateResults 
    });
  } catch (error) {
    console.error("Error in updateIsPublic:", error);
    res.status(500).json({ 
      message: "Error updating visibility", 
      error: error.message 
    });
  }
};

export const getEnums = async (req, res) => {
  try {
    const levels = Course.schema.path("level").enumValues;
    const types = Course.schema.path("type").enumValues;
    // categories is not an enum in your schema, so keep it static or drop it
    const categories = [
      "Video",
      "Audio",
      "Graphics",
      "Content Creation",
      "Required",
      "Utility",
      "Secretariat"
    ];

    res.json({ levels, types, categories });
  } catch (err) {
    console.error("Error fetching enums:", err);
    res.status(500).json({ error: "Failed to fetch enums" });
  }
};

// Add to routes/courseRoutes.js - TEMPORARY
export const migrateInstructors = async (req, res) => {
  try {
    const courses = await Course.find({}).populate('createdBy', 'name');
    let updated = 0;
    
    for (let course of courses) {
      const creatorIsInstructor = course.instructors.some(instr => 
        instr.userId.toString() === course.createdBy._id.toString()
      );
      
      if (!creatorIsInstructor && course.createdBy) {
        course.instructors.unshift({
          userId: course.createdBy._id,
          name: course.createdBy.name || 'Course Creator',
          role: 'main'
        });
        await course.save();
        updated++;
      }
    }
    
    res.json({ message: `Updated ${updated} courses` });
  } catch (error) {
    res.status(500).json({ message: 'Migration failed', error: error.message });
  }
};

/**
 * SECTIONS
 */
export const getSections = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .select('sections');
    
    if (!course) return res.status(404).json({ message: "Course not found" });
    
    // This ensures nested subdocuments are properly serialized
    res.json(JSON.parse(JSON.stringify(course.sections)));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sections", error: err.message });
  }
};

export const getSectionById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    const section = course.sections.id(req.params.sectionId);
    if (!section) return res.status(404).json({ message: "Section not found" });
    res.json(JSON.parse(JSON.stringify(section)));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch section", error: err.message });
  }
};

export const addSection = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    course.sections.push(req.body);
    await course.save();
    await notifyEnrolledUsers(
      course._id,
      `New section added: "${req.body.title}"`,
      "section",
      null,
      `/dashboard/courses/${course._id}`
    );
    res.status(201).json(JSON.parse(JSON.stringify(course.sections[course.sections.length - 1])));
  } catch (err) {
    res.status(500).json({ message: "Failed to add section", error: err.message });
  }
};

export const updateSection = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    const section = course.sections.id(req.params.sectionId);
    if (!section) return res.status(404).json({ message: "Section not found" });
    Object.assign(section, req.body);
    await course.save();
    await notifyEnrolledUsers(
      course._id,
      `Section updated: "${section.title}"`,
      "section",
      null,
      `/dashboard/courses/${course._id}`
    );
    res.json(JSON.parse(JSON.stringify(section)));
  } catch (err) {
    res.status(500).json({ message: "Failed to update section", error: err.message });
  }
};

export const deleteSection = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const section = course.sections.id(req.params.sectionId);
    if (!section) return res.status(404).json({ message: "Section not found" });

    const deletedTitle = section.title;

    // Use pull to remove section
    course.sections.pull({ _id: req.params.sectionId });
    await course.save();

    await notifyEnrolledUsers(
      course._id,
      `Section deleted: "${deletedTitle}"`,
      "section",
      null,
      `/dashboard/courses/${course._id}`
    );

    res.json({ message: "Section deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete section", error: err.message });
  }
};


/**
 * MODULES
 */
export const getModules = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    const section = course.sections.id(req.params.sectionId);
    if (!section) return res.status(404).json({ message: "Section not found" });
    res.json(JSON.parse(JSON.stringify(section.modules)));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch modules", error: err.message });
  }
};

export const getModuleById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    const section = course.sections.id(req.params.sectionId);
    if (!section) return res.status(404).json({ message: "Section not found" });
    const module = section.modules.id(req.params.moduleId);
    if (!module) return res.status(404).json({ message: "Module not found" });
    res.json(JSON.parse(JSON.stringify(module)));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch module", error: err.message });
  }
};

export const addModule = async (req, res) => {
  try {
    const { courseId, sectionId } = req.params;
    
    // ADD DEBUG LOGS
    console.log("📥 ADD MODULE - Received data:", {
      courseId,
      sectionId,
      body: req.body,
      quiz: req.body.quiz,
      hasQuiz: !!req.body.quiz,
      questionsCount: req.body.quiz?.questions?.length || 0
    });

    const { type, title, contentUrl, duration, quiz, dueDate, estimatedDuration } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const section = course.sections.id(sectionId);
    if (!section) return res.status(404).json({ message: "Section not found" });

    const module = {
      type,
      title,
      contentUrl,
      duration,
      quiz, // This should now work
      dueDate,
      estimatedDuration: {
        value: estimatedDuration?.value,
        unit: estimatedDuration?.unit,
      },
    };

    console.log("📝 ADD MODULE - Creating module:", module);

    section.modules.push(module);
    await course.save();

    // Log the saved module
    const newModule = section.modules[section.modules.length - 1];
    console.log("✅ ADD MODULE - Saved module:", JSON.parse(JSON.stringify(newModule)));

    await notifyEnrolledUsers(
      courseId,
      `New module added: "${title}"`,
      "module",
      dueDate,
      `/dashboard/courses/${courseId}`
    );

    res.status(201).json({ 
      message: "Module added and notifications sent", 
      module: JSON.parse(JSON.stringify(newModule))
    });
  } catch (err) {
    console.error("❌ ADD MODULE - Error:", err);
    res.status(500).json({ message: "Failed to add module", error: err.message });
  }
};

export const updateModule = async (req, res) => {
  try {
    const { courseId, sectionId, moduleId } = req.params;
    
    // ADD DEBUG LOGS
    console.log("📥 UPDATE MODULE - Received data:", {
      courseId,
      sectionId, 
      moduleId,
      body: req.body,
      quiz: req.body.quiz,
      hasQuiz: !!req.body.quiz,
      questionsCount: req.body.quiz?.questions?.length || 0
    });

    const { estimatedDuration, quiz, ...rest } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const section = course.sections.id(sectionId);
    if (!section) return res.status(404).json({ message: "Section not found" });

    const module = section.modules.id(moduleId);
    if (!module) return res.status(404).json({ message: "Module not found" });

    // Assign other fields
    Object.assign(module, rest);

    // Handle quiz separately
    if (quiz !== undefined) {
      module.quiz = quiz;
    }

    // Ensure estimatedDuration is properly structured
    if (estimatedDuration) {
      module.estimatedDuration = {
        value: estimatedDuration.value,
        unit: estimatedDuration.unit,
      };
    }

    await course.save();

    console.log("✅ UPDATE MODULE - Updated module:", JSON.parse(JSON.stringify(module)));

    await notifyEnrolledUsers(
      course._id,
      `Module updated: "${module.title}"`,
      "module",
      module.dueDate,
      `/dashboard/courses/${course._id}`
    );

    res.json(JSON.parse(JSON.stringify(module)));
  } catch (err) {
    console.error("❌ UPDATE MODULE - Error:", err);
    res.status(500).json({ message: "Failed to update module", error: err.message });
  }
};

export const deleteModule = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    
    const section = course.sections.id(req.params.sectionId);
    if (!section) return res.status(404).json({ message: "Section not found" });
    
    const module = section.modules.id(req.params.moduleId);
    if (!module) return res.status(404).json({ message: "Module not found" });
    
    const deletedTitle = module.title;
    
    // Correct way to remove a subdocument from an array
    section.modules.pull({ _id: req.params.moduleId });
    
    await course.save();
    
    await notifyEnrolledUsers(
      course._id,
      `Module deleted: "${deletedTitle}"`,
      "module",
      null,
      `/dashboard/courses/${course._id}`
    );
    
    res.json({ message: "Module deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete module", error: err.message });
  }
};

/**
 * ASSIGNMENTS
 */
export const getAssignments = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    
    // Parse materials if they're stored as strings (legacy data)
    const assignments = course.assignments.map(assignment => {
      const assignmentObj = assignment.toObject();
      if (assignmentObj.materials && Array.isArray(assignmentObj.materials) && assignmentObj.materials.length > 0) {
        if (typeof assignmentObj.materials[0] === 'string') {
          console.log('⚠️ Assignment materials are strings, parsing them...');
          assignmentObj.materials = assignmentObj.materials.map(m => {
            try {
              return typeof m === 'string' ? JSON.parse(m) : m;
            } catch (e) {
              console.error('Failed to parse material:', m);
              return null;
            }
          }).filter(m => m !== null);
        }
      }
      return assignmentObj;
    });
    
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch assignments", error: err.message });
  }
};

export const getAssignmentById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    const assignment = course.assignments.id(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    
    // Parse materials if they're stored as strings (legacy data)
    const assignmentObj = assignment.toObject();
    if (assignmentObj.materials && Array.isArray(assignmentObj.materials) && assignmentObj.materials.length > 0) {
      if (typeof assignmentObj.materials[0] === 'string') {
        console.log('⚠️ Assignment materials are strings, parsing them...');
        assignmentObj.materials = assignmentObj.materials.map(m => {
          try {
            return typeof m === 'string' ? JSON.parse(m) : m;
          } catch (e) {
            console.error('Failed to parse material:', m);
            return null;
          }
        }).filter(m => m !== null);
      }
    }
    
    res.json(assignmentObj);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch assignment", error: err.message });
  }
};

export const addAssignment = async (req, res) => {
  try {
    const { courseId } = req.params;
    let { title, instructions, submissionTypes, dueDate, materials } = req.body;
    
    console.log('📦 Received add assignment request:', {
      materialsType: typeof materials,
      materialsIsArray: Array.isArray(materials),
      materialsLength: materials ? materials.length : 0,
      materialsRaw: JSON.stringify(materials, null, 2)
    });
    
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    
    // Parse materials if they're strings
    if (Array.isArray(materials) && materials.length > 0 && typeof materials[0] === 'string') {
      console.log('⚠️ Materials are strings, parsing them...');
      materials = materials.map(m => {
        try {
          return typeof m === 'string' ? JSON.parse(m) : m;
        } catch (e) {
          console.error('Failed to parse material:', m);
          return null;
        }
      }).filter(m => m !== null);
      console.log('✅ Parsed materials:', JSON.stringify(materials, null, 2));
    }
    
    const assignment = { 
      title, 
      instructions, 
      submissionTypes: submissionTypes || ['text'], 
      dueDate,
      materials: materials || []
    };
    
    console.log('📝 Assignment object before push:', JSON.stringify(assignment, null, 2));
    console.log('📝 Materials type:', typeof assignment.materials);
    console.log('📝 Materials is array:', Array.isArray(assignment.materials));
    console.log('📝 First material:', assignment.materials[0]);
    console.log('📝 First material type:', typeof assignment.materials[0]);
    
    course.assignments.push(assignment);
    
    console.log('💾 About to save course...');
    await course.save();
    console.log('✅ Course saved successfully');
    
    await notifyEnrolledUsers(
      courseId,
      `New assignment: "${title}"`,
      "assignment",
      dueDate,
      `/dashboard/assignments/${course.assignments.slice(-1)[0]._id}`
    );
    
    res.status(201).json({ message: "Assignment added and notifications sent", assignment: course.assignments.slice(-1)[0] });
  } catch (err) {
    console.error('❌ addAssignment error:', err);
    res.status(500).json({ message: "Failed to add assignment", error: err.message });
  }
};

export const updateAssignment = async (req, res) => {
  try {
    let { title, instructions, submissionTypes, dueDate, materials } = req.body;
    
    console.log('📦 Received update assignment request:', {
      materialsType: typeof materials,
      materialsIsArray: Array.isArray(materials),
      materialsLength: materials ? materials.length : 0,
      materialsRaw: JSON.stringify(materials, null, 2)
    });
    
    // Validate required fields
    if (!title && title !== '') {
      return res.status(400).json({ message: "Title is required" });
    }
    
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    
    const assignment = course.assignments.id(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    
    // Parse materials if they're strings
    if (Array.isArray(materials) && materials.length > 0 && typeof materials[0] === 'string') {
      console.log('⚠️ Materials are strings, parsing them...');
      materials = materials.map(m => {
        try {
          return typeof m === 'string' ? JSON.parse(m) : m;
        } catch (e) {
          console.error('Failed to parse material:', m);
          return null;
        }
      }).filter(m => m !== null);
      console.log('✅ Parsed materials:', JSON.stringify(materials, null, 2));
    }
    
    // Only update provided fields
    if (title !== undefined) assignment.title = title;
    if (instructions !== undefined) assignment.instructions = instructions;
    if (submissionTypes !== undefined) assignment.submissionTypes = submissionTypes;
    if (dueDate !== undefined) assignment.dueDate = dueDate;
    if (materials !== undefined) assignment.materials = materials;
    
    await course.save();
    
    await notifyEnrolledUsers(
      course._id,
      `Assignment updated: "${assignment.title}"`,
      "assignment",
      assignment.dueDate,
      `/dashboard/assignments/${assignment._id}`
    );
    
    res.json(assignment);
  } catch (err) {
    console.error('Update assignment error:', err);
    res.status(500).json({ message: "Failed to update assignment", error: err.message });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const assignment = course.assignments.id(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    const deletedTitle = assignment.title;

    // Use pull instead of .remove()
    course.assignments.pull({ _id: req.params.assignmentId });
    await course.save();

    await notifyEnrolledUsers(
      course._id,
      `Assignment deleted: "${deletedTitle}"`,
      "assignment",
      null,
      `/dashboard/assignments`
    );

    res.json({ message: "Assignment deleted" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete assignment",
      error: err.message,
    });
  }
};


/**
 * PROJECT
 */
export const getProject = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    
    if (!course.project) {
      return res.json(null);
    }
    
    // Parse materials if they're stored as strings (legacy data)
    let project = course.project.toObject();
    if (project.materials && Array.isArray(project.materials) && project.materials.length > 0) {
      if (typeof project.materials[0] === 'string') {
        console.log('⚠️ Project materials are strings, parsing them...');
        project.materials = project.materials.map(m => {
          try {
            return typeof m === 'string' ? JSON.parse(m) : m;
          } catch (e) {
            console.error('Failed to parse material:', m);
            return null;
          }
        }).filter(m => m !== null);
        console.log('✅ Parsed project materials');
      }
    }
    
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch project", error: err.message });
  }
};

export const createProject = async (req, res) => {
  console.log('🚀 POST /api/courses/:courseId/project - START');
  
  try {
    const { courseId } = req.params;
    let { title, instructions, submissionTypes, dueDate, materials } = req.body;
    
    console.log('📦 Received create project request:', {
      materialsType: typeof materials,
      materialsIsArray: Array.isArray(materials),
      materialsLength: materials ? materials.length : 0,
      materialsRaw: JSON.stringify(materials, null, 2)
    });

    // Ensure materials is an array of objects
    if (!Array.isArray(materials)) {
      materials = [];
    }
    
    // Parse materials if they're strings
    if (Array.isArray(materials) && materials.length > 0 && typeof materials[0] === 'string') {
      console.log('⚠️ Materials are strings, parsing them...');
      materials = materials.map(m => {
        try {
          return typeof m === 'string' ? JSON.parse(m) : m;
        } catch (e) {
          console.error('Failed to parse material:', m);
          return null;
        }
      }).filter(m => m !== null);
      console.log('✅ Parsed materials:', JSON.stringify(materials, null, 2));
    }

    const course = await Course.findById(courseId);
    if (!course) {
      console.log('❌ Course not found');
      return res.status(404).json({ message: "Course not found" });
    }
    
    // Create project with materials as objects
    course.project = { 
      title: title || '',
      instructions: instructions || '',
      submissionTypes: submissionTypes || ["file_upload"], 
      dueDate: dueDate || '',
      materials: materials
    };
    
    console.log('💾 Saving new project...');
    await course.save();
    
    console.log('✅ Project created successfully');
    
    res.status(201).json({ 
      message: "Project created successfully", 
      project: course.project.toObject()
    });
  } catch (err) {
    console.error('❌ createProject error:', err);
    res.status(500).json({ 
      message: "Failed to create project", 
      error: err.message 
    });
  }
  
  console.log('🏁 POST /api/courses/:courseId/project - END');
};

export const updateProject = async (req, res) => {
  console.log('🚀 PUT /api/courses/:courseId/project - START');
  
  try {
    const { courseId } = req.params;
    let { title, instructions, submissionTypes, dueDate, materials } = req.body;
    
    console.log('📦 Received update project request - RAW materials:', {
      materialsType: typeof materials,
      materialsIsArray: Array.isArray(materials),
      materialsLength: materials ? materials.length : 0,
      materialsRaw: JSON.stringify(materials, null, 2)
    });

    // Parse materials if they're strings
    if (Array.isArray(materials) && materials.length > 0 && typeof materials[0] === 'string') {
      console.log('⚠️ Materials are strings, parsing them...');
      materials = materials.map(m => {
        try {
          return typeof m === 'string' ? JSON.parse(m) : m;
        } catch (e) {
          console.error('Failed to parse material:', m);
          return null;
        }
      }).filter(m => m !== null);
      console.log('✅ Parsed materials:', JSON.stringify(materials, null, 2));
    } else if (!Array.isArray(materials)) {
      materials = undefined; // Don't update if not provided
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      console.log('❌ Course not found');
      return res.status(404).json({ message: "Course not found" });
    }
    
    // Check if project exists
    if (!course.project) {
      console.log('❌ Project not found in course');
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Update project fields
    if (title !== undefined) course.project.title = title;
    if (instructions !== undefined) course.project.instructions = instructions;
    if (submissionTypes !== undefined) course.project.submissionTypes = submissionTypes;
    if (dueDate !== undefined) course.project.dueDate = dueDate;
    if (materials !== undefined) course.project.materials = materials;
    
    console.log('💾 Saving updated course...');
    await course.save();
    
    console.log('✅ Project updated successfully');
    
    res.json(course.project);
  } catch (err) {
    console.error('❌ updateProject error:', err);
    res.status(500).json({ 
      message: "Failed to update project", 
      error: err.message 
    });
  }
  
  console.log('🏁 PUT /api/courses/:courseId/project - END');
};

export const deleteProject = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (!course.project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const deletedTitle = course.project.title;

    course.project = undefined;
    await course.save();

    await notifyEnrolledUsers(
      course._id,
      `Project deleted: "${deletedTitle}"`,
      "project",
      null,
      `/dashboard/courses/${course._id}`
    );

    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete project",
      error: err.message,
    });
  }
};


/**
 * Utility: notify all enrolled users using the working POST route
 */
const notifyEnrolledUsers = async (courseId, title, type, dueDate, link = null) => {
  console.log('🔔 notifyEnrolledUsers - START');
  try {
    console.log('📋 Finding enrollments...');
    const enrollments = await Enrollment.find({ course: courseId });
    console.log(`👥 Found ${enrollments.length} enrollments`);
    
    // Create notifications for all enrolled users using the working POST route
    for (const enrollment of enrollments) {
      try {
        const notificationTitle = dueDate 
          ? `${title} - Due by ${new Date(dueDate).toLocaleString()}` 
          : title;
        
        console.log(`📤 Creating notification for user ${enrollment.user}: ${notificationTitle}`);
        
        await callCreateNotification({
          userId: enrollment.user,
          title: notificationTitle,
          type,
          link: link || `/dashboard/courses/${courseId}`,
          dueDate: dueDate || undefined,
        });
        
        console.log(`✅ Successfully created notification for user ${enrollment.user}`);
      } catch (error) {
        console.error(`❌ Failed to create notification for user ${enrollment.user}:`, error.message);
        // Continue with other users even if one fails
      }
    }
    
    console.log(`🎉 Completed notifications for course ${courseId}`);
  } catch (error) {
    console.error("❌ Error in notifyEnrolledUsers:", error.message);
    // Don't throw here - we don't want to break the main operation
  }
};