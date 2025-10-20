# LFC Learning Platform

A comprehensive Learning Management System (LMS) built for Liverpool FC Church Technical Department, featuring course management, assessments, progress tracking, and advanced features like proctored quizzes, dark mode, and interactive onboarding.

## 🎯 Overview

The LFC Learning Platform is a full-stack MERN application designed to facilitate online learning with a focus on technical training. It provides separate interfaces for students and administrators, with robust features for course delivery, assessment, and progress monitoring.

## ✨ Key Features

### 🎓 For Students
- **Course Enrollment & Learning**
  - Browse courses by category (Video, Audio, Graphics, Content Creation, etc.)
  - Enroll in courses with one click
  - Track progress across all enrolled courses
  - Module-based learning with videos, PDFs, and quizzes
  - Module overview modals with learning objectives
  - Completion modals with optional surveys

- **Assessments**
  - Proctored quizzes with anti-cheating measures
  - Assignments with file uploads
  - Projects with milestone tracking
  - Real-time feedback and grading

- **Progress Tracking**
  - Dashboard with learning statistics
  - Course completion certificates
  - Achievement badges
  - Learning streaks

- **Profile Management**
  - Customizable profile with cover photo positioning
  - Education and work history
  - Social media links
  - Bio and interests

### 👨‍💼 For Administrators
- **Course Management**
  - Create and edit courses with rich content
  - Section and module organization
  - Multiple content types (video, PDF, quiz)
  - Module descriptions and learning objectives
  - Survey configuration for feedback collection

- **User Management**
  - View all users with detailed information
  - Track user progress and enrollments
  - Manage user roles and permissions
  - Export user data

- **Assessment Grading**
  - Grade assignments and projects
  - View submissions with file downloads
  - Provide detailed feedback
  - Track pending assessments

- **Analytics & Reporting**
  - Course analytics and engagement metrics
  - User progress overview
  - Survey response analysis
  - Export data to CSV

- **Support System**
  - Ticket management
  - User support dashboard
  - Activity logging

### 🎨 User Experience Features

#### Dark Mode
- System-wide dark mode support
- Automatic theme detection based on system preferences
- Manual toggle in user preferences
- Persistent theme selection

#### Interactive Onboarding
- First-time user tours for all major features
- Step-by-step guidance with visual highlights
- Skippable tours with progress tracking
- Per-feature tour completion
- Toggle onboarding on/off in preferences

#### Module Learning Flow
- **Overview Modal**: Shows module description and objectives before starting
- **Content Delivery**: Video player, PDF viewer, or quiz interface
- **Completion Modal**: Celebrates completion with optional survey
- **Auto-Advancement**: Automatically moves to next module

#### Survey System
- Configurable surveys per module
- Three question types: Text, Rating (1-5 stars), Multiple Choice
- Admin dashboard for viewing responses
- CSV export for analysis

## 🛠️ Technology Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Joyride** for onboarding tours
- **Framer Motion** for animations
- **React Toastify** for notifications

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Cloudinary** for media storage
- **Multer** for file uploads

### Key Libraries
- **html2canvas** for certificate generation
- **xlsx** for Excel exports
- **react-icons** for UI icons

## 📁 Project Structure

```
LFCJahiTechLearn/
├── lfc-learning/                 # Frontend React application
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   ├── Admin/          # Admin-specific components
│   │   │   ├── Dashboard/      # Dashboard components
│   │   │   ├── Student/        # Student-specific components
│   │   │   └── shared/         # Shared components
│   │   ├── context/            # React contexts
│   │   │   ├── AuthContext.tsx
│   │   │   ├── OnboardingContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── pages/              # Page components
│   │   │   ├── Admin/          # Admin pages
│   │   │   ├── Dashboards/     # Dashboard pages
│   │   │   └── Student/        # Student pages
│   │   ├── config/             # Configuration files
│   │   ├── hooks/              # Custom React hooks
│   │   ├── layouts/            # Layout components
│   │   └── types/              # TypeScript types
│   └── public/                 # Static assets
│
├── server/                      # Backend Node.js application
│   ├── controllers/            # Route controllers
│   ├── models/                 # Mongoose models
│   ├── routes/                 # API routes
│   ├── middleware/             # Custom middleware
│   ├── utils/                  # Utility functions
│   └── uploads/                # File upload directory
│
└── docs/                       # Documentation
    ├── ONBOARDING_IMPLEMENTATION.md
    ├── SURVEY_FEATURE_SUMMARY.md
    └── FIXES_SUMMARY.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (20.19+ recommended for Vite)
- MongoDB 4.4+
- Cloudinary account (for media storage)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/codedjade003/LFCJahiTechLearn.git
cd LFCJahiTechLearn
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd lfc-learning
npm install

# Install backend dependencies
cd ../server
npm install
```

3. **Environment Setup**

Create `.env` file in the `server` directory:
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/lfc-learning

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

Create `.env` file in the `lfc-learning` directory:
```env
VITE_API_URL=http://localhost:5000
```

4. **Start the application**

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd lfc-learning
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 📚 Core Features Documentation

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Student, Admin, Admin-Only)
- Email verification
- Password reset functionality
- First login tracking

### Course Management
- **Course Structure**: Courses → Sections → Modules
- **Module Types**: Video, PDF, Quiz
- **Content Delivery**: Cloudinary for media, local storage for documents
- **Progress Tracking**: Per-module completion tracking

### Assessment System
- **Quizzes**: Multiple choice with proctoring
  - Tab switch detection
  - Fullscreen enforcement
  - Time limits
  - Violation tracking
- **Assignments**: File uploads with grading
- **Projects**: Milestone-based with feedback

### Proctoring System
- Fullscreen requirement
- Tab switch detection
- Violation logging
- Manual review flagging
- Time tracking

### Survey System
- Module-level surveys
- Three question types
- Admin analytics dashboard
- CSV export

### Onboarding System
- Per-feature tour tracking
- React Joyride integration
- Skippable tours
- Progress persistence
- Preference toggle

### Theme System
- Light/Dark mode
- System preference detection
- Manual toggle
- Persistent selection
- Tailwind dark mode classes

## 🎨 UI/UX Features

### Design System
- **Colors**:
  - Primary: LFC Red (#A41E21)
  - Secondary: Gold (#D4AF37)
  - Neutral: Gray scale
- **Typography**: System fonts with fallbacks
- **Spacing**: Tailwind spacing scale
- **Animations**: Framer Motion for smooth transitions

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interfaces
- Adaptive layouts

### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Input validation and sanitization
- File upload restrictions
- CORS configuration
- Rate limiting (recommended for production)

## 📊 Database Schema

### User Model
```javascript
{
  name, email, password, role,
  profilePicture, coverPhoto,
  dateOfBirth, phoneNumber, maritalStatus,
  technicalUnit, address, bio,
  education, workExperience, skills,
  socialLinks, interests,
  firstLogin, isOnboarded,
  onboardingProgress: {
    dashboard, courses, courseDetails,
    profile, assessments, adminDashboard,
    courseManagement, userManagement,
    assessmentGrading
  },
  preferences: {
    theme, onboardingEnabled,
    emailNotifications, pushNotifications
  }
}
```

### Course Model
```javascript
{
  title, description, categories, level,
  type, tags, createdBy, thumbnail,
  promoVideo, duration, prerequisites,
  objectives,
  sections: [{
    title, description,
    modules: [{
      type, title, description, objectives,
      contentUrl, duration,
      quiz: { questions, dueDate, timeLimit },
      survey: { questions }
    }]
  }],
  assignments, project,
  instructor, instructors,
  isPublic, status
}
```

### Enrollment Model
```javascript
{
  user, course,
  progress, completed, completedAt,
  timeSpent, lastAccessed, enrolledAt,
  sectionProgress, moduleProgress,
  assignmentProgress, projectProgress
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course (admin)
- `PUT /api/courses/:id` - Update course (admin)
- `DELETE /api/courses/:id` - Delete course (admin)
- `GET /api/courses/:id/sections` - Get course sections
- `POST /api/courses/:id/sections` - Add section
- `POST /api/courses/:id/sections/:sectionId/modules` - Add module

### Enrollments
- `POST /api/enrollments` - Enroll in course
- `GET /api/enrollments/my-courses` - Get user's enrollments
- `GET /api/enrollments/:courseId` - Get enrollment details

### Progress
- `POST /api/progress/:courseId/modules/:moduleId/access` - Track module access
- `PUT /api/progress/:courseId/modules/:moduleId/complete` - Mark module complete
- `POST /api/progress/:courseId/modules/:moduleId/track-time` - Track time spent

### Assessments
- `POST /api/submissions/assignments` - Submit assignment
- `POST /api/submissions/projects` - Submit project
- `POST /api/proctoring/:courseId/quizzes/:quizId/submit` - Submit quiz

### Feedback & Surveys
- `POST /api/feedback/modules/:moduleId` - Submit module survey
- `GET /api/feedback/survey-responses` - Get all survey responses (admin)

### User Preferences
- `GET /api/users/preferences` - Get user preferences
- `PUT /api/users/preferences` - Update user preferences

### Onboarding
- `POST /api/users/onboarding/complete` - Mark tour complete
- `POST /api/users/onboarding/finish` - Finish all onboarding
- `POST /api/users/onboarding/skip-all` - Skip all tours

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Course enrollment and access
- [ ] Module completion flow
- [ ] Quiz taking with proctoring
- [ ] Assignment submission
- [ ] Survey completion
- [ ] Onboarding tours
- [ ] Theme switching
- [ ] Profile editing
- [ ] Admin course creation
- [ ] Admin grading
- [ ] Survey response viewing

### Recommended Testing Tools
- Postman for API testing
- React DevTools for component inspection
- MongoDB Compass for database inspection

## 🚢 Deployment

### Frontend (Vercel/Netlify)
1. Build the frontend: `cd lfc-learning && npm run build`
2. Deploy the `dist` folder
3. Set environment variable: `VITE_API_URL=your_backend_url`

### Backend (Heroku/Railway/DigitalOcean)
1. Ensure all environment variables are set
2. Deploy the `server` directory
3. Set `NODE_ENV=production`
4. Configure MongoDB Atlas connection

### Database (MongoDB Atlas)
1. Create a cluster
2. Whitelist IP addresses
3. Create database user
4. Update `MONGODB_URI` in environment variables

### Media Storage (Cloudinary)
1. Create account
2. Get API credentials
3. Configure upload presets
4. Update environment variables

## 📈 Performance Optimization

### Frontend
- Code splitting with React.lazy
- Image optimization with Cloudinary
- Lazy loading for routes
- Memoization with useMemo/useCallback
- Virtual scrolling for large lists

### Backend
- Database indexing
- Query optimization
- Caching with Redis (recommended)
- Compression middleware
- Rate limiting

## 🐛 Known Issues & Limitations

1. **Node Version**: Vite requires Node.js 20.19+ but works with 18.20.8 using legacy peer deps
2. **Chunk Size**: Main bundle exceeds 500KB - consider code splitting
3. **Real-time Features**: No WebSocket support yet (planned)
4. **Mobile App**: Web-only, no native mobile apps

## 🗺️ Roadmap

### Planned Features
- [ ] Real-time notifications with WebSockets
- [ ] Live video classes with WebRTC
- [ ] Discussion forums
- [ ] Peer review system
- [ ] Gamification with points and leaderboards
- [ ] Mobile apps (React Native)
- [ ] Offline mode with PWA
- [ ] AI-powered recommendations
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

## 🤝 Contributing

This is a private project for Liverpool FC Church. For internal contributions:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request
5. Wait for review

## 📝 License

Proprietary - All rights reserved by Liverpool FC Church Technical Department

## 👥 Team

- **Lead Developer**: [Your Name]
- **Project Manager**: [PM Name]
- **Technical Director**: Liverpool FC Church

## 📞 Support

For technical support or questions:
- Email: support@lfctech.com
- Internal Slack: #lfc-learning-support

## 🙏 Acknowledgments

- Liverpool FC Church Technical Department
- All beta testers and early users
- Open source community for amazing tools

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Status**: Production Ready

Built with ❤️ for Liverpool FC Church
