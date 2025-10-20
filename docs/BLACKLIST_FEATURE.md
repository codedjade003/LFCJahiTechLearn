# Blacklist Feature Implementation

## Overview
A comprehensive blacklist system has been implemented to protect the platform from spam accounts and malicious users. Blacklisted users are blocked from logging in and accessing any protected routes while still being able to view public pages.

## Features

### 🔒 Security
- **Login Prevention**: Blacklisted users cannot log in to the platform
- **Route Protection**: All protected routes check blacklist status via middleware
- **Access Logging**: All access attempts by blacklisted users are logged with IP, timestamp, and attempted route
- **Admin Protection**: Admin and admin-only accounts cannot be blacklisted

### 📊 Admin Management
- **Blacklist Tab**: New tab in User Management for blacklist operations
- **Add to Blacklist**: Select user, provide reason and optional notes
- **Remove from Blacklist**: Restore user access with one click
- **View Statistics**: See total blacklisted users and recent access attempts
- **Access Attempt History**: View detailed logs of blacklisted user access attempts

### 🌐 User Experience
- **Clear Messaging**: Blacklisted users see clear error messages with reason
- **Public Access**: Landing page, signup, and footer pages remain accessible
- **Blacklisted Page**: Dedicated page explaining restriction with support contact option

## Technical Implementation

### Backend

#### 1. Database Model (`server/models/Blacklist.js`)
```javascript
{
  userId: ObjectId (ref: User, unique),
  email: String,
  reason: String (required),
  blacklistedBy: ObjectId (ref: User),
  blacklistedAt: Date,
  notes: String,
  accessAttempts: [{
    timestamp: Date,
    ipAddress: String,
    userAgent: String,
    attemptedRoute: String
  }]
}
```

#### 2. API Endpoints (`/api/blacklist`)
- `POST /` - Add user to blacklist (Admin only)
- `DELETE /:userId` - Remove user from blacklist (Admin only)
- `GET /` - Get all blacklisted users (Admin only)
- `GET /check/:userId` - Check if user is blacklisted (Admin only)
- `GET /stats` - Get blacklist statistics (Admin only)

#### 3. Middleware Protection
**Auth Middleware** (`server/middleware/authMiddleware.js`)
- Checks blacklist status on every protected route
- Logs access attempts
- Returns 403 with blacklist details

**Login Controller** (`server/controllers/authController.js`)
- Checks blacklist before allowing login
- Logs login attempts by blacklisted users
- Returns clear error message with reason

#### 4. Controller Functions (`server/controllers/blacklistController.js`)
- `addToBlacklist` - Create blacklist entry
- `removeFromBlacklist` - Delete blacklist entry
- `getBlacklistedUsers` - List all blacklisted users
- `checkBlacklistStatus` - Check single user status
- `logAccessAttempt` - Log unauthorized access attempts
- `getBlacklistStats` - Get statistics and recent activity

### Frontend

#### 1. Admin Interface (`lfc-learning/src/components/Admin/UsersTabs/BlacklistTab.tsx`)
Features:
- Search blacklisted users by name, email, or reason
- Add users to blacklist with reason and notes
- Remove users from blacklist
- View access attempt history
- Real-time statistics
- Responsive design with dark mode support

#### 2. Auth Context Updates (`lfc-learning/src/context/AuthContext.tsx`)
- Handles 403 blacklist responses
- Clears auth tokens
- Redirects to blacklisted page with reason

#### 3. Login Form Updates (`lfc-learning/src/components/LoginForm.tsx`)
- Displays blacklist error messages
- Prevents login for blacklisted users
- Shows clear reason for restriction

#### 4. Blacklisted Page (`lfc-learning/src/pages/BlacklistedPage.tsx`)
- Displays restriction message
- Shows blacklist reason
- Provides links to home and support
- Professional, user-friendly design

## Usage

### For Admins

#### Adding a User to Blacklist
1. Navigate to **Admin Dashboard** → **User Management** → **Blacklist** tab
2. Click **"Add to Blacklist"** button
3. Select the user from dropdown (only non-admin users shown)
4. Enter a clear reason (required)
5. Add optional notes for internal reference
6. Click **"Add to Blacklist"**

#### Removing a User from Blacklist
1. Navigate to **Blacklist** tab
2. Find the user in the list (use search if needed)
3. Click **"Remove"** button next to the user
4. Confirm the action

#### Viewing Access Attempts
1. In the **Blacklist** tab, find the user
2. Click **"Show X access attempts"** link
3. View detailed logs with timestamps, IPs, and attempted routes

### For Blacklisted Users

When a blacklisted user attempts to:
- **Log in**: Error message displayed with reason
- **Access protected route**: Redirected to home with error
- **Use existing session**: Session invalidated, redirected to blacklisted page

Blacklisted users CAN still access:
- Landing page (`/`)
- Signup page (`/signup`)
- About page (`/about`)
- Contact page (`/contact`)
- Privacy page (`/privacy`)
- Terms page (`/terms`)
- Certificate validation (`/validate/:code`)

## Security Considerations

### What's Protected
✅ All dashboard routes (student and admin)
✅ Profile and settings pages
✅ Course content and materials
✅ Assignments and projects
✅ API endpoints requiring authentication
✅ File uploads and downloads

### What's NOT Protected (By Design)
✅ Public landing page
✅ Signup/registration
✅ Footer pages (about, contact, privacy, terms)
✅ Certificate validation (public verification)

### Access Logging
All blacklisted user access attempts are logged with:
- Timestamp
- IP address
- User agent
- Attempted route

This helps admins:
- Monitor suspicious activity
- Identify patterns
- Gather evidence if needed
- Track persistent offenders

## API Response Examples

### Successful Blacklist
```json
{
  "message": "User successfully blacklisted",
  "blacklist": {
    "_id": "...",
    "userId": { "name": "John Doe", "email": "john@example.com" },
    "reason": "Spam account",
    "notes": "Multiple spam posts detected",
    "blacklistedBy": { "name": "Admin", "email": "admin@example.com" },
    "blacklistedAt": "2025-10-20T05:00:00.000Z"
  }
}
```

### Login Attempt by Blacklisted User
```json
{
  "message": "Access denied. Your account has been restricted.",
  "isBlacklisted": true,
  "reason": "Spam account",
  "blacklistedAt": "2025-10-20T05:00:00.000Z"
}
```

### Protected Route Access Attempt
```json
{
  "message": "Access denied. Your account has been restricted.",
  "isBlacklisted": true,
  "reason": "Spam account",
  "blacklistedAt": "2025-10-20T05:00:00.000Z"
}
```

## Testing Checklist

### Backend Tests
- [ ] Add user to blacklist
- [ ] Remove user from blacklist
- [ ] Prevent admin blacklisting
- [ ] Block blacklisted user login
- [ ] Block blacklisted user API access
- [ ] Log access attempts
- [ ] Get blacklist statistics
- [ ] Check duplicate blacklist prevention

### Frontend Tests
- [ ] Admin can view blacklist tab
- [ ] Admin can add users to blacklist
- [ ] Admin can remove users from blacklist
- [ ] Admin can view access attempts
- [ ] Search functionality works
- [ ] Blacklisted user sees error on login
- [ ] Blacklisted user redirected from protected routes
- [ ] Public pages remain accessible
- [ ] Dark mode styling works

### Integration Tests
- [ ] End-to-end blacklist flow
- [ ] Multiple concurrent blacklist operations
- [ ] Blacklist + delete user scenarios
- [ ] Session invalidation on blacklist
- [ ] Access attempt logging accuracy

## Files Modified/Created

### Backend
- ✅ `server/models/Blacklist.js` (new)
- ✅ `server/controllers/blacklistController.js` (new)
- ✅ `server/routes/blacklistRoutes.js` (new)
- ✅ `server/middleware/authMiddleware.js` (modified)
- ✅ `server/middleware/checkBlacklist.js` (new)
- ✅ `server/controllers/authController.js` (modified)
- ✅ `server/server.js` (modified)

### Frontend
- ✅ `lfc-learning/src/components/Admin/UsersTabs/BlacklistTab.tsx` (new)
- ✅ `lfc-learning/src/pages/Admin/Users.tsx` (modified)
- ✅ `lfc-learning/src/pages/BlacklistedPage.tsx` (new)
- ✅ `lfc-learning/src/context/AuthContext.tsx` (modified)
- ✅ `lfc-learning/src/components/LoginForm.tsx` (modified)
- ✅ `lfc-learning/src/App.tsx` (modified)

## Future Enhancements

### Potential Improvements
1. **Temporary Blacklists**: Add expiration dates for automatic removal
2. **Blacklist Reasons**: Predefined reason categories for consistency
3. **Email Notifications**: Notify users when blacklisted/removed
4. **IP Blacklisting**: Block by IP address in addition to user account
5. **Bulk Operations**: Blacklist multiple users at once
6. **Export Logs**: Download access attempt logs as CSV
7. **Appeal System**: Allow users to submit appeals
8. **Automated Detection**: AI-based spam detection with auto-blacklist
9. **Whitelist**: Trusted users exempt from certain restrictions
10. **Audit Trail**: Complete history of blacklist changes

## Support

For issues or questions about the blacklist feature:
1. Check this documentation
2. Review the code comments in implementation files
3. Check server logs for error details
4. Contact the development team

## Changelog

### Version 1.0.0 (2025-10-20)
- Initial implementation of blacklist feature
- Admin interface for blacklist management
- Login and route protection
- Access attempt logging
- Public page accessibility maintained
- Dark mode support
- Responsive design
