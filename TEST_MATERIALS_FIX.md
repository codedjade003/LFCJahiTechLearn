# Materials Upload Fix - Testing Guide

## Problem
Materials were being cast to `[string]` instead of being stored as objects, causing validation errors:
```
Cast to [string] failed for value "..." (type string) at path "materials.0"
```

## Root Cause
The Mongoose schema was not properly defining the materials subdocument structure. Mongoose was interpreting the inline object definition as a string array.

## Solution
Created a separate `materialSchema` and referenced it in both assignment and project schemas.

### Changes Made

#### 1. server/models/Course.js
```javascript
// BEFORE (inline definition - caused issues)
materials: [
  {
    url: String,
    name: String,
    type: String,
    public_id: String
  }
]

// AFTER (proper subdocument schema)
const materialSchema = new mongoose.Schema({
  url: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  public_id: String
}, { _id: false });

// Then use it:
materials: [materialSchema]
```

#### 2. Added Debug Logging
- Frontend: `CourseAssignmentsTab.tsx` - logs materials before sending
- Backend: `courseController.js` - logs materials before saving

## Testing Steps

### 1. Restart Server (CRITICAL)
Mongoose caches schemas, so you MUST restart the server:
```bash
# Kill existing server
lsof -ti:5000 | xargs kill -9

# Start fresh
cd server
npm start
```

### 2. Test Assignment with Materials
1. Go to Admin → Courses → Select a course → Assignments tab
2. Create new assignment
3. Upload an image/document using MaterialsUploader
4. Fill in title, instructions, due date
5. Click "Add Assignment"

**Expected**: Assignment created successfully
**Check logs for**:
```
📦 Received add assignment request: {
  materialsType: 'object',
  materialsIsArray: true,
  materialsLength: 1,
  materialsRaw: '[...]'
}
📝 Assignment object before push: {...}
📝 Materials type: object
📝 Materials is array: true
📝 First material: { name: '...', url: '...', type: '...', public_id: '...' }
📝 First material type: object
💾 About to save course...
✅ Course saved successfully
```

### 3. Test Project with Materials
1. Go to Admin → Courses → Select a course → Project tab
2. Create/update project
3. Upload materials
4. Save

**Expected**: Project saved successfully

### 4. Verify Data in Database
```javascript
// In MongoDB shell or Compass
db.courses.findOne({ _id: ObjectId("...") }, { 
  "assignments.materials": 1,
  "project.materials": 1 
})

// Should show:
{
  assignments: [{
    materials: [{
      name: "file.jpg",
      url: "https://...",
      type: "image",
      public_id: "..."
    }]
  }]
}
```

## If Still Failing

### Check 1: Schema Cache
```bash
# Completely restart Node process
pkill -f "node.*server"
cd server && npm start
```

### Check 2: Verify Schema in Memory
Add this to `server/controllers/courseController.js`:
```javascript
console.log('📋 Assignment schema:', Course.schema.path('assignments').schema.path('materials'));
```

### Check 3: Check for Multiple Model Definitions
```bash
grep -r "mongoose.model.*Course" server/
# Should only appear once in models/Course.js
```

### Check 4: Clear Node Modules Cache
```bash
cd server
rm -rf node_modules package-lock.json
npm install
npm start
```

## Success Indicators

✅ No "Cast to [string]" errors
✅ Materials saved as objects in database
✅ Materials display correctly in UI
✅ Can upload multiple files
✅ Can edit assignments/projects with materials

## Rollback (if needed)

If this causes issues, revert to storing materials as JSON strings:
```javascript
materials: [String]  // Store as JSON strings

// Then parse on retrieval:
const parsedMaterials = assignment.materials.map(m => JSON.parse(m));
```

But this is NOT recommended - proper object storage is the correct approach.
