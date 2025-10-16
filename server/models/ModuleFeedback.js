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
  difficulty: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  clarity: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  usefulness: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  feedback: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
moduleFeedbackSchema.index({ courseId: 1, moduleId: 1 });
moduleFeedbackSchema.index({ studentId: 1 });

export const ModuleFeedback = mongoose.model('ModuleFeedback', moduleFeedbackSchema);
