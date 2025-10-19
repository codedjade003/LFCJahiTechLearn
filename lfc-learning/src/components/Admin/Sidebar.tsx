// src/components/Admin/Sidebar.tsx
import { useEffect, useState } from "react";
import {
  FaChevronLeft,
  FaTachometerAlt,
  FaBook,
  FaUsers,
  FaClipboardCheck,
  FaChartBar,
  FaCog,
  FaUserGraduate,
  FaSignOutAlt,
  FaChevronDown,
  FaBars,
  FaHeadset,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

interface User {
  name: string;
  email: string;
  profilePicture?: { url: string } | null;
}

export default function Sidebar({ isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [collapsed, setCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleDropdown = (menu: string) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser({
            name: data.name || "Admin User",
            email: data.email || "admin@lfctech.com",
            profilePicture: data.profilePicture || null,
          });
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  const handleProfileClick = () => {
    navigate("/dashboard/profile");
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile header button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 bg-lfc-red dark:bg-[var(--lfc-red)] text-white p-2 rounded-lg shadow-lg"
      >
        <FaBars className="text-lg" />
      </button>

        <div
          className={`sidebar fixed lg:relative ${
            collapsed ? "w-20" : "w-64"
          } bg-white dark:bg-[var(--bg-elevated)] text-gray-900 dark:text-white flex flex-col transition-all duration-300 h-screen z-50 transform ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } shadow-2xl border-r border-gray-200 dark:border-[var(--border-primary)]`}
        >
        {/* Header */}
        <div className="mt-1 flex items-center justify-between p-4 border-b border-gray-200 dark:border-[var(--border-primary)]">
          <div className="flex items-center space-x-3">
            <div className="relative h-10 w-10 bg-lfc-red dark:bg-[var(--lfc-red)] rounded-xl p-1">
              <img 
                src="/logo.png" 
                alt="LFC Jahi Tech" 
                className="filter brightness-0 invert"
              />
            </div>
            {!collapsed && (
              <span className="font-bold text-xl tracking-tight text-lfc-red dark:text-[var(--lfc-red)]">LFC Jahi Tech</span>
            )}
          </div>
          
          {/* Collapse Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] transition-colors text-gray-600 dark:text-gray-400"
          >
            <FaChevronLeft
              className={`transform transition-transform duration-300 ${
                collapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* User Profile */}
        <div 
          onClick={handleProfileClick}
          className="p-4 border-b border-gray-200 dark:border-[var(--border-primary)] bg-gray-50 dark:bg-[var(--bg-tertiary)] cursor-pointer hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] transition-all duration-200 group"
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-full border-2 border-lfc-gold dark:border-[var(--lfc-gold)] animate-pulse opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <img
                src={user?.profilePicture?.url || "/default-avatar.png"}
                alt="Profile"
                className={`w-12 h-12 rounded-full object-cover border-2 border-lfc-gold dark:border-[var(--lfc-gold)] ${
                  !user?.profilePicture?.url ? "filter brightness-0 invert" : ""
                }`}
                onError={(e) => {
                  e.currentTarget.src = "/default-avatar.png";
                  e.currentTarget.classList.add("filter", "brightness-0", "invert");
                }}
              />
            </div>
            
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate text-sm text-gray-900 dark:text-[var(--text-primary)]" title={user?.name || "Admin User"}>
                  {user?.name || "Admin User"}
                </div>
                <div className="text-xs text-gray-600 dark:text-[var(--text-tertiary)] truncate" title={user?.email || ""}>
                  {user?.email}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <div className="p-2">
            <Link
              to="/admin/dashboard"
              className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] text-gray-700 dark:text-[var(--text-secondary)] hover:text-lfc-red dark:hover:text-[var(--lfc-red)] transition-colors text-sm md:text-base"
            >
              <FaTachometerAlt />
              {!collapsed && <span className="ml-3">Dashboard</span>}
            </Link>

            {/* Courses Dropdown */}
            <div>
              <button
                onClick={() => toggleDropdown("courses")}
                className="flex items-center justify-between w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] text-gray-700 dark:text-[var(--text-secondary)] hover:text-lfc-red dark:hover:text-[var(--lfc-red)] transition-colors text-sm md:text-base"
              >
                <div className="flex items-center">
                  <FaBook />
                  {!collapsed && <span className="ml-3">Courses</span>}
                </div>
                {!collapsed && <FaChevronDown className="text-xs" />}
              </button>
              {openDropdown === "courses" && !collapsed && (
                <div className="pl-8">
                  <Link
                    to="/admin/dashboard/courses/manage"
                    className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] text-gray-600 dark:text-[var(--text-tertiary)] hover:text-lfc-red dark:hover:text-[var(--lfc-red)] transition-colors text-sm"
                  >
                    Manage Courses
                  </Link>
                  <Link
                    to="/admin/dashboard/courses/new"
                    className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] text-gray-600 dark:text-[var(--text-tertiary)] hover:text-lfc-red dark:hover:text-[var(--lfc-red)] transition-colors text-sm"
                  >
                    Add New Course
                  </Link>
                </div>
              )}
            </div>

            {/* Users Dropdown */}
            <div>
              <button
                onClick={() => toggleDropdown("users")}
                className="flex items-center justify-between w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] text-gray-700 dark:text-[var(--text-secondary)] hover:text-lfc-red dark:hover:text-[var(--lfc-red)] transition-colors text-sm md:text-base"
              >
                <div className="flex items-center">
                  <FaUsers />
                  {!collapsed && <span className="ml-3">Users</span>}
                </div>
                {!collapsed && <FaChevronDown className="text-xs" />}
              </button>
              {openDropdown === "users" && !collapsed && (
                <div className="pl-8">
                  <Link
                    to="/admin/dashboard/users"
                    className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] text-gray-600 dark:text-[var(--text-tertiary)] hover:text-lfc-red dark:hover:text-[var(--lfc-red)] transition-colors text-sm"
                  >
                    Manage Users
                  </Link>
                  <Link
                    to="/admin/dashboard/users/progress"
                    className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] text-gray-600 dark:text-[var(--text-tertiary)] hover:text-lfc-red dark:hover:text-[var(--lfc-red)] transition-colors text-sm"
                  >
                    User Progress
                  </Link>
                  <Link
                    to="/admin/dashboard/users/enrollments"
                    className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] text-gray-600 dark:text-[var(--text-tertiary)] hover:text-lfc-red dark:hover:text-[var(--lfc-red)] transition-colors text-sm"
                  >
                    Enrollments
                  </Link>
                </div>
              )}
            </div>

            {/* Assessments Dropdown */}
            <div>
              <button
                onClick={() => toggleDropdown("assessments")}
                className="flex items-center justify-between w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] text-gray-700 dark:text-[var(--text-secondary)] hover:text-lfc-red dark:hover:text-[var(--lfc-red)] transition-colors text-sm md:text-base"
              >
                <div className="flex items-center">
                  <FaClipboardCheck />
                  {!collapsed && <span className="ml-3">Assessments</span>}
                </div>
                {!collapsed && <FaChevronDown className="text-xs" />}
              </button>
              {openDropdown === "assessments" && !collapsed && (
                <div className="pl-8">
                  <Link
                    to="/admin/dashboard/assessments/assignments"
                    className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] text-gray-600 dark:text-[var(--text-tertiary)] hover:text-lfc-red dark:hover:text-[var(--lfc-red)] transition-colors text-sm"
                  >
                    Assignments
                  </Link>
                  <Link
                    to="/admin/dashboard/assessments/projects"
                    className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] text-gray-600 dark:text-[var(--text-tertiary)] hover:text-lfc-red dark:hover:text-[var(--lfc-red)] transition-colors text-sm"
                  >
                    Projects
                  </Link>
                  <Link
                    to="/admin/dashboard/assessments/quizzes"
                    className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] text-gray-600 dark:text-[var(--text-tertiary)] hover:text-lfc-red dark:hover:text-[var(--lfc-red)] transition-colors text-sm"
                  >
                    Quizzes
                  </Link>
                  <Link
                    to="/admin/dashboard/assessments/exams"
                    className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] text-gray-600 dark:text-[var(--text-tertiary)] hover:text-lfc-red dark:hover:text-[var(--lfc-red)] transition-colors text-sm"
                  >
                    Final Exams
                  </Link>
                </div>
              )}
            </div>

            {/* Simple Links */}
            <Link to="/admin/dashboard/survey-responses" className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] text-gray-700 dark:text-[var(--text-secondary)] hover:text-lfc-red dark:hover:text-[var(--lfc-red)] transition-colors text-sm md:text-base">
              <FaClipboardCheck />
              {!collapsed && <span className="ml-3">Survey Responses</span>}
            </Link>
            <Link to="/admin/dashboard/support" className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] text-gray-700 dark:text-[var(--text-secondary)] hover:text-lfc-red dark:hover:text-[var(--lfc-red)] transition-colors text-sm md:text-base">
              <FaHeadset />
              {!collapsed && <span className="ml-3">Support Tickets</span>}
            </Link>
            <Link
              to="/admin/dashboard/reports"
              className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] text-gray-700 dark:text-[var(--text-secondary)] hover:text-lfc-red dark:hover:text-[var(--lfc-red)] transition-colors text-sm md:text-base"
            >
              <FaChartBar />
              {!collapsed && <span className="ml-3">Reports</span>}
            </Link>

            <Link
              to="/admin/dashboard/settings"
              className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] text-gray-700 dark:text-[var(--text-secondary)] hover:text-lfc-red dark:hover:text-[var(--lfc-red)] transition-colors text-sm md:text-base"
            >
              <FaCog />
              {!collapsed && <span className="ml-3">Settings</span>}
            </Link>
          </div>
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-[var(--border-primary)] space-y-2 pb-safe">
          {/* Switch to Student Mode */}
          <Link
            to="/dashboard"
            className="flex items-center p-3 rounded-xl hover:bg-lfc-gold hover:text-white dark:hover:bg-[var(--lfc-gold)] dark:hover:text-gray-900 transition-all duration-200 group text-gray-700 dark:text-[var(--text-secondary)]"
          >
            <FaUserGraduate className="text-lg flex-shrink-0" />
            {!collapsed && (
              <span className="ml-3 font-medium text-sm">Student Mode</span>
            )}
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 rounded-xl hover:bg-red-600 dark:hover:bg-red-700 hover:text-white transition-all duration-200 group text-gray-700 dark:text-[var(--text-secondary)]"
          >
            <FaSignOutAlt className="text-lg flex-shrink-0" />
            {!collapsed && (
              <span className="ml-3 font-medium text-sm">Logout</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}