// routes/logsRoutes.js
import express from 'express';
import { isAdminOnly } from '../middleware/isAdminOnly.js';
import { protect } from '../middleware/authMiddleware.js';
import Log from '../models/Log.js';

const router = express.Router();

// Get all logs from the dedicated Log collection
router.get('/', protect, isAdminOnly, async (req, res) => {
  try {
    const logs = await Log.find()
      .sort({ timestamp: -1 }) // Newest first
      .limit(1000); // Limit results
    
    res.json(logs);
  } catch (error) {
    console.error('Logs fetch error:', error);
    res.status(500).json({ 
      message: 'Error fetching logs', 
      error: error.message 
    });
  }
});

// Real-time logging endpoint for future actions
router.post('/', protect, async (req, res) => {
  try {
    const { action, resource, details, resourceId, status = 'success' } = req.body;
    
    const logEntry = await Log.create({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      action,
      resource,
      details,
      resourceId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      status
    });

    res.json({ message: 'Action logged', log: logEntry });
  } catch (error) {
    res.status(500).json({ message: 'Error logging action', error: error.message });
  }
});


export default router;