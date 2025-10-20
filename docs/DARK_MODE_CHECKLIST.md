# Dark Mode Consistency Checklist

## Design Principles
- **Whites → Grays/Blues**: Replace bright whites with softer grays (gray-800, gray-900) or faint blues
- **Reds → Muted Reds**: Tone down LFC red (#C8102E) to softer variants (opacity, darker shades)
- **Contrast**: Ensure text remains readable with proper contrast ratios
- **Consistency**: Use consistent color palette across all components

## Color Palette
### Light Mode
- Background: white, gray-50
- Text: gray-900, gray-700
- Primary: lfc-red (#C8102E)
- Borders: gray-200, gray-300

### Dark Mode
- Background: gray-900, gray-800
- Text: gray-100, gray-300
- Primary: lfc-red/80 (muted red)
- Borders: gray-700, gray-600

---

## Components Status

### ✅ Completed
- [x] **App.tsx** - Root wrapper with dark mode support
- [x] **StudentDashboard** - Main dashboard with dark backgrounds
- [x] **AdminDashboard** - Admin dashboard with dark cards
- [x] **OnboardingModal** - Profile completion modal with full dark mode
- [x] **LandingPage** - Landing page with dark text colors
- [x] **Courses** - Course page with dark sidebar and header
- [x] **CourseGrid** - Empty state with dark mode text
- [x] **CourseCard** - Course cards with dark backgrounds and borders

### 🔄 Partially Complete (Needs Review)
- [ ] **Navbar** - Check if all states have dark mode
- [ ] **Footer** - Verify dark mode styling
- [ ] **LoginForm** - Check form inputs and buttons
- [ ] **CourseGrid** - Course cards need dark mode
- [ ] **CourseCategories** - Category buttons need dark mode
- [ ] **DashboardStats** - Stats cards need dark mode
- [ ] **ProfileCompletionBanner** - Banner needs dark mode

### ❌ Not Started
- [ ] **ProfilePage** - User profile page
- [ ] **CourseDetails** - Course detail page
- [ ] **AssignmentDetail** - Assignment detail page
- [ ] **MyAssignments** - Assignments list page
- [ ] **MyCourses** - Courses list page
- [ ] **MyProject** - Project page
- [ ] **ProjectDetail** - Project detail page
- [ ] **ManageCourses** - Admin course management
- [ ] **Users** - Admin user management
- [ ] **UserProgressTab** - Admin user progress
- [ ] **UserEnrollmentsTab** - Admin enrollments
- [ ] **SurveyResponses** - Admin survey responses
- [ ] **Settings** - Settings page
- [ ] **ForbiddenPage** - 403 page
- [ ] **SignUpPage** - Sign up page

### Components to Check
- [ ] **StatCard** - Admin dashboard stat cards
- [ ] **RecentActivity** - Activity feed component
- [ ] **CourseManagement** - Course management component
- [ ] **UserProgress** - User progress component
- [ ] **CourseAnalytics** - Analytics component
- [ ] **RecentUsers** - Recent users component
- [ ] **PendingAssessments** - Assessments component
- [ ] **Notifications** - Notifications component
- [ ] **OnboardingTour** - Tour component (Joyride styling)

---

## Next Steps
1. Review and update partially complete components
2. Apply dark mode to all "Not Started" components
3. Test dark mode toggle across all pages
4. Ensure consistent color usage
5. Check accessibility (contrast ratios)

## Notes
- Use Tailwind's `dark:` prefix for all dark mode styles
- Test with actual dark mode toggle in Profile → Preferences
- Consider adding transition classes for smooth theme switching
- Red colors should be muted in dark mode (use opacity or darker shades)
