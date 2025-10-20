// controllers/blacklistController.js
import Blacklist from "../models/Blacklist.js";
import User from "../models/User.js";

// Add user to blacklist
export const addToBlacklist = async (req, res) => {
  try {
    const { userId, reason, notes } = req.body;

    if (!userId || !reason) {
      return res.status(400).json({ 
        message: "User ID and reason are required" 
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent blacklisting admins
    if (user.role === "admin" || user.role === "admin-only") {
      return res.status(403).json({ 
        message: "Cannot blacklist admin users" 
      });
    }

    // Check if already blacklisted
    const existingBlacklist = await Blacklist.findOne({ userId });
    if (existingBlacklist) {
      return res.status(400).json({ 
        message: "User is already blacklisted" 
      });
    }

    // Create blacklist entry
    const blacklistEntry = await Blacklist.create({
      userId,
      email: user.email,
      reason,
      notes,
      blacklistedBy: req.user._id,
    });

    await blacklistEntry.populate("userId", "name email role");
    await blacklistEntry.populate("blacklistedBy", "name email");

    res.status(201).json({
      message: "User successfully blacklisted",
      blacklist: blacklistEntry,
    });
  } catch (error) {
    console.error("Error adding to blacklist:", error);
    res.status(500).json({ 
      message: "Failed to blacklist user", 
      error: error.message 
    });
  }
};

// Remove user from blacklist
export const removeFromBlacklist = async (req, res) => {
  try {
    const { userId } = req.params;

    const blacklistEntry = await Blacklist.findOneAndDelete({ userId });

    if (!blacklistEntry) {
      return res.status(404).json({ 
        message: "User not found in blacklist" 
      });
    }

    res.json({
      message: "User successfully removed from blacklist",
      userId: blacklistEntry.userId,
    });
  } catch (error) {
    console.error("Error removing from blacklist:", error);
    res.status(500).json({ 
      message: "Failed to remove user from blacklist", 
      error: error.message 
    });
  }
};

// Get all blacklisted users
export const getBlacklistedUsers = async (req, res) => {
  try {
    const blacklistedUsers = await Blacklist.find()
      .populate("userId", "name email role profilePicture")
      .populate("blacklistedBy", "name email")
      .sort({ blacklistedAt: -1 });

    res.json({
      count: blacklistedUsers.length,
      blacklistedUsers,
    });
  } catch (error) {
    console.error("Error fetching blacklisted users:", error);
    res.status(500).json({ 
      message: "Failed to fetch blacklisted users", 
      error: error.message 
    });
  }
};

// Check if user is blacklisted
export const checkBlacklistStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const blacklistEntry = await Blacklist.findOne({ userId });

    res.json({
      isBlacklisted: !!blacklistEntry,
      blacklist: blacklistEntry || null,
    });
  } catch (error) {
    console.error("Error checking blacklist status:", error);
    res.status(500).json({ 
      message: "Failed to check blacklist status", 
      error: error.message 
    });
  }
};

// Log access attempt by blacklisted user
export const logAccessAttempt = async (userId, ipAddress, userAgent, attemptedRoute) => {
  try {
    await Blacklist.findOneAndUpdate(
      { userId },
      {
        $push: {
          accessAttempts: {
            timestamp: new Date(),
            ipAddress,
            userAgent,
            attemptedRoute,
          },
        },
      }
    );
  } catch (error) {
    console.error("Error logging access attempt:", error);
  }
};

// Get blacklist statistics
export const getBlacklistStats = async (req, res) => {
  try {
    const totalBlacklisted = await Blacklist.countDocuments();
    const recentBlacklists = await Blacklist.find()
      .sort({ blacklistedAt: -1 })
      .limit(5)
      .populate("userId", "name email")
      .populate("blacklistedBy", "name");

    // Count access attempts in last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAttempts = await Blacklist.aggregate([
      { $unwind: "$accessAttempts" },
      { $match: { "accessAttempts.timestamp": { $gte: yesterday } } },
      { $count: "total" },
    ]);

    res.json({
      totalBlacklisted,
      recentBlacklists,
      recentAccessAttempts: recentAttempts[0]?.total || 0,
    });
  } catch (error) {
    console.error("Error fetching blacklist stats:", error);
    res.status(500).json({ 
      message: "Failed to fetch blacklist statistics", 
      error: error.message 
    });
  }
};
