// backend/routes/authRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  createAdminOnlyAccount,
  changePassword,
  getMe,
  getAllUsers,
  deleteUser,
  updateProfile,
  verifyEmail,
  forgotPassword,
  resetPassword,
  completeOnboarding,
  resetAllFirstLogins,
  resetUserFirstLogin,
  seeOnboarding,
  resetOnboarding,
  uploadProfilePicture,  // This is a CONTROLLER function
  uploadCoverPhoto,      // This is a CONTROLLER function
  removeProfilePicture,
  deleteAllStudents,
  resendVerification,
  checkUsernameAvailability,
} from "../controllers/authController.js";

// CORRECT: Import the middleware functions (not the controller functions)
import { 
  uploadProfilePicture as uploadProfilePicMiddleware, 
  uploadCoverPhoto as uploadCoverPhotoMiddleware 
} from "../middleware/upload.js";

import { protect } from "../middleware/authMiddleware.js";
import { isAdminOnly } from "../middleware/isAdminOnly.js";
import { logAction } from "../middleware/logAction.js";

const router = express.Router();

//
// 🔹 Public routes
//
router.post("/register", logAction('register', 'user'), registerUser);
router.post("/login", loginUser);
router.post("/verify-email", logAction('verify', 'email'), verifyEmail);
router.post("/resend-verification", logAction('resend', 'verification'), resendVerification);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", logAction('reset', 'password'), resetPassword);

//
// 🔹 Protected user routes
//
router.put("/change-password", protect, logAction('change', 'password'), changePassword);
router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);
router.put("/onboard", protect, logAction('complete', 'onboarding'), completeOnboarding);
router.put("/seen-onboarding", protect, seeOnboarding);
router.get("/check-username", protect, checkUsernameAvailability);

//
// 🔹 Profile Picture & Cover - FIXED
//
// Profile picture upload - USE THE MIDDLEWARE FUNCTIONS
router.put('/profile-picture', 
  protect, // Add protect middleware
  (req, res, next) => {
    req.params = { type: 'profile' };
    next();
  }, 
  uploadProfilePicMiddleware.single('image'), // Use the middleware, not controller
  uploadProfilePicture // This is the controller function that handles the response
);

// Cover photo upload - USE THE MIDDLEWARE FUNCTIONS  
router.put('/cover-photo', 
  protect, // Add protect middleware
  (req, res, next) => {
    req.params = { type: 'cover' };
    next();
  }, 
  uploadCoverPhotoMiddleware.single('image'), // Use the middleware, not controller
  uploadCoverPhoto // This is the controller function that handles the response
);

router.delete("/remove-profile-picture", protect, removeProfilePicture);

//
// 🔹 Admin-only routes
//
router.post("/create-admin", protect, logAction('create', 'admin_account'), isAdminOnly, createAdminOnlyAccount);
router.get("/users", protect, getAllUsers);
router.delete("/users/:id", protect, logAction('delete', 'user'), isAdminOnly, deleteUser);
router.put("/reset-first-login", protect, logAction('reset', 'first_login'), isAdminOnly, resetAllFirstLogins);
router.put("/reset-first-login/:userId", protect, logAction('reset', 'first_login'), isAdminOnly, resetUserFirstLogin);
router.put("/reset-onboarding", protect, logAction('reset', 'onboarding'), isAdminOnly, resetOnboarding);
router.delete("/students", protect, logAction('delete', 'all_students'), isAdminOnly, deleteAllStudents);

export default router;