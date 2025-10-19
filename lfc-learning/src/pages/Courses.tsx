// src/pages/Admin/Course.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaInfoCircle,
  FaListAlt,
  FaTasks,
  FaProjectDiagram,
  FaCog,
  FaCheckCircle,
  FaChevronRight,
  FaBars,
} from "react-icons/fa";
import CourseInfoTab from "../components/Admin/CourseTabs/CourseInfoTab.tsx";
import CourseContentTab from "../components/Admin/CourseTabs/CourseContentTab.tsx";
import CourseAssignmentsTab from "../components/Admin/CourseTabs/CourseAssignmentsTab.tsx";
import CourseProjectsTab from "../components/Admin/CourseTabs/CourseProjectsTab.tsx";
import CourseSettingsTab from "../components/Admin/CourseTabs/CourseSettingsTab.tsx";
import CoursePublishTab from "../components/Admin/CourseTabs/CoursePublishTab.tsx";
import OnboardingTour from "../components/shared/OnboardingTour";
import { courseManagementTour } from "../config/onboardingTours";

export default function Course() {
  const [activeTab, setActiveTab] = useState("info");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [, setCourseCreated] = useState(false);
  const navigate = useNavigate();

  const tabs = [
    { key: "info", label: "Details", icon: <FaInfoCircle /> },
    { key: "content", label: "Content", icon: <FaListAlt /> },
    { key: "assignments", label: "Assignments", icon: <FaTasks /> },
    { key: "project", label: "Projects", icon: <FaProjectDiagram /> },
    { key: "settings", label: "Settings", icon: <FaCog /> },
    { key: "publish", label: "Publish", icon: <FaCheckCircle /> },
  ];

  const handleCourseCreated = (id: string) => {
    setCourseId(id);
    setCourseCreated(true);
    setActiveTab("content"); // Automatically move to content tab after creation
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "info":
        return <CourseInfoTab onCourseCreated={handleCourseCreated} />;
      case "content":
        return <CourseContentTab courseId={courseId} />;
      case "assignments":
        return courseId ? <CourseAssignmentsTab courseId={courseId} /> : <div>Please create a course first to add assignments.</div>;
      case "project":
        return courseId ? <CourseProjectsTab courseId={courseId} /> : <div>Please create a course first to add projects.</div>;
      case "settings":
        return courseId ? <CourseSettingsTab courseId={courseId} /> : <div>Please create a course first to adjust settings.</div>;
      case "publish":
        return courseId ? <CoursePublishTab courseId={courseId} /> : <div>Please create a course first to publish it.</div>;
      default:
        return null;
    }
  };

  const activeIndex = tabs.findIndex((tab) => tab.key === activeTab);
  const progressPercent = ((activeIndex + 1) / tabs.length) * 100;

  return (
    <div className="flex flex-col h-full bg-yt-light-gray dark:bg-gray-900 text-yt-text-dark dark:text-gray-100">
      {/* Onboarding Tour */}
      <OnboardingTour tourKey="courseManagement" steps={courseManagementTour} />
      
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-yt-light-border dark:border-gray-700 bg-white dark:bg-[var(--bg-elevated)] shadow-sm">
        <div className="flex items-center">
          <button 
            className="md:hidden mr-3 p-2 rounded-md text-yt-text-dark hover:bg-yt-light-hover"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <FaBars />
          </button>
          <div className="p-2 rounded-full bg-lfc-red dark:bg-red-800 text-white mr-3">
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path
                fill="currentColor"
                d="M3 18v-12c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1zM16 18h2c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1h-2v14z"
              />
            </svg>
          </div>
          <h1 className="text-lg font-medium">Course Uploads</h1>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className={`absolute md:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-[var(--bg-elevated)] border-r border-yt-light-border dark:border-gray-700 flex-shrink-0 overflow-y-auto shadow-sm transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <nav className="p-3">
            <div className="mb-6">
              <h2 className="px-3 py-2 text-xs font-medium text-yt-text-light uppercase tracking-wider">Course Setup</h2>
              <ul>
                {tabs.map((tab) => (
                  <li key={tab.key}>
                    <button
                      onClick={() => {
                        setActiveTab(tab.key);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center px-3 py-3 rounded-lg text-sm mb-1 transition-colors ${
                        activeTab === tab.key
                          ? "bg-gray-100 dark:bg-gray-700 text-lfc-gold font-medium shadow-sm"
                          : "text-yt-text-dark hover:bg-yt-light-hover"
                      }`}
                    >
                      <span className={`mr-3 ${activeTab === tab.key ? "text-lfc-gold" : "text-yt-text-gray"}`}>{tab.icon}</span>
                      {tab.label}
                      {activeTab === tab.key && (
                        <FaChevronRight className="ml-auto text-xs text-lfc-gold" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </aside>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-30 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-yt-light-bg p-3 md:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Progress indicator */}
            <div className="mb-6 bg-white dark:bg-[var(--bg-elevated)] p-4 md:p-5 rounded-lg shadow-sm border border-yt-light-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs md:text-sm text-yt-text-gray">Step {activeIndex + 1} of {tabs.length}</span>
                <span className="text-xs md:text-sm font-medium text-lfc-gold">{tabs[activeIndex].label}</span>
              </div>
              <div className="relative w-full h-2 bg-yt-progress-light-bg rounded-full">
                <div
                  className="absolute h-2 bg-lfc-gold rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Content Header */}
            <div className="mb-6 bg-white dark:bg-[var(--bg-elevated)] p-4 md:p-5 rounded-lg shadow-sm border border-yt-light-border">
              <h2 className="text-xl md:text-2xl font-medium mb-2 text-yt-text-dark">{tabs[activeIndex].label}</h2>
              <p className="text-yt-text-gray text-xs md:text-sm">
                {activeTab === "info" && "Add basic information about your course"}
                {activeTab === "content" && (courseId 
                  ? "Upload and organize your course content" 
                  : "Please create a course first to add content")}
                {activeTab === "assignments" && (courseId 
                  ? "Create and manage assignments" 
                  : "Please create a course first to add assignments")}
                {activeTab === "project" && (courseId 
                  ? "Set up course projects" 
                  : "Please create a course first to add projects")}
                {activeTab === "settings" && (courseId 
                  ? "Set up course settings" 
                  : "Please create a course first to adjust settings")}
                {activeTab === "publish" && "Review and publish your course"}
              </p>
            </div>

            {/* Active Tab Content */}
            <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg p-4 md:p-6 border border-yt-light-border shadow-sm">
              {renderTabContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6 md:mt-8">
              <button
                onClick={() => {
                  const prevIndex = Math.max(0, activeIndex - 1);
                  setActiveTab(tabs[prevIndex].key);
                }}
                disabled={activeIndex === 0}
                className={`px-4 py-2 md:px-6 md:py-2.5 rounded-md font-medium border text-sm ${
                  activeIndex === 0
                    ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-600 text-gray-300 border-gray-200"
                    : "bg-white text-yt-text-dark border-yt-light-border hover:bg-yt-light-hover dark:bg-[var(--bg-elevated)] dark:hover:bg-lfc-gold"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => {
                  if (activeIndex === tabs.length - 1) {
                    // 👇 redirect instead of publishing
                    navigate("/admin/dashboard/courses/manage");
                  } else {
                    const nextIndex = Math.min(tabs.length - 1, activeIndex + 1);
                    setActiveTab(tabs[nextIndex].key);
                  }
                }}
                disabled={activeTab === "content" && !courseId}
                className={`px-4 py-2 md:px-6 md:py-2.5 rounded-md font-medium transition-colors text-sm ${
                  activeTab === "content" && !courseId
                    ? "opacity-50 cursor-not-allowed bg-gray-400"
                    : "bg-lfc-red hover:bg-lfc-gold text-white"
                }`}
              >
                {activeIndex === tabs.length - 1 ? "Close" : "Next Step"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}