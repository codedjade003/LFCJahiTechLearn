// src/pages/Admin/Users.tsx
import { useState, useEffect } from "react";
import { FaUsers, FaUserPlus, FaShieldAlt, FaClipboardList, FaChevronRight, FaBars } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import AllUsersTab from "../../components/Admin/UsersTabs/AllUsersTab.tsx";
import AddUsersTab from "../../components/Admin/UsersTabs/AddUsersTab.tsx";
import AccessSettingsTab from "../../components/Admin/UsersTabs/AccessSettingsTab.tsx";
import LogsTab from "../../components/Admin/UsersTabs/LogsTab.tsx";
import OnboardingTour from "../../components/shared/OnboardingTour";
import type { Step } from "react-joyride";

const userManagementTour: Step[] = [
  {
    target: "body",
    content: "Welcome to User Management! Here you can view all users, add new users, manage access settings, and view activity logs.",
    placement: "center",
  },
  {
    target: "aside",
    content: "Use these tabs to navigate: All Users shows everyone, Add Users lets you create accounts, Access Settings manages roles, and Logs tracks user activities.",
    placement: "right",
  },
];

export default function Users() {
  const [activeTab, setActiveTab] = useState("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Check for tab state from navigation
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const tabs = [
    { key: "all", label: "All Users", icon: <FaUsers /> },
    { key: "add", label: "Add Users", icon: <FaUserPlus /> },
    { key: "access", label: "Access Settings", icon: <FaShieldAlt /> },
    { key: "logs", label: "Logs", icon: <FaClipboardList /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "all":
        return <AllUsersTab />;
      case "add":
        return <AddUsersTab />;
      case "access":
        return <AccessSettingsTab />;
      case "logs":
        return <LogsTab />;
      default:
        return null;
    }
  };

  const activeIndex = tabs.findIndex((tab) => tab.key === activeTab);

  return (
    <div className="container flex flex-col min-min-h-full bg-yt-light-gray text-yt-text-dark">
      {/* Onboarding Tour */}
      <OnboardingTour tourKey="userManagement" steps={userManagementTour} />
      
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-yt-light-border bg-white dark:bg-[var(--bg-elevated)] shadow-sm">
        <div className="flex items-center">
          <button
            className="md:hidden mr-3 p-2 rounded-md text-yt-text-dark hover:bg-yt-light-hover"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <FaBars />
          </button>
          <div className="p-2 rounded-full bg-lfc-red text-white mr-3">
            <FaUsers className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-medium">User Management</h1>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <aside
          className={`absolute md:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-yt-light-border flex-shrink-0 overflow-y-auto shadow-sm transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <nav className="p-3">
            <div className="mb-6">
              <h2 className="px-3 py-2 text-xs font-medium text-yt-text-light uppercase tracking-wider">
                User Controls
              </h2>
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
                          ? "bg-gray-100 text-lfc-gold font-medium shadow-sm"
                          : "text-yt-text-dark hover:bg-yt-light-hover"
                      }`}
                    >
                      <span
                        className={`mr-3 ${
                          activeTab === tab.key ? "text-lfc-gold" : "text-yt-text-gray"
                        }`}
                      >
                        {tab.icon}
                      </span>
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
          <div className="max-w-5xl mx-auto">
            {/* Content Header */}
            <div className="mb-6 bg-white dark:bg-[var(--bg-elevated)] p-4 md:p-5 rounded-lg shadow-sm border border-yt-light-border">
              <h2 className="text-xl md:text-2xl font-medium mb-2 text-yt-text-dark">
                {tabs[activeIndex].label}
              </h2>
              <p className="text-yt-text-gray text-xs md:text-sm">
                {activeTab === "all" && "View, search and manage all registered users."}
                {activeTab === "add" && "Add a single user or upload users in bulk."}
                {activeTab === "access" && "Manage user roles and access levels."}
                {activeTab === "logs" && "View user activity logs and login history."}
              </p>
            </div>

            {/* Active Tab Content */}
            <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg p-4 md:p-6 border border-yt-light-border shadow-sm">
              {renderTabContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
