// src/layouts/StudentLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Dashboard/SideBar";
import Topbar from "../components/Dashboard/TopBar";
import { useState } from "react";
import SupportChatWidget from "../components/Dashboard/SupportChatWidget";
import ScrollHint from "../components/shared/ScrollHint";
import NotificationToast from "../components/NotificationToast";
import ManualNotificationModal from "../components/ManualNotificationModal";
import { useManualNotificationToast } from "../hooks/useManualNotificationToast";

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toastNotifications, dismissNotification } = useManualNotificationToast();
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewNotification = (notification: any) => {
    setSelectedNotification(notification);
    setShowModal(true);
    dismissNotification(notification._id);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[var(--bg-primary)]">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden relative">

        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto relative z-0">
          <ScrollHint />
          <Outlet />
        </main>
      </div>
                  
      {/* Add the chat widget */}
      <SupportChatWidget />
      
      {/* Notification Toasts */}
      <NotificationToast
        notifications={toastNotifications}
        onClose={dismissNotification}
        onView={handleViewNotification}
      />
      
      {/* Manual Notification Modal */}
      <ManualNotificationModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedNotification(null);
        }}
        notification={selectedNotification}
      />
    </div>
  );
};

export default StudentLayout;
