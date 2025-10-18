// src/components/Admin/CourseEditor.tsx
import { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaInfoCircle,
  FaListAlt,
  FaTasks,
  FaProjectDiagram,
  FaCog,
  FaCheckCircle,
  FaChevronRight,
  FaBars,
} from "react-icons/fa";
import EditCourseInfoTab from "./CourseTabs/Edit/EditCourseInfoTab";
import EditCourseContentTab from "./CourseTabs/Edit/EditCourseContentTab";
import CourseAssignmentsTab from "./CourseTabs/CourseAssignmentsTab";
import CourseProjectsTab from "./CourseTabs/CourseProjectsTab";
import CourseSettingsTab from "./CourseTabs/CourseSettingsTab";
import CoursePublishTab from "./CourseTabs/CoursePublishTab";

interface CourseEditorProps {
  courseId: string;
  onBack: () => void;
  onCourseUpdated: () => void;
}

export default function CourseEditor({ courseId, onBack, onCourseUpdated }: CourseEditorProps) {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const tabs = [
    { key: "info", label: "Details", icon: <FaInfoCircle /> },
    { key: "content", label: "Content", icon: <FaListAlt /> },
    { key: "assignments", label: "Assignments", icon: <FaTasks /> },
    { key: "project", label: "Projects", icon: <FaProjectDiagram /> },
    { key: "settings", label: "Settings", icon: <FaCog /> },
    { key: "publish", label: "Publish", icon: <FaCheckCircle /> },
  ];

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/courses/${courseId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setSelectedCourse(data);
      } else {
        console.error("Failed to fetch course data");
      }
    } catch (err) {
      console.error("Error fetching course data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseUpdated = () => {
    // Refresh the course data
    fetchCourseData();
    // Notify parent component
    onCourseUpdated();
  };

  const handleBack = () => {
    onBack();
  };

  const activeIndex = tabs.findIndex((tab) => tab.key === activeTab);
  const progressPercent = ((activeIndex + 1) / tabs.length) * 100;

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-yt-light-hover rounded"></div>
          <div className="h-32 bg-yt-light-hover rounded"></div>
          <div className="h-8 bg-yt-light-hover rounded"></div>
        </div>
      );
    }

    switch (activeTab) {
      case "info":
        return (
          <EditCourseInfoTab 
            course={selectedCourse} 
            onCourseUpdated={handleCourseUpdated}
            onBack={handleBack}
          />
        );
      case "content":
        return <EditCourseContentTab courseId={courseId} />;
      case "assignments":
        return <CourseAssignmentsTab courseId={courseId} />;
      case "project":
        return <CourseProjectsTab courseId={courseId} />;
      case "settings":
        return <CourseSettingsTab courseId={courseId} />;
      case "publish":
        return <CoursePublishTab courseId={courseId}/>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-min-h-full bg-yt-light-gray dark:bg-[var(--bg-primary)] text-yt-text-dark dark:text-[var(--text-primary)]">
        <header className="flex items-center justify-between px-4 py-3 border-b border-yt-light-border bg-white dark:bg-[var(--bg-elevated)] shadow-sm">
          <div className="flex items-center">
            <button 
              onClick={onBack}
              className="mr-3 p-2 rounded-md text-yt-text-dark dark:text-[var(--text-primary)] hover:bg-yt-light-hover dark:hover:bg-[var(--hover-bg)]"
            >
              <FaArrowLeft />
            </button>
            <button 
              className="md:hidden mr-3 p-2 rounded-md text-yt-text-dark dark:text-[var(--text-primary)] hover:bg-yt-light-hover dark:hover:bg-[var(--hover-bg)]"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <FaBars />
            </button>
            <div className="p-2 rounded-full bg-lfc-red text-white mr-3">
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path
                  fill="currentColor"
                  d="M3 18v-12c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1zM16 18h2c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1h-2v14z"
                />
              </svg>
            </div>
            <h1 className="text-lg font-medium">Course Editor</h1>
          </div>
        </header>

        <div className="flex flex-1 relative">
          <aside className={`absolute md:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-[var(--bg-elevated)] border-r border-yt-light-border dark:border-[var(--border-primary)] flex-shrink-0 overflow-y-auto shadow-sm transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
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
                            ? "bg-gray-100 dark:bg-[var(--bg-tertiary)] text-lfc-gold dark:text-[var(--lfc-gold)] font-medium shadow-sm"
                            : "text-yt-text-dark dark:text-[var(--text-primary)] hover:bg-yt-light-hover dark:hover:bg-[var(--hover-bg)]"
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

          {isSidebarOpen && (
            <div 
              className="absolute inset-0 bg-black bg-opacity-30 z-20 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          <main className="flex-1 overflow-y-auto bg-yt-light-bg dark:bg-[var(--bg-primary)] p-3 md:p-6">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-yt-light-hover rounded"></div>
                <div className="h-32 bg-yt-light-hover rounded"></div>
                <div className="h-8 bg-yt-light-hover rounded"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-min-h-full bg-yt-light-gray dark:bg-[var(--bg-primary)] text-yt-text-dark dark:text-[var(--text-primary)]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-yt-light-border bg-white dark:bg-[var(--bg-elevated)] shadow-sm">
        <div className="flex items-center">
          <button 
            onClick={onBack}
            className="mr-3 p-2 rounded-md text-yt-text-dark dark:text-[var(--text-primary)] hover:bg-yt-light-hover dark:hover:bg-[var(--hover-bg)]"
          >
            <FaArrowLeft />
          </button>
          <button 
            className="md:hidden mr-3 p-2 rounded-md text-yt-text-dark dark:text-[var(--text-primary)] hover:bg-yt-light-hover dark:hover:bg-[var(--hover-bg)]"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <FaBars />
          </button>
          <div className="p-2 rounded-full bg-lfc-red text-white mr-3">
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path
                fill="currentColor"
                d="M3 18v-12c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1zM16 18h2c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1h-2v14z"
              />
            </svg>
          </div>
          <h1 className="text-lg font-medium">Course Editor</h1>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className={`absolute md:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-[var(--bg-elevated)] border-r border-yt-light-border dark:border-[var(--border-primary)] flex-shrink-0 overflow-y-auto shadow-sm transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
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
                          ? "bg-gray-100 dark:bg-[var(--bg-tertiary)] text-lfc-gold dark:text-[var(--lfc-gold)] font-medium shadow-sm"
                          : "text-yt-text-dark dark:text-[var(--text-primary)] hover:bg-yt-light-hover dark:hover:bg-[var(--hover-bg)]"
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
        <main className="flex-1 overflow-y-auto bg-yt-light-bg dark:bg-[var(--bg-primary)] p-3 md:p-6">
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
                {activeTab === "info" && "Edit basic information about your course"}
                {activeTab === "content" && "Upload and organize your course content"}
                {activeTab === "assignments" && "Create and manage assignments"}
                {activeTab === "project" && "Set up course projects"}
                {activeTab === "settings" && "Configure course settings and preferences"}
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
                    ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-[var(--bg-tertiary)] text-gray-400 border-gray-200 dark:border-[var(--border-primary)]"
                    : "bg-white text-yt-text-dark border-yt-light-border hover:bg-yt-light-hover"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => {
                  const nextIndex = Math.min(tabs.length - 1, activeIndex + 1);
                  setActiveTab(tabs[nextIndex].key);
                }}
                className={`px-4 py-2 md:px-6 md:py-2.5 rounded-md font-medium transition-colors text-sm ${
                  activeIndex === tabs.length - 1 
                    ? "bg-lfc-red hover:bg-lfc-gold text-white"
                    : "bg-lfc-red hover:bg-lfc-gold text-white"
                }`}
              >
                {activeIndex === tabs.length - 1 ? "Publish Course" : "Next Step"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}