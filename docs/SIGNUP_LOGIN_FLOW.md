# Signup, Verification & Login Flow

## Complete Flow Overview

### 1. Signup Flow
```
User fills signup form
    ↓
Submit → POST /api/auth/register
    ↓
Backend creates user (isVerified: false)
Backend sends verification email
Backend returns: { message, userId } (NO TOKEN)
    ↓
Frontend clears localStorage & sessionStorage
    ↓
Navigate to /verify-email?email=user@example.com
```

**No redirects, no refreshes** ✅

### 2. Verification Flow
```
User lands on /verify-email
    ↓
Auto-send verification code (on mount)
    ↓
User enters 6-digit code
    ↓
Auto-submit when 6 digits entered
    ↓
POST /api/auth/verify-email
    ↓
Backend marks user as verified
Backend returns: { message }
    ↓
Frontend clears localStorage & sessionStorage
    ↓
Navigate to /?verified=true
```

**No redirects, no refreshes** ✅

### 3. Login Flow
```
User lands on / (login page)
    ↓
If ?verified=true → Show success message
    ↓
User enters email & password
    ↓
Submit → POST /api/auth/login
    ↓
Backend validates credentials
Backend checks isVerified === true
Backend returns: { token, user, role, firstLogin, isOnboarded, isVerified }
    ↓
Frontend stores in localStorage:
  - token
  - role
  - firstLogin
  - isOnboarded
  - isVerified
    ↓
Update AuthContext (setUser)
    ↓
Navigate based on role:
  - Admin → /admin/dashboard
  - Student → /dashboard
```

**No redirects, no refreshes** ✅

## Key Points

### ✅ No Unnecessary Redirects
- Signup → Verify (1 redirect)
- Verify → Login (1 redirect)
- Login → Dashboard (1 redirect)
- **Total: 3 redirects** (all necessary)

### ✅ No Page Refreshes
- All navigation uses React Router's `navigate()`
- No `window.location` or `window.reload()`
- SPA behavior maintained throughout

### ✅ Clean Storage Management
- Signup: Clears all storage before starting
- Verification: Clears all storage after success
- Login: Stores fresh data from backend

### ✅ No AuthContext Interference
- Signup: No token stored → AuthContext doesn't run
- Verification: No token stored → AuthContext doesn't run
- Login: Token stored → AuthContext validates and sets user

## Error Handling

### Unverified User Tries to Login
```
POST /api/auth/login
    ↓
Backend returns: { message: "EMAIL_NOT_VERIFIED", email }
    ↓
Frontend navigates to /verify-email?email=user@example.com
    ↓
User verifies → Returns to login
```

### Invalid Verification Code
```
User enters wrong code
    ↓
Backend returns 400: { message: "Invalid code" }
    ↓
Frontend shows error
User can try again or resend code
```

### Resend Verification Code
```
User clicks "Resend Code"
    ↓
POST /api/auth/resend-verification
    ↓
Backend generates new code
Backend sends email
    ↓
60-second cooldown starts
```

## Storage Keys

### localStorage (Persistent)
- `token` - JWT authentication token
- `role` - User role (student, admin, admin-only)
- `isVerified` - Email verification status
- `firstLogin` - First time login flag
- `isOnboarded` - Onboarding completion status

### sessionStorage (Temporary)
- None used in current flow

## Backend Endpoints

### POST /api/auth/register
**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "message": "Account created. Please check your email for the verification code.",
  "userId": "507f1f77bcf86cd799439011"
}
```

### POST /api/auth/verify-email
**Request:**
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "message": "Email verified successfully"
}
```

### POST /api/auth/login
**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "name": "John Doe", "email": "john@example.com", ... },
  "role": "student",
  "firstLogin": true,
  "isOnboarded": false,
  "isVerified": true
}
```

### POST /api/auth/resend-verification
**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "message": "Verification code sent successfully"
}
```

## Testing Checklist

- [ ] New user signup
  - [ ] Form validation works
  - [ ] Redirects to verification page
  - [ ] No token in localStorage
  - [ ] No AuthContext interference

- [ ] Email verification
  - [ ] Code auto-sent on page load
  - [ ] 6-digit input works
  - [ ] Auto-submit on 6 digits
  - [ ] Success redirects to login with message
  - [ ] Resend code works with cooldown

- [ ] Login after verification
  - [ ] Success message shows
  - [ ] Login works
  - [ ] Token stored correctly
  - [ ] Redirects to correct dashboard

- [ ] Unverified user login attempt
  - [ ] Redirects to verification page
  - [ ] Can verify and return to login

- [ ] Error handling
  - [ ] Invalid credentials
  - [ ] Invalid verification code
  - [ ] Network errors

---

**Status:** ✅ Flow Optimized
**Redirects:** 3 (all necessary)
**Refreshes:** 0
**Storage:** Clean and minimal
