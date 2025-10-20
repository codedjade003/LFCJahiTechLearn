import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    course: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Course", 
      required: true 
    },
    enrollment: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Enrollment", 
      required: true 
    },
    
    certificateId: { 
      type: String, 
      required: true, 
      unique: true,
      index: true
    },
    
    validationCode: { 
      type: String, 
      required: true, 
      unique: true,
      index: true
    },
    
    issuedAt: { 
      type: Date, 
      default: Date.now 
    },
    
    completionDate: { 
      type: Date, 
      required: true 
    },
    
    finalScore: { 
      type: Number, 
      min: 0, 
      max: 100 
    },
    
    studentName: { 
      type: String, 
      required: true 
    },
    
    courseTitle: { 
      type: String, 
      required: true 
    },
    
    instructorName: { 
      type: String 
    },
    
    status: {
      type: String,
      enum: ['valid', 'revoked', 'expired'],
      default: 'valid'
    },
    
    revokedAt: Date,
    revokedReason: String,
    
    metadata: {
      courseDuration: String,
      courseLevel: String,
      totalModules: Number,
      completedModules: Number,
    }
  },
  { timestamps: true }
);

// Generate unique certificate ID
certificateSchema.statics.generateCertificateId = function() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `LFC-${timestamp}-${random}`;
};

// Generate validation code
certificateSchema.statics.generateValidationCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export default mongoose.model("Certificate", certificateSchema);
