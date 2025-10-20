# Swagger API Documentation Setup

## Overview
Swagger/OpenAPI documentation has been configured for the LFC Tech Learn API.

## Endpoints

### Swagger UI (Interactive Documentation)
- **URL**: `http://localhost:5000/doc`
- **Production**: `https://api.lfctechlearn.com/doc`
- **Description**: Interactive API documentation where you can test endpoints

### JSON Specification
- **URL**: `http://localhost:5000/doc-json`
- **Production**: `https://api.lfctechlearn.com/doc-json`
- **Description**: Raw OpenAPI JSON specification

## Configuration

### Files Modified:
1. **server/server.js**
   - Fixed ES module imports for swagger-jsdoc and swagger-ui-express
   - Configured swagger with proper server URLs
   - Set up `/doc` and `/doc-json` endpoints

2. **server/swagger.js** (NEW)
   - Comprehensive API documentation
   - Documented endpoints for:
     - Authentication (register, login, forgot password, etc.)
     - Courses (CRUD operations)
     - Enrollments
     - Progress tracking
     - Support tickets
     - Notifications
     - Certificates
   - Defined reusable schemas (User, Course, Enrollment, Error)
   - Security schemes (Bearer JWT authentication)

## Documented Routes

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user profile
- `POST /forgot-password` - Request password reset

### Courses (`/api/courses`)
- `GET /` - Get all published courses
- `POST /` - Create course (Admin)
- `GET /:id` - Get course by ID
- `PUT /:id` - Update course (Admin)
- `DELETE /:id` - Delete course (Admin)

### Enrollments (`/api/enrollments`)
- `GET /` - Get user enrollments
- `POST /` - Enroll in course

### Progress (`/api/progress`)
- `GET /:courseId` - Get course progress
- `POST /:courseId` - Update progress

### Support (`/api/support`)
- `GET /` - Get user tickets
- `POST /` - Create ticket

### Notifications (`/api/notifications`)
- `GET /my` - Get user notifications

### Certificates (`/api/certificates`)
- `GET /validate/:code` - Validate certificate

## How to Use

### 1. Start the Server
```bash
cd server
npm start
# or
npm run dev
```

### 2. Access Swagger UI
Open your browser and navigate to:
```
http://localhost:5000/doc
```

### 3. Test Endpoints
1. Click on any endpoint to expand it
2. Click "Try it out"
3. Fill in required parameters
4. For protected routes, click "Authorize" and enter your JWT token:
   ```
   Bearer <your-jwt-token>
   ```
5. Click "Execute" to test the endpoint

### 4. Get JSON Specification
```bash
curl http://localhost:5000/doc-json
```

## Adding More Documentation

To document additional routes, add JSDoc comments to `server/swagger.js`:

```javascript
/**
 * @swagger
 * /api/your-route:
 *   get:
 *     summary: Description
 *     tags: [YourTag]
 *     responses:
 *       200:
 *         description: Success
 */
```

## Security

The API uses Bearer JWT authentication. To access protected endpoints:

1. Login via `/api/auth/login`
2. Copy the JWT token from the response
3. Click "Authorize" in Swagger UI
4. Enter: `Bearer <your-token>`
5. Click "Authorize"

Now all protected endpoints will include the token automatically.

## Customization

### Swagger UI Theme
The UI has been customized with:
- Hidden topbar
- Custom site title: "LFC Tech Learn API Docs"
- Explorer enabled for testing

### Server URLs
- Production: `https://api.lfctechlearn.com`
- Development: `http://localhost:5000`

## Next Steps

To add documentation for remaining routes:
1. Open `server/swagger.js`
2. Add JSDoc comments following the existing pattern
3. Restart the server
4. Refresh `/doc` to see changes

## Troubleshooting

### Swagger UI not loading
- Check that swagger-jsdoc and swagger-ui-express are installed
- Verify server is running on correct port
- Check browser console for errors

### Routes not appearing
- Ensure JSDoc comments are properly formatted
- Check that file paths in `apis` array are correct
- Restart the server after adding documentation

### Authentication not working
- Verify JWT token is valid
- Check token format: `Bearer <token>`
- Ensure protected routes have `security: [{ bearerAuth: [] }]` in documentation
