// server/swagger.js
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           enum: [student, admin, admin-only]
 *         isVerified:
 *           type: boolean
 *         profilePicture:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *             publicId:
 *               type: string
 *     Course:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         instructor:
 *           type: object
 *         sections:
 *           type: array
 *           items:
 *             type: object
 *         isPublished:
 *           type: boolean
 *     Enrollment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         courseId:
 *           type: string
 *         progress:
 *           type: number
 *         enrolledAt:
 *           type: string
 *           format: date-time
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication and registration
 *   - name: Courses
 *     description: Course management
 *   - name: Enrollments
 *     description: Course enrollment management
 *   - name: Users
 *     description: User management
 *   - name: Progress
 *     description: Learning progress tracking
 *   - name: Submissions
 *     description: Assignment and project submissions
 *   - name: Support
 *     description: Support ticket system
 *   - name: Notifications
 *     description: User notifications
 *   - name: Certificates
 *     description: Certificate generation and validation
 *   - name: Feedback
 *     description: Course feedback and surveys
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 userId:
 *                   type: string
 *       400:
 *         description: Invalid input or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset code sent to email
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all published courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for course title or description
 *     responses:
 *       200:
 *         description: List of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *   post:
 *     summary: Create a new course (Admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               instructor:
 *                 type: object
 *               sections:
 *                 type: array
 *     responses:
 *       201:
 *         description: Course created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 *   put:
 *     summary: Update course (Admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Course'
 *     responses:
 *       200:
 *         description: Course updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 *   delete:
 *     summary: Delete course (Admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 */

/**
 * @swagger
 * /api/enrollments:
 *   get:
 *     summary: Get user's enrollments
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of enrollments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Enrollment'
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Enroll in a course
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *             properties:
 *               courseId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Enrolled successfully
 *       400:
 *         description: Already enrolled
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/progress/{courseId}:
 *   get:
 *     summary: Get course progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Progress data
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Update course progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               moduleId:
 *                 type: string
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Progress updated
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/support:
 *   get:
 *     summary: Get user's support tickets
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tickets
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create support ticket
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - category
 *               - message
 *             properties:
 *               subject:
 *                 type: string
 *               category:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ticket created
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/notifications/my:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of notifications to return
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/certificates/validate/{code}:
 *   get:
 *     summary: Validate certificate
 *     tags: [Certificates]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Certificate validation code
 *     responses:
 *       200:
 *         description: Certificate is valid
 *       404:
 *         description: Certificate not found
 */

export default {};
