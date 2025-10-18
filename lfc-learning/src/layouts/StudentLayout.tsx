// src/layouts/StudentLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Dashboard/SideBar";
import Topbar from "../components/Dashboard/TopBar";
import { useState } from "react";
import SupportChatWidget from "../components/Dashboard/SupportChatWidget";

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[var(--bg-primary)]">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">

        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
                  
      {/* Add the chat widget */}
      <SupportChatWidget />
    </div>
  );
};

export default StudentLayout;
