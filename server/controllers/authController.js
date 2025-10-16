// backend/controllers/authController.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
// controllers/authControllers.js
import { cloudinary } from '../config/cloudinary.js';
import { updateUserStreakForUser } from "../utils/streakUtils.js";


const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();
const hashCode = (code) => crypto.createHash("sha256").update(code).digest("hex");


// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Add this controller function for username validation
export const checkUsernameAvailability = async (req, res) => {
  try {
    const { username } = req.query;
    
    if (!username) {
      return res.status(400).json({ 
        available: false, 
        message: 'Username is required' 
      });
    }

    // Check if username meets requirements
    if (username.length < 3) {
      return res.status(400).json({ 
        available: false, 
        message: 'Username must be at least 3 characters' 
      });
    }

    if (username.length > 20) {
      return res.status(400).json({ 
        available: false, 
        message: 'Username must be less than 20 characters' 
      });
    }

    // Allow only letters, numbers, and underscores
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ 
        available: false, 
        message: 'Username can only contain letters, numbers, and underscores' 
      });
    }

    // Check if username exists (excluding current user's username)
    const existingUser = await User.findOne({ 
      username: username.toLowerCase(),
      _id: { $ne: req.user.id } // Exclude current user using req.user.id from protect middleware
    });

    if (existingUser) {
      return res.json({ 
        available: false, 
        message: 'Username is already taken' 
      });
    }

    res.json({ 
      available: true, 
      message: 'Username is available' 
    });
  } catch (error) {
    console.error('Username check error:', error);
    res.status(500).json({ 
      available: false, 
      message: 'Error checking username availability' 
    });
  }
};

// Register new student or original admin
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (req.body.username) delete req.body.username;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters, include one uppercase letter, one number, and one special character",
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const code = generateVerificationCode();
    const hashedCode = hashCode(code);

    const user = await User.create({
      name,
      email,
      password,
      verificationCode: hashedCode,
      isVerified: false,
    });

    // Send verification email
    await sendEmail(
      email,
      "Your Verification Code",
      `Your verification code is: ${code}`
    );

    res.status(201).json({
      message: "Account created. Please check your email for the verification code.",
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUserStreak = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user with streak data
    const user = await User.findById(userId).select("streak lastLogin");
    
    // Calculate streak based on consecutive days with activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastLoginDate = user.streak.lastLogin ? new Date(user.streak.lastLogin) : null;
    
    if (lastLoginDate) {
      lastLoginDate.setHours(0, 0, 0, 0);
    }
    
    // Check if user logged in today already
    const alreadyLoggedInToday = lastLoginDate && lastLoginDate.getTime() === today.getTime();
    
    if (alreadyLoggedInToday) {
      return res.json({ 
        message: "Already logged in today", 
        streak: user.streak 
      });
    }
    
    // Calculate days since last login
    const oneDay = 24 * 60 * 60 * 1000;
    const daysSinceLastLogin = lastLoginDate 
      ? Math.floor((today - lastLoginDate) / oneDay)
      : Infinity;
    
    let currentStreak = user.streak?.current || 0;
    let longestStreak = user.streak?.longest || 0;
    
    
    // Update streak logic
    if (daysSinceLastLogin === 1) {
      currentStreak += 1;
    } else if (daysSinceLastLogin > 1) {
      currentStreak = 1;
    } else if (daysSinceLastLogin === Infinity) {
      currentStreak = 1;
    }
    
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
    
    // Update user's streak
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        streak: {
          current: currentStreak,
          longest: longestStreak,
          lastLogin: new Date()  // ✅ This is correct for your schema
        }
      },
      { new: true }
    ).select("streak");
        
    res.json({
      message: "Streak updated successfully",
      streak: updatedUser.streak
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login for all users
export const loginUser = async (req, res) => {
  const { email, username, password } = req.body;

  try {
    // Identify by email or username
    const user = email
      ? await User.findOne({ email })
      : await User.findOne({ username });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.isVerified && user.role !== "admin-only") {
      return res.status(403).json({
        message: "EMAIL_NOT_VERIFIED",
        email: user.email
      });
    }

    // Track login history
    user.loginHistory.unshift({
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Update login count and last login
    user.loginCount += 1;
    console.log(`📊 User ${user.email} login count: ${user.loginCount}`);
    user.lastLogin = new Date();

    // update streak (UTC-robust)
    const streak = await updateUserStreakForUser(user._id);

    // debug log (helpful to inspect timezone behavior)
    console.log('LOGIN DEBUG:', {
      email: user.email,
      loginCount: user.loginCount,
      lastLogin: user.lastLogin?.toISOString(),
      streakLastLogin: streak?.lastLogin?.toISOString(),
      streakCurrent: streak?.current
    });
    
    // Keep only last 50 logins
    if (user.loginHistory.length > 50) {
      user.loginHistory = user.loginHistory.slice(0, 50);
    }

    // Handle first login
    if (user.firstLogin) {
      user.firstLogin = false;
    }

    // ✅ FIX: ALWAYS save the user, regardless of firstLogin
    await user.save();  // ← This should be outside the if condition!
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      isVerified: user.isVerified,
      isOnboarded: user.isOnboarded,
      firstLogin: user.firstLogin,
      token: generateToken(user),
      streak,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Only the original admin can use this to create minimal admin-only accounts
export const createAdminOnlyAccount = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Use authenticated user ID from token
    const creator = await User.findById(req.user.id);

    if (!creator || creator.role !== "admin")
      return res.status(403).json({ message: "Not authorized" });

    const existing = await User.findOne({ username });
    if (existing)
      return res.status(400).json({ message: "Username already exists" });

    const user = await User.create({ username, password, role: "admin-only" });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Change password (for any authenticated user)
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    if (!passwordRegex.test(newPassword)) {
      return res
        .status(400)
        .json({ message: "New password does not meet requirements" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Fields required for "profile completion"
    const requiredFields = [
      "profilePicture",
      "name",
      "dateOfBirth",
      "phoneNumber",
      "maritalStatus",
    ];

    let completed = 0;
    requiredFields.forEach((field) => {
      if (user[field]) completed++;
    });

    const completionPercentage = Math.round(
      (completed / requiredFields.length) * 100
    );

    res.status(200).json({
      ...user.toObject(),
      profileCompletion: completionPercentage,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "admin-only") {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find().select("-password");

        // 👇 ADD THIS DEBUG LOGGING
    console.log('📊 Total users found:', users.length);
    if (users.length > 0) {
      console.log('📊 First user sample:', {
        _id: users[0]._id,
        email: users[0].email,
        loginCount: users[0].loginCount,
        lastLogin: users[0].lastLogin,
        streak: users[0].streak
      });
    }
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  const requestingUser = req.user; // from middleware
  const targetUserId = req.params._id;

  try {
    const userToDelete = await User.findById(targetUserId);
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent original admin from ever being deleted
    if (userToDelete.role === "admin") {
      return res.status(403).json({ message: "The original admin account cannot be deleted" });
    }

    // Allow users to delete their own account (except original admin already blocked above)
    if (requestingUser._id === targetUserId) {
      await User.findByIdAndDelete(targetUserId);
      return res.status(200).json({ message: "Your account has been deleted" });
    }

    // Allow admin or admin-only to delete other users (except admin already blocked above)
    if (
      requestingUser.role === "admin" ||
      requestingUser.role === "admin-only"
    ) {
      await User.findByIdAndDelete(targetUserId);
      return res.status(200).json({ message: "User deleted successfully" });
    }

    // All other cases — reject
    return res.status(403).json({ message: "Not authorized to delete this user" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  const userId = req.user.id;
  
  console.log("=== UPDATE PROFILE REQUEST ===");
  console.log("User ID:", userId);
  console.log("Request body:", JSON.stringify(req.body, null, 2));
  
  const {
    name,
    email,
    username,
    education,
    dateOfBirth,
    maritalStatus,
    phoneNumber,
    technicalUnit, // ✅ Now included in destructuring
    address,
    bio,
    occupation,
    company,
    skills,
    socialLinks,
    preferences
  } = req.body || {};

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log("Current user data:", {
      name: user.name,
      email: user.email,
      technicalUnit: user.technicalUnit,
      profilePicture: user.profilePicture
    });

    // 🔒 Prevent role or password update here
    if (user.role === "admin-only") {
      if (username) user.username = username;
    } else {
      if (name) user.name = name;
      if (email) user.email = email;
    }

    // ✅ Update optional profile fields (ADD technicalUnit HERE)
    if (username && user.role !== "admin-only") user.username = username; // allow username change for non-admin-only
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (maritalStatus) user.maritalStatus = maritalStatus;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (technicalUnit !== undefined) user.technicalUnit = technicalUnit; // ✅ ADD THIS LINE
    if (address) {
      if (typeof address === 'string') {
        // Backward compatibility for old address format
        user.address = { street: address };
      } else {
        user.address = address;
      }
    }
    if (bio) user.bio = bio;
    if (occupation) user.occupation = occupation;
    if (company) user.company = company;
    if (skills) user.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    if (socialLinks) user.socialLinks = { ...user.socialLinks, ...socialLinks };
      if (socialLinks.twitter && !socialLinks.x) {
          user.socialLinks.x = socialLinks.twitter;
        }
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    if (education) {
      user.education = education;
    }

    // ✅ Check if user has completed required onboarding fields
    const requiredFields = [
      user.name,
      user.dateOfBirth,
      user.phoneNumber,
      user.maritalStatus,
    ];

    user.isOnboarded = requiredFields.every((field) => field && field !== "");

    console.log("Saving user with updated data...");
    await user.save();
    
    console.log("User saved successfully");
    console.log("Updated user data:", {
      name: user.name,
      technicalUnit: user.technicalUnit,
      isOnboarded: user.isOnboarded
    });

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        isOnboarded: user.isOnboarded,
        profilePicture: user.profilePicture,
        dateOfBirth: user.dateOfBirth,
        maritalStatus: user.maritalStatus,
        phoneNumber: user.phoneNumber,
        technicalUnit: user.technicalUnit, // ✅ ALSO INCLUDE IN RESPONSE
        address: user.address,
        hasSeenOnboarding: user.hasSeenOnboarding,
        bio: user.bio,
        occupation: user.occupation,
        company: user.company,
        skills: user.skills,
        socialLinks: user.socialLinks,
        education: user.education,
        preferences: user.preferences
      },
    });
  } catch (err) {
    console.error("=== UPDATE PROFILE ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Profile picture upload
export const uploadProfilePicture = async (req, res) => {
  console.log("=== UPLOAD PROFILE PICTURE REQUEST ===");
  console.log("User ID:", req.user?.id);
  console.log("File received:", !!req.file);
  console.log("File details:", req.file ? {
    fieldname: req.file.fieldname,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  } : "No file");
  
  try {
    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      console.error("User not found:", userId);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log("Current profile picture:", user.profilePicture);

    // Delete old profile picture if exists
    if (user.profilePicture?.public_id) {
      try {
        await cloudinary.uploader.destroy(user.profilePicture.public_id);
      } catch (error) {
        console.error('Error deleting old profile picture:', error);
      }
    }

    // ✅ Correct fields from Cloudinary
    console.log("Cloudinary upload result:", {
      public_id: req.file.public_id,
      url: req.file.path
    });
    
    user.profilePicture = {
      public_id: req.file.public_id,
      url: req.file.path
    };

    await user.save();
    
    console.log("Profile picture saved successfully");

    res.json({
      message: 'Profile picture updated successfully',
      profilePicture: user.profilePicture
    });
  } catch (error) {
    console.error('=== PROFILE PICTURE UPLOAD ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Cover photo upload
export const uploadCoverPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (user.coverPhoto?.public_id) {
      try {
        await cloudinary.uploader.destroy(user.coverPhoto.public_id);
      } catch (error) {
        console.error('Error deleting old cover photo:', error);
      }
    }

    user.coverPhoto = {
      public_id: req.file.public_id,
      url: req.file.path
    };

    // ✅ Save cover position if provided
    if (req.body.coverPosition) {
      try {
        const position = JSON.parse(req.body.coverPosition);
        user.coverPhoto.position = {
          x: position.x || 50, // Default to center if not provided
          y: position.y || 50  // Default to center if not provided
        };
      } catch (error) {
        console.error('Error parsing cover position:', error);
        // Use default position if parsing fails
        user.coverPhoto.position = { x: 50, y: 50 };
      }
    } else {
      // Set default position if no position provided
      user.coverPhoto.position = { x: 50, y: 50 };
    }

    await user.save();

    res.json({
      message: 'Cover photo updated successfully',
      coverPhoto: user.coverPhoto
    });
  } catch (error) {
    console.error('Cover photo upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const removeProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user.profilePicture.public_id) {
      return res.status(400).json({ message: 'No profile picture to remove' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(user.profilePicture.public_id);

    // Remove from user document
    user.profilePicture = {
      public_id: '',
      url: ''
    };

    await user.save();

    res.json({
      message: 'Profile picture removed successfully',
      profilePicture: user.profilePicture
    });
  } catch (error) {
    console.error('Profile picture removal error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "Email and code are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Email already verified" });

    const hashedCode = hashCode(code);

    if (user.verificationCode !== hashedCode) {
      return res.status(400).json({ message: "Invalid verification code" });
    }
    if (user.verificationExpires && user.verificationExpires < Date.now()) {
      return res.status(400).json({ message: "Verification code expired" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();
    // Send welcome email
    await sendEmail(
      user.email,
      "Welcome to the Learning Platform!",
      `Hi ${user.name},\n\nWelcome aboard! Your email has been successfully verified.\n\nYou can now access your dashboard here:\nhttps://lfctechlearn.com/dashboard\n\nEnjoy learning! 🎉`
    );

    res.status(200).json({ message: "Email verified successfully. You may now log in." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const resendVerification = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });
  if (user.isVerified) return res.status(400).json({ message: "Email already verified" });

  // Generate fresh code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedCode = hashCode(code);

  user.verificationCode = hashedCode;
  user.verificationExpires = Date.now() + 15 * 60 * 1000; // 15 min
  await user.save();

  // Send the raw code to the user
  await sendEmail(user.email, "Verify Your Email", `Your code is: ${code}`);

  res.json({ message: "Verification code resent" });
};

// Request password reset (send code)
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check helper existence
    if (typeof hashCode !== "function") {
      console.error("❌ hashCode() not defined!");
      return res.status(500).json({ message: "Server configuration error." });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = hashCode(code);

    user.verificationCode = hashedCode;
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    try {
      await sendEmail(
        user.email,
        "Password Reset Request",
        `Hi ${user.name || "User"},\n\nUse this code to reset your password: ${code}\n\nIt will expire in 15 minutes.\n\nIf you didn't request this, ignore this email.`
      );

      return res
        .status(200)
        .json({ message: "Password reset code sent to your email" });
    } catch (mailError) {
      console.error("📧 Email send failed:", mailError.message);
      return res.status(500).json({
        message: "Error sending password reset email. Please try again later.",
      });
    }
  } catch (err) {
    console.error("💥 Forgot-password crashed:", err);
    return res.status(500).json({
      message: "Internal server error in password reset",
      error: process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
  }
};

// Reset password using code
export const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: "Email, code, and new password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // check expiry
    if (!user.passwordResetExpires || user.passwordResetExpires < Date.now()) {
      return res.status(400).json({ message: "Reset code expired" });
    }

    // check code
    const hashedCode = hashCode(code);
    if (user.verificationCode !== hashedCode) {
      return res.status(400).json({ message: "Invalid reset code" });
    }

    // update password + clear verificationCode + expiry
    user.password = newPassword;
    user.verificationCode = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    await sendEmail(
      user.email,
      "Password Reset Successful",
      `Hi ${user.name || "User"},\n\nYour password has been updated successfully.\n\nIf you didn't do this, please contact support immediately.`
    );

    res.status(200).json({ message: "Password reset successful. You may now log in." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const completeOnboarding = async (req, res) => {
  try {
    const { profilePicture, name, dateOfBirth, phoneNumber, maritalStatus } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update only the onboarding fields
    if (profilePicture) user.profilePicture = profilePicture;
    if (name) user.name = name;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (maritalStatus) user.maritalStatus = maritalStatus;

    await user.save();

    res.json({
      message: "Onboarding completed successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        dateOfBirth: user.dateOfBirth,
        phoneNumber: user.phoneNumber,
        maritalStatus: user.maritalStatus,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset firstLogin state for ALL users
export const resetAllFirstLogins = async (req, res) => {
  try {
    await User.updateMany({}, { $set: { firstLogin: true, isOnboarded: false } });
    res.json({ message: "All users' first login states have been reset." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reset for a single user (by ID)
export const resetUserFirstLogin = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { firstLogin: true, isOnboarded: false } },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User first login state reset.", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// routes/auth.ts (or similar)
export const seeOnboarding = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { hasSeenOnboarding: true },
      { new: true }
    ).select("-password");

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const resetOnboarding = async (req, res) => {
  try {
    await User.updateMany({}, { hasSeenOnboarding: false });
    res.json({ success: true, message: "Onboarding reset for all users" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete all students (keeps admins intact)
export const deleteAllStudents = async (req, res) => {
  try {
    const result = await User.deleteMany({ role: "student" });
    res.json({ message: "All students deleted", deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: "Error deleting students", error: err.message });
  }
};
