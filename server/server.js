// backend/server.js
import path from "path";
import { fileURLToPath } from "url";

// Recreate __filename and __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

// Route imports
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import userManagementRoutes from './routes/userManagementRoutes.js';
import logsRoutes from './routes/logsRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js'; // probably missing
import uploadRoutes from "./routes/uploadRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"


import "./jobs/dueDateNotifier.js"; // 👈 just import, it runs automatically

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 🔎 Global request logger (must come before routes)
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.originalUrl}`);
  next();
});

// 🚨 ADD THIS DEBUG MIDDLEWARE:
app.use((req, res, next) => {
  console.log('✅ Reached after global logger');
  next();
});

// Base route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// 👇 Stats routes
app.use("/api/stats", (req, res, next) => {
  console.log('📊 Checking stats routes...');
  next();
}, statsRoutes);

// 👇 Auth routes
app.use("/api/auth", (req, res, next) => {
  console.log('🔐 Checking auth routes...');
  next();
}, authRoutes);

app.use('/api/admin', adminRoutes);

// 👇 Logs routes
app.use("/api/logs", (req, res, next) => {
  console.log('📝 Checking logs routes...');
  next();
}, logsRoutes);

// 👇 Course routes - THIS IS WHERE IT FREEZES
app.use("/api/courses", (req, res, next) => {
  console.log('🎓 Reached course routes middleware');
  next();
}, courseRoutes);

// 👇 Enrollment routes
app.use("/api/enrollments", (req, res, next) => {
  console.log('👥 Checking enrollment routes...');
  next();
}, enrollmentRoutes);

// 👇 Notification routes
app.use("/api/notifications", (req, res, next) => {
  console.log('🔔 Checking notification routes...');
  next();
}, notificationRoutes);

// 👇 file upload routes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/uploads", uploadRoutes);

// In server.js, add this with your other static file serving
app.use('/uploads/submissions', express.static(path.join(__dirname, 'uploads/submissions')));

// Add after other route imports
app.use('/api/users', (req, res, next) => {
  console.log('👤 Checking user management routes...');
  next();
}, userManagementRoutes);

// 👇 Progress routes
app.use('/api/progress', (req, res, next) => {
  console.log('📈 Checking progress routes...');
  next();
}, progressRoutes);

// Add this with your other route middleware (after progressRoutes)
app.use('/api/submissions', (req, res, next) => {
  console.log('📝 Checking submission routes...');
  next();
}, submissionRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "techlearn", // name your DB here
  })
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });