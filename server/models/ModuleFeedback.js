import mongoose from 'mongoose';

const moduleFeedbackSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moduleTitle: {
    type: String,
    default: ''
  },
  responses: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 5
  },
  clarity: {
    type: Number,
    min: 1,
    max: 5
  },
  usefulness: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    default: ''
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
moduleFeedbackSchema.index({ courseId: 1, moduleId: 1 });
moduleFeedbackSchema.index({ studentId: 1 });

export const ModuleFeedback = mongoose.model('ModuleFeedback', moduleFeedbackSchema);
