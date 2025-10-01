import express from "express";
import { getUserStats } from "../controllers/statsController.js";
import { protect } from "../middleware/authMiddleware.js"; // assuming you already have auth middleware
import { updateUserStreak } from "../controllers/authController.js";

const router = express.Router();

router.get("/me", protect, getUserStats);
router.post("/streak", protect, updateUserStreak);

export default router;
