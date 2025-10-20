# Blacklist System Flow Diagram

## 🔄 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     BLACKLIST SYSTEM                             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │ ◄────► │   Backend    │ ◄────► │   Database   │
│   (React)    │         │   (Express)  │         │  (MongoDB)   │
└──────────────┘         └──────────────┘         └──────────────┘
```

## 📋 Admin Blacklist Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN ADDS USER TO BLACKLIST                  │
└─────────────────────────────────────────────────────────────────┘

1. Admin Action
   │
   ├─► Admin navigates to User Management → Blacklist Tab
   │
   ├─► Clicks "Add to Blacklist"
   │
   ├─► Selects user from dropdown
   │
   ├─► Enters reason (required)
   │
   ├─► Adds notes (optional)
   │
   └─► Clicks "Add to Blacklist"

2. Frontend Request
   │
   └─► POST /api/blacklist
       {
         userId: "...",
         reason: "Spam account",
         notes: "Multiple violations"
       }

3. Backend Processing
   │
   ├─► Verify admin authentication
   │
   ├─► Check if user exists
   │
   ├─► Prevent admin blacklisting
   │
   ├─► Check for duplicate blacklist
   │
   ├─► Create blacklist entry
   │
   └─► Return success response

4. Database Update
   │
   └─► Insert into Blacklist collection
       {
         userId: ObjectId,
         email: "user@example.com",
         reason: "Spam account",
         notes: "Multiple violations",
         blacklistedBy: ObjectId (admin),
         blacklistedAt: Date,
         accessAttempts: []
       }

5. Frontend Update
   │
   ├─► Show success toast
   │
   ├─► Refresh blacklist table
   │
   └─► Close modal
```

## 🚫 User Login Attempt Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              BLACKLISTED USER TRIES TO LOGIN                     │
└─────────────────────────────────────────────────────────────────┘

1. User Action
   │
   ├─► User enters email/password
   │
   └─► Clicks "Login"

2. Frontend Request
   │
   └─► POST /api/auth/login
       {
         email: "user@example.com",
         password: "********"
       }

3. Backend Processing
   │
   ├─► Verify credentials
   │   │
   │   ├─► Find user by email
   │   │
   │   └─► Check password match
   │
   ├─► ✅ Credentials valid
   │
   ├─► 🔍 CHECK BLACKLIST
   │   │
   │   └─► Query Blacklist collection
   │       WHERE userId = user._id
   │
   ├─► ❌ User is blacklisted!
   │
   ├─► Log access attempt
   │   │
   │   └─► Update Blacklist.accessAttempts
   │       {
   │         timestamp: Date.now(),
   │         ipAddress: req.ip,
   │         userAgent: req.headers['user-agent'],
   │         attemptedRoute: "/api/auth/login"
   │       }
   │
   └─► Return 403 response
       {
         message: "Access denied. Your account has been restricted.",
         isBlacklisted: true,
         reason: "Spam account",
         blacklistedAt: "2025-10-20T05:00:00.000Z"
       }

4. Frontend Response
   │
   ├─► Display error message
   │   "Access denied: Spam account"
   │
   └─► User remains on login page
```

## 🛡️ Protected Route Access Flow

```
┌─────────────────────────────────────────────────────────────────┐
│         BLACKLISTED USER TRIES TO ACCESS PROTECTED ROUTE         │
└─────────────────────────────────────────────────────────────────┘

1. User Action
   │
   └─► User navigates to /dashboard (or any protected route)

2. Frontend Check
   │
   ├─► ProtectedRoute component checks token
   │
   └─► Token exists → Allow navigation

3. Backend Request
   │
   └─► GET /api/auth/me
       Headers: { Authorization: "Bearer <token>" }

4. Middleware Chain
   │
   ├─► protect() middleware
   │   │
   │   ├─► Verify JWT token
   │   │
   │   ├─► Find user by decoded ID
   │   │
   │   ├─► 🔍 CHECK BLACKLIST
   │   │   │
   │   │   └─► Query Blacklist collection
   │   │       WHERE userId = user._id
   │   │
   │   ├─► ❌ User is blacklisted!
   │   │
   │   ├─► Log access attempt
   │   │   │
   │   │   └─► Update Blacklist.accessAttempts
   │   │       {
   │   │         timestamp: Date.now(),
   │   │         ipAddress: req.ip,
   │   │         userAgent: req.headers['user-agent'],
   │   │         attemptedRoute: "/api/auth/me"
   │   │       }
   │   │
   │   └─► Return 403 response
   │       {
   │         message: "Access denied. Your account has been restricted.",
   │         isBlacklisted: true,
   │         reason: "Spam account",
   │         blacklistedAt: "2025-10-20T05:00:00.000Z"
   │       }
   │
   └─► Request blocked - controller never reached

5. Frontend Response
   │
   ├─► AuthContext catches 403 + isBlacklisted
   │
   ├─► Clear localStorage
   │   ├─► Remove token
   │   ├─► Remove role
   │   └─► Remove isVerified
   │
   ├─► Navigate to /blacklisted
   │   with state: { reason: "Spam account" }
   │
   └─► Display BlacklistedPage
       ├─► Show restriction message
       ├─► Display reason
       ├─► Provide support link
       └─► Provide home link
```

## ✅ Remove from Blacklist Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                ADMIN REMOVES USER FROM BLACKLIST                 │
└─────────────────────────────────────────────────────────────────┘

1. Admin Action
   │
   ├─► Admin finds user in blacklist table
   │
   ├─► Clicks "Remove" button
   │
   └─► Confirms action

2. Frontend Request
   │
   └─► DELETE /api/blacklist/:userId

3. Backend Processing
   │
   ├─► Verify admin authentication
   │
   ├─► Find blacklist entry by userId
   │
   ├─► Delete entry from database
   │
   └─► Return success response

4. Database Update
   │
   └─► Remove from Blacklist collection
       WHERE userId = ObjectId

5. Frontend Update
   │
   ├─► Show success toast
   │
   ├─► Refresh blacklist table
   │
   └─► User removed from list

6. User Can Now
   │
   ├─► ✅ Log in successfully
   │
   ├─► ✅ Access protected routes
   │
   └─► ✅ Use platform normally
```

## 🔍 Access Attempt Logging

```
┌─────────────────────────────────────────────────────────────────┐
│                    ACCESS ATTEMPT LOGGING                        │
└─────────────────────────────────────────────────────────────────┘

Every time a blacklisted user tries to access the platform:

1. Capture Information
   │
   ├─► timestamp: Current date/time
   ├─► ipAddress: req.ip or req.connection.remoteAddress
   ├─► userAgent: req.headers['user-agent']
   └─► attemptedRoute: req.originalUrl

2. Store in Database
   │
   └─► Update Blacklist document
       $push to accessAttempts array
       {
         timestamp: "2025-10-20T05:30:00.000Z",
         ipAddress: "192.168.1.100",
         userAgent: "Mozilla/5.0...",
         attemptedRoute: "/api/auth/login"
       }

3. Admin Can View
   │
   ├─► Navigate to Blacklist tab
   │
   ├─► Find user
   │
   ├─► Click "Show X access attempts"
   │
   └─► View detailed logs
       ├─► When: Date and time
       ├─► Where: IP address
       ├─► What: Attempted route
       └─► How: User agent (browser/device)
```

## 🌐 Public vs Protected Routes

```
┌─────────────────────────────────────────────────────────────────┐
│                    ROUTE ACCESS MATRIX                           │
└─────────────────────────────────────────────────────────────────┘

PUBLIC ROUTES (No Authentication Required)
├─► / (Landing Page)                    ✅ Accessible
├─► /signup (Signup Page)               ✅ Accessible
├─► /verify-email                       ✅ Accessible
├─► /forgot-password                    ✅ Accessible
├─► /about                              ✅ Accessible
├─► /contact                            ✅ Accessible
├─► /privacy                            ✅ Accessible
├─► /terms                              ✅ Accessible
├─► /validate/:code (Certificate)       ✅ Accessible
└─► /blacklisted                        ✅ Accessible

PROTECTED ROUTES (Authentication Required + Blacklist Check)
├─► /dashboard/*                        ❌ Blocked
├─► /admin/dashboard/*                  ❌ Blocked
├─► /profile                            ❌ Blocked
├─► /courses/*                          ❌ Blocked
├─► /assignments/*                      ❌ Blocked
├─► /projects/*                         ❌ Blocked
└─► All /api/* endpoints (with auth)    ❌ Blocked
```

## 🎯 Decision Tree

```
┌─────────────────────────────────────────────────────────────────┐
│                  BLACKLIST DECISION TREE                         │
└─────────────────────────────────────────────────────────────────┘

User attempts to access platform
│
├─► Is route public?
│   │
│   ├─► YES → ✅ Allow access
│   │
│   └─► NO → Continue to authentication
│
├─► Is user authenticated?
│   │
│   ├─► NO → ❌ Redirect to login
│   │
│   └─► YES → Continue to blacklist check
│
├─► Is user blacklisted?
│   │
│   ├─► YES → ❌ Block access
│   │   │
│   │   ├─► Log attempt
│   │   │
│   │   └─► Return 403 with reason
│   │
│   └─► NO → ✅ Allow access
│
└─► Proceed to route handler
```

## 📊 Data Flow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA FLOW SUMMARY                           │
└─────────────────────────────────────────────────────────────────┘

Admin Interface
    │
    ├─► Add to Blacklist
    │   └─► POST /api/blacklist
    │       └─► Insert Blacklist document
    │
    ├─► Remove from Blacklist
    │   └─► DELETE /api/blacklist/:userId
    │       └─► Delete Blacklist document
    │
    ├─► View Blacklisted Users
    │   └─► GET /api/blacklist
    │       └─► Query all Blacklist documents
    │
    └─► View Statistics
        └─► GET /api/blacklist/stats
            └─► Aggregate Blacklist data

User Authentication
    │
    ├─► Login Attempt
    │   └─► POST /api/auth/login
    │       ├─► Check credentials
    │       ├─► Check blacklist
    │       └─► Log if blacklisted
    │
    └─► Route Access
        └─► Any protected route
            ├─► protect() middleware
            ├─► Check blacklist
            └─► Log if blacklisted

Database
    │
    ├─► Blacklist Collection
    │   ├─► userId (indexed)
    │   ├─► email (indexed)
    │   ├─► reason
    │   ├─► notes
    │   ├─► blacklistedBy
    │   ├─► blacklistedAt
    │   └─► accessAttempts[]
    │
    └─► User Collection
        └─► (unchanged - no direct modification)
```

## 🔐 Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                             │
└─────────────────────────────────────────────────────────────────┘

Layer 1: Login Prevention
    └─► Blacklist check in loginUser controller
        └─► Blocks before token generation

Layer 2: Middleware Protection
    └─► Blacklist check in protect() middleware
        └─► Blocks all authenticated requests

Layer 3: Frontend Validation
    └─► AuthContext handles 403 responses
        └─► Clears tokens and redirects

Layer 4: Access Logging
    └─► All attempts logged with details
        └─► Enables monitoring and analysis

Layer 5: Admin Controls
    └─► Only admins can manage blacklist
        └─► Admins cannot be blacklisted
```

## 🎉 Complete Protection

Your platform now has comprehensive blacklist protection at every level:
- ✅ Database layer (Blacklist model)
- ✅ API layer (Controllers and routes)
- ✅ Middleware layer (Authentication check)
- ✅ Frontend layer (Context and routing)
- ✅ UI layer (Admin interface)

**Your platform is now secure from spam and malicious users!** 🛡️
