import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Blacklist from "../models/Blacklist.js";
import { logAccessAttempt } from "../controllers/blacklistController.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      // Check if user is blacklisted
      const blacklistEntry = await Blacklist.findOne({ userId: user._id });
      if (blacklistEntry) {
        // Log the access attempt
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get("user-agent");
        const attemptedRoute = req.originalUrl;

        await logAccessAttempt(user._id, ipAddress, userAgent, attemptedRoute);

        return res.status(403).json({
          message: "Access denied. Your account has been restricted.",
          isBlacklisted: true,
          reason: blacklistEntry.reason,
          blacklistedAt: blacklistEntry.blacklistedAt,
        });
      }

      req.user = user;
      next();
    } catch (err) {
      console.error("JWT verification failed:", err.message);
      return res.status(401).json({ message: "Not authorized, invalid or expired token" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }
};

// Add this to your auth middleware or use in routes
export const checkTicketAccess = (req, ticket) => {
  const isAdmin = req.user.id.toString() === process.env.ADMIN_ID || 
                 req.user.role === "admin-only" || 
                 req.user.role === "admin";
  
  const isOwner = ticket.createdBy.toString() === req.user._id.toString();
  
  return isAdmin || isOwner;
};
