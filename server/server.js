// backend/server.js
import path from "path";
import { fileURLToPath } from "url";

// Recreate __filename and __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from "express";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import cors from "cors";

import "./jobs/keepAlive.js";


// Route imports
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import userManagementRoutes from './routes/userManagementRoutes.js';
import logsRoutes from './routes/logsRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import uploadRoutes from "./routes/uploadRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"
import proctoringRoutes from './routes/proctoringRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import nukeRoutes from './routes/nuke.js';
import feedbackRoutes from './routes/feedbackRoutes.js';

// Import dueDateNotifier only if it exists and is needed
try {
  await import("./jobs/dueDateNotifier.js");
  console.log('✅ Due date notifier loaded');
} catch (error) {
  console.log('⚠️ Due date notifier not found, continuing without it');
}

const app = express();

// ✅ Robust CORS configuration for production + dev
const allowedOrigins = [
  process.env.CLIENT_URL,          // your Vercel frontend
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean); // remove undefined/null values

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`🚫 Blocked by CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
  })
);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});


// ✅ Explicitly handle preflight
app.options(/.*/, cors());


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 🔎 Global request logger (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`➡️ ${req.method} ${req.originalUrl}`);
    next();
  });
}

app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});


// Base route
app.get("/", (req, res) => {
  res.json({ 
    message: "TechLearn API is running...",
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    timestamp: new Date().toISOString()
  });
});

// API Routes - with error handling
app.use("/api/stats", statsRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/uploads", uploadRoutes); // Unified upload route - USE THIS ONLY
app.use('/api/users', userManagementRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/submissions', submissionRoutes);
// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/uploads/submissions', express.static(path.join(__dirname, 'uploads/submissions')));
app.use('/api/proctoring', proctoringRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api', nukeRoutes);

// Serve static files in production (for Vite build)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  // Handle SPA routing - serve index.html for all unknown routes
  // ✅ Express 5-safe wildcard
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// 404 handler for API routes
// ✅ Compatible with Express 5
app.use(/^\/api(\/|$)/, (req, res) => {
  res.status(404).json({ 
    message: `API endpoint ${req.method} ${req.originalUrl} not found` 
  });
});


// Global error handler
app.use((err, req, res, next) => {
  console.error('🚨 Error:', err.stack);
  res.status(500).json({ 
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message 
  });
});

// MongoDB connection with better error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: process.env.DB_NAME || "techlearn",
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

// Start server
const startServer = async () => {
  await connectDB();
  
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`📍 ${process.env.CLIENT_URL || `https://localhost:${PORT}`}`);
  });

  // Handle server errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
    } else {
      console.error('❌ Server error:', error);
    }
    process.exit(1);
  });
};

startServer();