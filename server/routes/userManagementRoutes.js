import express from 'express';
import multer from 'multer';
import path from 'path';
import * as XLSX from 'xlsx';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { isSuperAdmin } from '../middleware/isSuperAdmin.js';
import { logAction } from '../middleware/logAction.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Bulk user creation endpoint
router.post('/bulk', protect, logAction('bulk_create', 'users'), upload.single('file'), async (req, res) => {
  try {
    const { users: usersJson } = req.body;
    let usersToCreate = [];

    if (req.file) {
      // Process file upload
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      usersToCreate = XLSX.utils.sheet_to_json(worksheet);
    } else if (usersJson) {
      // Process JSON array
      usersToCreate = JSON.parse(usersJson);
    } else {
      return res.status(400).json({ 
        message: 'Either file or users JSON array is required' 
      });
    }

    const results = {
      successful: [],
      failed: []
    };

    // Process each user
    for (const userData of usersToCreate) {
      try {
        // Validate required fields
        if (!userData.email || !userData.password) {
          throw new Error('Email and password are required');
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
          $or: [
            { email: userData.email.toLowerCase() },
            { username: userData.username }
          ] 
        });

        if (existingUser) {
          throw new Error('User already exists');
        }

        // Create new user
        const user = await User.create({
          name: userData.name,
          email: userData.email.toLowerCase(),
          password: userData.password,
          username: userData.username,
          role: userData.role || 'student',
          dateOfBirth: userData.dateOfBirth,
          maritalStatus: userData.maritalStatus,
          phoneNumber: userData.phoneNumber,
          address: userData.address,
          bio: userData.bio,
          occupation: userData.occupation,
          company: userData.company,
          skills: Array.isArray(userData.skills) ? userData.skills : userData.skills?.split(','),
          socialLinks: userData.socialLinks,
          preferences: userData.preferences,
          isVerified: userData.isVerified !== undefined ? userData.isVerified : true,
          firstLogin: userData.firstLogin !== undefined ? userData.firstLogin : true
        });

        results.successful.push({
          email: user.email,
          id: user._id,
          message: 'User created successfully'
        });

      } catch (error) {
        results.failed.push({
          email: userData.email,
          error: error.message
        });
      }
    }

    res.status(200).json({
      message: `Processed ${usersToCreate.length} users`,
      results
    });

  } catch (error) {
    console.error('Bulk user creation error:', error);
    res.status(500).json({ 
      message: 'Server error during bulk user creation',
      error: error.message 
    });
  }
});

// Quick update endpoint for inline edits
router.patch('/:id/quick', protect, logAction('quick_update', 'user'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove restricted fields
    delete updates.password;
    delete updates.role;
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;

    const user = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user
    });

  } catch (error) {
    console.error('Quick update error:', error);
    res.status(500).json({ 
      message: 'Error updating user',
      error: error.message 
    });
  }
});

// Role modification endpoint (superadmin only)
router.patch('/:id/role', protect, logAction('change_role', 'user'), isSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'admin', 'admin-only'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying superadmin role
    if (user.email === 'codedjade003@gmail.com') {
      return res.status(403).json({ message: 'Cannot modify superadmin role' });
    }

    // Use findByIdAndUpdate to avoid full validation
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: false } // Skip validators for role change
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found after update' });
    }

    res.json({
      message: 'Role updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Role update error:', error);
    res.status(500).json({ 
      message: 'Error updating role',
      error: error.message 
    });
  }
});

// User activity logs endpoint
router.get('/activity', protect, async (req, res) => {
  try {
    const users = await User.find()
      .select('email name role lastLogin loginCount streak loginHistory')
      .sort({ lastLogin: -1 });

    const activityLogs = users.map(user => ({
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      lastLogin: user.lastLogin,
      loginCount: user.loginCount,
      currentStreak: user.streak?.current || 0,
      longestStreak: user.streak?.longest || 0,
      loginHistory: user.loginHistory || []
    }));

    res.json(activityLogs);

  } catch (error) {
    console.error('Activity logs error:', error);
    res.status(500).json({ 
      message: 'Error fetching activity logs',
      error: error.message 
    });
  }
});

// Add this to your backend routes
router.post('/register-admin', protect, logAction('register', 'admin'), isSuperAdmin, async (req, res) => {
  try {
    const { username } = req.body;
    
    // Generate random password
    const password = Math.random().toString(36).slice(-10);
    
    const adminUser = await User.create({
      username,
      password,
      role: 'admin-only',
      isVerified: true,
      name: `Admin Helper - ${username}`,
      email: `${username}@admin.lfc.com` // or generate proper email
    });

    res.json({
      message: 'Admin helper created successfully',
      username: adminUser.username,
      password: password, // Send back the readable password
      role: adminUser.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin helper', error: error.message });
  }
});


export default router;