// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: function () {
        return this.role === "student" || this.role === "admin";
      },
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      required: function () {
        return this.role === "student" || this.role === "admin";
      },
    },
    username: {
      type: String,
      required: function () {
        return this.role === "admin-only";
      },
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "admin", "admin-only"],
      default: "student",
    },
    isVerified: { type: Boolean, default: false },
    verificationCode: String,
    verificationExpires: Date,
    passwordResetExpires: Date,

    // First-time & onboarding flags
    firstLogin: { type: Boolean, default: true },
    isOnboarded: { type: Boolean, default: false },
    hasSeenOnboarding: { type: Boolean, default: false },
    
    // Onboarding progress tracking (per feature/page)
    onboardingProgress: {
      dashboard: { type: Boolean, default: false },
      courses: { type: Boolean, default: false },
      courseDetails: { type: Boolean, default: false },
      profile: { type: Boolean, default: false },
      assessments: { type: Boolean, default: false },
      adminDashboard: { type: Boolean, default: false },
      courseManagement: { type: Boolean, default: false },
      userManagement: { type: Boolean, default: false },
      assessmentGrading: { type: Boolean, default: false },
    },

    // User preferences
    preferences: {
      theme: { type: String, enum: ["light", "dark"], default: "light" },
      onboardingEnabled: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
    },

    // Profile
    profilePicture: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },
    coverPhoto: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
      // ✅ ADD COVER POSITION FIELD
      position: {
        x: { type: Number, default: 50 }, // Default center position (50%)
        y: { type: Number, default: 50 }  // Default center position (50%)
      }
    },
    dateOfBirth: Date,
    maritalStatus: {
      type: String,
      enum: ["single", "married", "divorced", "widowed"],
    },
    phoneNumber: String,
    technicalUnit: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    bio: { type: String, maxlength: 500 },
    occupation: String,
    company: String,
    education: [
      {
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startYear: Number,
        endYear: Number,
        current: Boolean,
      },
    ],
    skills: [String],
    socialLinks: {
      website: String,
      github: String,
      linkedin: String,
      twitter: String,
      x: String,
      instagram: String,
      facebook: String,
    },

    // Preferences
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      theme: { type: String, enum: ["light", "dark", "auto"], default: "auto" },
      language: { type: String, default: "en" },
    },

    // Tracking
    lastLogin: Date,
    loginCount: { type: Number, default: 0 },
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastLogin: Date,
    },

    loginHistory: [{
      timestamp: { type: Date, default: Date.now },
      ipAddress: String,
      userAgent: String
    }],

    // Security
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String,
  },
  { timestamps: true }
);

// ✅ Unique indexes
userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $exists: true } } }
);

userSchema.index(
  { username: 1 },
  { unique: true, partialFilterExpression: { username: { $type: "string" } } }
);

// ✅ Pre-save hooks
userSchema.pre("save", function (next) {
  if (this.role === "admin-only") {
    this.isVerified = true;
    if (!this.email) {
      this.email = `helper_${this._id}@system.local`;
    }
  }
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Methods
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.twoFactorSecret;
  delete user.verificationCode;
  delete user.passwordResetExpires;
  return user;
};

const User = mongoose.model("User", userSchema);
export default User;
