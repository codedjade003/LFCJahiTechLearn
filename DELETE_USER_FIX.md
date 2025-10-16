# Delete User Functionality Fix

## Issues Found

### 1. RecentUsers Component - 404 Error
**Problem:** Using wrong API endpoint
- **Was:** `/api/admin/users/${userId}` (doesn't exist)
- **Should be:** `/api/auth/users/${userId}`

### 2. AllUsersTab Component - "User not found" Error
**Problem:** Server controller using wrong parameter name
- **Was:** `req.params._id` 
- **Should be:** `req.params.id`
- **Route definition:** `/users/:id` (uses `id`, not `_id`)

---

## Fixes Applied

### Client-Side Fix: RecentUsers.tsx

**Changed endpoint:**
```typescript
// Before
const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {

// After
const response = await fetch(`${API_BASE}/api/auth/users/${userId}`, {
```

**Added better error messages:**
```typescript
if (response.ok) {
  fetchRecentUsers();
} else {
  const errorData = await response.json();
  alert(`Failed to delete user: ${errorData.message || 'Unknown error'}`);
}
```

### Server-Side Fix: authController.js

**Fixed parameter name:**
```javascript
// Before
const targetUserId = req.params._id;

// After
const targetUserId = req.params.id;
```

**Added comprehensive logging:**
```javascript
console.log("=== DELETE USER REQUEST ===");
console.log("Requesting user:", req.user?.email);
console.log("Target user ID:", req.params.id);
console.log("User to delete:", userToDelete.email);
console.log("Admin deleting user");
```

**Fixed ID comparison:**
```javascript
// Before
if (requestingUser._id === targetUserId) {

// After
if (requestingUser._id.toString() === targetUserId) {
```

---

## How It Works Now

### Delete Flow
1. Admin clicks delete button (either in RecentUsers or AllUsersTab)
2. Confirmation dialog appears
3. Request sent to `/api/auth/users/:id` with DELETE method
4. Server validates:
   - User exists
   - Not trying to delete original admin
   - Requester has permission (admin/admin-only)
5. User deleted from database
6. UI refreshes to show updated list

### Permissions
- ✅ **Admin** can delete any user (except original admin)
- ✅ **Admin-only** can delete any user (except original admin)
- ✅ **Users** can delete their own account (except original admin)
- ❌ **Original admin** cannot be deleted (protected)
- ❌ **Students** cannot delete other users

---

## Testing

### Test Delete from RecentUsers Component
1. Go to Admin Dashboard
2. Find "Recent Users" widget
3. Click trash icon on any user
4. Confirm deletion
5. User should be removed from list

### Test Delete from Users Management
1. Go to Admin → Users
2. Click "All Users" tab
3. Click trash icon on any user
4. Confirm deletion
5. User should be removed from list

### Monitor Server Logs
```bash
tail -f /tmp/server.log | grep "DELETE USER"
```

You'll see:
```
=== DELETE USER REQUEST ===
Requesting user: admin@example.com
Target user ID: 67xxxxx
User to delete: student@example.com
Admin deleting user
```

---

## Error Messages

### User Not Found (404)
- User ID doesn't exist in database
- Check if user was already deleted

### Not Authorized (403)
- Trying to delete original admin
- User doesn't have permission

### Failed to Delete
- Network error
- Server error
- Check server logs for details

---

## Files Modified

1. **lfc-learning/src/components/Admin/RecentUsers.tsx**
   - Changed endpoint from `/api/admin/users/` to `/api/auth/users/`
   - Added better error handling

2. **server/controllers/authController.js**
   - Fixed `req.params._id` → `req.params.id`
   - Added comprehensive logging
   - Fixed ID comparison with `.toString()`

---

## Notes

- Both delete buttons now use the same endpoint: `/api/auth/users/:id`
- Original admin account is protected and cannot be deleted
- All delete operations are logged with user details
- Error messages now show specific reasons for failure
