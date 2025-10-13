// models/Submission.js - Updated schema
import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  sectionId: { type: mongoose.Schema.Types.ObjectId },
  moduleId: { type: mongoose.Schema.Types.ObjectId },
  assignmentId: { type: mongoose.Schema.Types.ObjectId },
  projectId: { type: mongoose.Schema.Types.ObjectId },

  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // ✅ ADD "quiz" TO THE ENUM
  submissionType: { 
    type: String, 
    enum: ["text", "file_upload", "link", "quiz"], // Added "quiz" here
    required: true 
  },

  submission: {
    text: { type: String },
    link: { type: String },
    file: {
      url: { type: String },
      public_id: { type: String },
      name: { type: String },
      type: { type: String },
      size: { type: Number },
      format: { type: String },
      resource_type: { type: String }
    },
    // ✅ ADD QUIZ-SPECIFIC FIELDS
    answers: { type: [String] },
    score: { type: Number },
    passed: { type: Boolean },
    proctoring: {
      flags: { type: [Object] },
      trustScore: { type: Number },
      data: { type: Object },
      requiresReview: { type: Boolean, default: false },
      status: { type: String, enum: ["clean", "flagged", "approved", "rejected"], default: "clean" },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reviewedAt: { type: Date },
      reviewNotes: { type: String }
    }
  },

  grade: Number,
  rubricScores: [{
    criterion: String,
    score: Number,
    maxScore: Number,
    comments: String
  }],
  resubmitRequired: { type: Boolean, default: false },
  resubmitDeadline: Date,
  feedback: String,
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  gradedAt: Date
}, { timestamps: true });

// Delete cached model if exists
if (mongoose.connection.models['Submission']) {
  delete mongoose.connection.models['Submission'];
}

export const Submission = mongoose.model("Submission", submissionSchema);