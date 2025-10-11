import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import StudentDashboard from "./pages/Dashboards/StudentDashboard";

import "./App.css";
import LandingPage from "./pages/LandingPage";
import ProfilePage from "./pages/Student/ProfilePage";
import StudentLayout from "./layouts/StudentLayout";
import SignupPage from "./pages/SignUpPage";
import VerifyEmail from "./components/VerifyEmail";
import ProtectedRoute from "./context/ProtectedRoute";
import MyCourses from "./pages/Student/MyCourses";
import CourseDetails from "./pages/Student/CourseDetails";
import MyAssignments from "./pages/Student/MyAssignments";
import AssignmentDetail from "./pages/Student/AssignmentDetail";
import ProjectDetail from "./pages/Student/ProjectDetail";
import MyProject from "./pages/Student/MyProject";

// 🔹 Admin imports
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/Dashboards/AdminDashboard";

// Placeholder admin pages
import Courses from "./pages/Courses";
import Users from "./pages/Admin/Users";
import ForbiddenPage from "./pages/ForbiddenPage";
import ManageCourses from "./pages/Admin/ManageCourses";
import UserProgressTab from "./pages/Admin/UserProgressTab";
import Assignments from "./components/Admin/AssessmentTabs/Assignments";
import Projects from "./components/Admin/AssessmentTabs/Projects";
import Quizzes from "./components/Admin/AssessmentTabs/Quizzes";
import ForgotPassword from "./components/ForgotPassword";
import UserEnrollmentsTab from "./pages/Admin/UserEnrollmentsTab";
import PlaceholderPage from "./components/shared/PlaceholderPage";
import ErrorPage from "./components/shared/ErrorPage";

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Student Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="courses" element={<MyCourses />} />
          <Route path="/dashboard/courses/:courseId" element= {<CourseDetails/>} />
          <Route path="assignments" element={<MyAssignments />} />
          <Route path="/dashboard/assignments/:assignmentId" element= {<AssignmentDetail/>} />
          {/* FIXED: Use consistent "project" routes */}
          <Route path="project" element={<MyProject />} /> {/* List page */}
          <Route path="project/:courseId" element={<ProjectDetail />} /> {/* Detail page */}
          {/* Add more student routes here */}
        </Route>

        {/* Protected Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "admin-only"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="courses/new" element={<Courses />} />
          <Route path="courses/manage" element={<ManageCourses />} />
          <Route path="users" element={<Users />} />
          <Route path="users/progress" element={<UserProgressTab />} />
          <Route path="users/enrollments" element={<UserEnrollmentsTab />} />
          <Route path="assessments/assignments" element={<Assignments />} />
          <Route path="assessments/projects" element={<Projects />} />
          <Route path="assessments/Quizzes" element={<Quizzes />} />
          
          {/* Placeholder routes for admin section */}
          <Route path="reports" element={<PlaceholderPage 
            title="Reports & Analytics"
            message="Detailed reports and analytics dashboard is coming in the next update."
          />} />
          
          <Route path="settings" element={<PlaceholderPage 
            title="System Settings"
            message="Advanced system configuration and settings will be available shortly."
          />} />
        </Route>

        {/* 403 Page */}
        <Route path="/403" element={<ForbiddenPage />} />

        {/* Catch-all 404 route */}
        <Route path="*" element={<ErrorPage />} />

      </Routes>
      
      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;