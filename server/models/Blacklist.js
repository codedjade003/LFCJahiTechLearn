// models/Blacklist.js
import mongoose from "mongoose";

const blacklistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    blacklistedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blacklistedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
    // Track if user attempted to access after blacklist
    accessAttempts: [
      {
        timestamp: { type: Date, default: Date.now },
        ipAddress: String,
        userAgent: String,
        attemptedRoute: String,
      },
    ],
  },
  { timestamps: true }
);

// Index for fast lookups
blacklistSchema.index({ userId: 1 });
blacklistSchema.index({ email: 1 });

const Blacklist = mongoose.model("Blacklist", blacklistSchema);
export default Blacklist;
