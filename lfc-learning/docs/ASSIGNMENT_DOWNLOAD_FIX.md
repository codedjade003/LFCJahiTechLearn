# Assignment Download Button Fix

## Issue
Assignment submission download button was using `resolveFileUrl()` which was prepending `API_BASE` to Cloudinary URLs, breaking the download links.

## Root Cause
The AssignmentSubmissionModal had a `resolveFileUrl()` helper function that was:
1. Checking if URL starts with 'http'
2. If not, prepending `API_BASE` to the URL

However, Cloudinary URLs already start with 'http', so they should have been returned as-is. The issue was that this extra processing was unnecessary and could cause problems.

## Fix
Changed AssignmentSubmissionModal to match ProjectSubmissionModal behavior:
- Use `file.url` directly instead of `resolveFileUrl(file.url)`
- Removed unused `resolveFileUrl()` function
- Removed unused `API_BASE` constant

## Changes Made

**File:** `lfc-learning/src/components/Admin/AssessmentTabs/AssignmentSubmissionModal.tsx`

### Before
```typescript
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const resolveFileUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
};

// Download link
<a href={resolveFileUrl(file.url)} ...>

// Image preview
<img src={resolveFileUrl(file.url)} ...>

// Video preview
<source src={resolveFileUrl(file.url)} ...>

// PDF preview
<iframe src={resolveFileUrl(file.url)} ...>
```

### After
```typescript
// Download link
<a href={file.url} ...>

// Image preview
<img src={file.url} ...>

// Video preview
<source src={file.url} ...>

// PDF preview
<iframe src={file.url} ...>
```

## Testing

1. Go to Admin → Assessments → Assignments
2. Click on any assignment submission with a file
3. Click the "Download" button
4. File should download correctly from Cloudinary
5. File preview (image/video/PDF) should also work correctly

## Notes

- ProjectSubmissionModal was already using `file.url` directly (correct approach)
- AssignmentSubmissionModal now matches this behavior
- Cloudinary URLs are always full URLs (start with https://res.cloudinary.com)
- No need for URL resolution logic when using Cloudinary
