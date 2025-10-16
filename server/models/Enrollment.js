// models/Enrollment.js - FIXED SCHEMA
import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    timeSpent: { type: Number, default: 0 },
    lastAccessed: { type: Date, default: Date.now },
    enrolledAt: { type: Date, default: Date.now },

    // FIXED: Better progress tracking with validation
    sectionProgress: [{
      sectionId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
      },
      completed: { type: Boolean, default: false },
      completedAt: Date,
      modulesCompleted: { type: Number, default: 0 },
      totalModules: { type: Number, default: 0 },
      feedback: String,
    }],

    moduleProgress: [{
      moduleId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
      },
      completed: { type: Boolean, default: false },
      completedAt: Date,
      timeSpent: Number,
      lastAccessed: Date,
      feedback: String,
    }],
    
    assignmentProgress: [{
      assignmentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
      },
      submitted: { type: Boolean, default: false },
      score: Number,
      submittedAt: Date,
      graded: { type: Boolean, default: false },
      feedback: String,
    }],
    
    projectProgress: {
      submitted: { type: Boolean, default: false },
      score: Number,
      submittedAt: Date,
      reviewed: { type: Boolean, default: false },
      feedback: String,
    },
    
    quizProgress: [{
      quizId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
      },
      score: Number,
      attempts: { type: Number, default: 0 },
      bestScore: Number,
      completedAt: Date,
      feedback: String,
    }],

  status: {
      type: String,
      enum: ['active', 'completed', 'cancelled', 'expired'],
      default: 'active'
    },
  cancelledAt: { type: Date },
  cancelledReason: { type: String }
},

  { timestamps: true }
);

// Only include active enrollments by default
enrollmentSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeCancelled) {
    this.where({ status: { $ne: 'cancelled' } });
  }
  next();
});

export default mongoose.model("Enrollment", enrollmentSchema);