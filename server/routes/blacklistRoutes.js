// routes/blacklistRoutes.js
import express from "express";
import {
  addToBlacklist,
  removeFromBlacklist,
  getBlacklistedUsers,
  checkBlacklistStatus,
  getBlacklistStats,
} from "../controllers/blacklistController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdminOnly } from "../middleware/isAdminOnly.js";
import { logAction } from "../middleware/logAction.js";

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(isAdminOnly);

// Blacklist management routes
router.post("/", logAction("add", "blacklist"), addToBlacklist);
router.delete("/:userId", logAction("remove", "blacklist"), removeFromBlacklist);
router.get("/", getBlacklistedUsers);
router.get("/check/:userId", checkBlacklistStatus);
router.get("/stats", getBlacklistStats);

export default router;
