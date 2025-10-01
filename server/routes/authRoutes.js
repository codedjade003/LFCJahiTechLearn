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
  uploadProfilePicture,
  uploadCoverPhoto,
  removeProfilePicture,
  deleteAllStudents,
  resendVerification,
  checkUsernameAvailability,
} from "../controllers/authController.js";

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
router.post("/login", loginUser); // No logging for login
router.post("/verify-email", logAction('verify', 'email'), verifyEmail);
router.post("/resend-verification", logAction('resend', 'verification'), resendVerification);
router.post("/forgot-password", logAction('request', 'password_reset'), forgotPassword);
router.post("/reset-password", logAction('reset', 'password'), resetPassword);
//
// 🔹 Protected user routes
//
router.put("/change-password", protect, logAction('change', 'password'), changePassword);
router.get("/me", protect, getMe); // No logging for profile read
router.put("/update-profile", protect, updateProfile);
router.put("/onboard", protect, logAction('complete', 'onboarding'), completeOnboarding);
router.put("/seen-onboarding", protect, seeOnboarding); // No logging
router.get("/check-username", protect, checkUsernameAvailability); // Add this route

//
// 🔹 Profile Picture & Cover
//
router.put("/upload-profile-picture", 
  protect, 
  uploadProfilePicMiddleware.single("profilePicture"), 
  uploadProfilePicture
);

router.put("/upload-cover-photo", 
  protect, 
  uploadCoverPhotoMiddleware.single("coverPhoto"), 
  uploadCoverPhoto
);

router.delete("/remove-profile-picture", protect, removeProfilePicture);

//
// 🔹 Admin-only routes
//
router.post("/create-admin", protect, logAction('create', 'admin_account'), isAdminOnly, createAdminOnlyAccount);
router.get("/users", protect, getAllUsers); // No logging for user listing
router.delete("/users/:id", protect, logAction('delete', 'user'), isAdminOnly, deleteUser);
router.put("/reset-first-login", protect, logAction('reset', 'first_login'), isAdminOnly, resetAllFirstLogins);
router.put("/reset-first-login/:userId", protect, logAction('reset', 'first_login'), isAdminOnly, resetUserFirstLogin);
router.put("/reset-onboarding", protect, logAction('reset', 'onboarding'), isAdminOnly, resetOnboarding);
router.delete("/students", protect, logAction('delete', 'all_students'), isAdminOnly, deleteAllStudents);

export default router;
