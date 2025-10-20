// middleware/checkBlacklist.js
import Blacklist from "../models/Blacklist.js";
import { logAccessAttempt } from "../controllers/blacklistController.js";

export const checkBlacklist = async (req, res, next) => {
  try {
    // Skip check if no user is authenticated
    if (!req.user) {
      return next();
    }

    // Check if user is blacklisted
    const blacklistEntry = await Blacklist.findOne({ userId: req.user._id });

    if (blacklistEntry) {
      // Log the access attempt
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get("user-agent");
      const attemptedRoute = req.originalUrl;

      await logAccessAttempt(
        req.user._id,
        ipAddress,
        userAgent,
        attemptedRoute
      );

      return res.status(403).json({
        message: "Access denied. Your account has been restricted.",
        isBlacklisted: true,
        reason: blacklistEntry.reason,
        blacklistedAt: blacklistEntry.blacklistedAt,
      });
    }

    next();
  } catch (error) {
    console.error("Error checking blacklist:", error);
    // Don't block request on middleware error
    next();
  }
};
