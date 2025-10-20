# Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas account
- Cloudinary account (for media uploads)

### Step 1: Clone and Install
```bash
git clone https://github.com/codedjade003/LFCJahiTechLearn.git
cd LFCJahiTechLearn
npm install
cd lfc-learning && npm install
cd ../server && npm install
```

### Step 2: Environment Setup

**Backend** (`server/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lfc-learning
JWT_SECRET=your_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Frontend** (`lfc-learning/.env`):
```env
VITE_API_URL=http://localhost:5000
```

### Step 3: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd lfc-learning
npm run dev
```

### Step 4: Access the Application
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Step 5: Create Admin Account
1. Register a new account at http://localhost:5173/signup
2. Manually update the user role in MongoDB:
```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

---

## 🎯 Key Features to Test

### As a Student
1. **Browse Courses** - Dashboard shows all available courses
2. **Enroll** - Click any course and enroll
3. **Take Tour** - First-time? Onboarding tour will guide you
4. **Complete Module** - Watch video, take quiz, fill survey
5. **Switch Theme** - Profile → Preferences → Toggle Dark Mode
6. **Disable Tours** - Profile → Preferences → Toggle Onboarding

### As an Admin
1. **Create Course** - Admin Dashboard → Courses → Create New
2. **Add Modules** - Add sections and modules with content
3. **Configure Survey** - Add survey questions to modules
4. **Grade Submissions** - Assessments → View pending work
5. **View Analytics** - Survey Responses → Filter and export

---

## 🔧 Common Commands

### Development
```bash
# Start backend
cd server && npm run dev

# Start frontend
cd lfc-learning && npm run dev

# Build frontend
cd lfc-learning && npm run build
```

### Database
```bash
# Start MongoDB locally
mongod

# Connect to MongoDB
mongosh

# View collections
use lfc-learning
show collections
```

### Troubleshooting
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
cd lfc-learning
rm -rf dist node_modules/.vite
npm run build
```

---

## 📱 Default Credentials

After seeding (if you create a seed script):
- **Admin**: admin@lfc.com / password123
- **Student**: student@lfc.com / password123

---

## 🎨 Feature Toggles

### Enable/Disable Onboarding
1. Go to Profile
2. Click Preferences tab
3. Toggle "Show Onboarding Tours"

### Switch Theme
1. Go to Profile
2. Click Preferences tab
3. Click Light or Dark button

---

## 📚 Documentation

- **Full Documentation**: README.md
- **Onboarding Guide**: ONBOARDING_IMPLEMENTATION.md
- **Survey System**: SURVEY_FEATURE_SUMMARY.md
- **Implementation Summary**: FINAL_IMPLEMENTATION_SUMMARY.md

---

## 🐛 Common Issues

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Verify network access if using Atlas

### Cloudinary Upload Fails
- Verify API credentials in `.env`
- Check upload preset configuration
- Ensure file size is within limits

### Build Errors
```bash
# Clear cache and rebuild
cd lfc-learning
rm -rf node_modules/.vite dist
npm run build
```

---

## 🚢 Quick Deploy

### Frontend (Vercel)
```bash
cd lfc-learning
npm run build
vercel --prod
```

### Backend (Railway)
```bash
cd server
railway up
```

---

## 💡 Pro Tips

1. **Use Dark Mode** - Easier on the eyes during development
2. **Skip Onboarding** - Toggle off in preferences after first tour
3. **Use MongoDB Compass** - Visual database management
4. **Install React DevTools** - Debug React components
5. **Use Postman** - Test API endpoints

---

## 📞 Need Help?

- Check documentation files
- Review code comments
- Search GitHub issues
- Contact: support@lfctech.com

---

**Happy Coding! 🎉**
