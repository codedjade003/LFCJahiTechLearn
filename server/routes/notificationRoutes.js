// routes/notificationRoutes.js - SIMPLIFIED
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createManualNotification, // Renamed for clarity
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationFilters
} from "../controllers/notificationController.js";
import { isAdminOnly } from "../middleware/isAdminOnly.js";

const router = express.Router();

// 👇 Create MANUAL notification (admin custom messages only)
router.post("/manual", protect, isAdminOnly, createManualNotification);

// 👇 Get notifications with filters (uses log data)
router.get("/my", protect, getMyNotifications);

// 👇 Get available filters for notifications
router.get("/filters", protect, getNotificationFilters);

// 👇 Mark single notification as read
router.put("/:notificationId/read", protect, markAsRead);

// 👇 Mark all notifications as read
router.put("/my/read-all", protect, markAllAsRead);

// 👇 Delete a notification
router.delete("/:notificationId", protect, deleteNotification);

export default router;