import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["assignment", "video", "module", "course", "project"],
      default: "course",
    },
    target: {
      type: {
        type: String, // "course", "assignment", etc.
      },
      id: {
        type: mongoose.Schema.Types.ObjectId, // reference to resource
      },
    },
    time: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
