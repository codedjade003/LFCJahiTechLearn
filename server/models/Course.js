// models/Course.js - FIXED SCHEMA
import mongoose from "mongoose";

/**
 * MODULE - IMPROVED with better ID tracking
 */
const moduleSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(), // Explicit ID generation
    required: true
  },
  type: {
    type: String,
    enum: ["video", "pdf", "quiz"],
    required: true,
  },
  title: { type: String, required: true },
  contentUrl: String,
  duration: String,

  quiz: {
    questions: [
      {
        question: String,
        options: [String],
        correctAnswer: String,
      },
    ],
    dueDate: Date
  },
}, { _id: true }); // Ensure _id is preserved

/**
 * SECTION - IMPROVED with better ID tracking
 */
const sectionSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
    required: true
  },
  title: { type: String, required: true },
  description: String,
  modules: [moduleSchema],
}, { _id: true });

/**
 * ASSIGNMENT - IMPROVED with better ID tracking
 */
const assignmentSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
    required: true
  },
  title: { type: String, required: true },
  instructions: String,
  materials: [
    {
      url: String,
      name: String,
      type: String,
    }
  ],
  submissionTypes: {
    type: [String],
    enum: ["text", "file_upload", "link"],
    default: ["text"]
  },
  dueDate: { type: Date, required: true },
}, { _id: true });

/**
 * COURSE - FIXED with proper subdocument IDs
 */
const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    categories: { type: [String], default: [] },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    tags: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    thumbnail: String,
    promoVideo: String,
    duration: String,
    estimatedDuration: {
      value: { type: Number },
      unit: { type: String, enum: ["days", "weeks", "months"] }
    },
    prerequisites: { type: [String], default: [] },
    objectives: { type: [String], default: [] },
    
    sections: [sectionSchema],
    assignments: [assignmentSchema],

    project: {
      title: String,
      instructions: String,
      materials: [
        {
          url: String,
          name: String,
          type: String,
        }
      ],
      submissionTypes: {
        type: [String],
        enum: ["text", "file_upload", "link"],
        default: ["file_upload"]
      },
      dueDate: Date,
    },

    instructor: {
      name: { type: String, default: "Unknown Instructor" },
      avatar: { type: String, default: "/default-avatar.png" }
    },

    instructors: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: String,
        role: { type: String, enum: ["main", "assistant"], default: "main" }
      }
    ],

    type: {
      type: String,
      enum: ["Video", "Audio", "Graphics", "Required", "Content Creation", "Utility", "Secretariat"],
      default: "Video"
    },
    isPublic: { type: Boolean, default: false },
    status: { 
      type: String, 
      enum: ['active', 'draft', 'archived'], // REMOVED 'deleted'
      default: 'active' 
    }
    // REMOVED: isDeleted, deletedAt, deletedBy
  },
  { timestamps: true }
);

// In your Course schema definition
courseSchema.virtual('allInstructors').get(function() {
  return [
    {
      userId: this.createdBy,
      name: this.instructor?.name || 'Course Creator', 
      role: 'main'
    },
    ...this.instructors
  ];
});

export const Course = mongoose.model("Course", courseSchema);
