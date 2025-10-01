// services/notificationService.js
import Notification from "../models/Notification.js";

const allowedTypes = ["course", "section", "module", "assignment", "project", "quiz"];

export const createNotificationForUser = async ({ userId, title, type, link, dueDate }) => {
  if (!userId || !title) throw new Error("User and title are required");
  if (!allowedTypes.includes(type)) throw new Error(`Invalid notification type: ${type}`);

  const notification = new Notification({
    user: userId,
    title,
    type,
    link,
    dueDate,
  });

  console.log("📝 Creating notification:", notification);
  return await notification.save();
};
