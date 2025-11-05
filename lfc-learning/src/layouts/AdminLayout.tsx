import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Admin/Sidebar";
import TopNav from "../components/Admin/TopNav";
import ScrollHint from "../components/shared/ScrollHint";
import NotificationToast from "../components/NotificationToast";
import ManualNotificationModal from "../components/ManualNotificationModal";
import { useManualNotificationToast } from "../hooks/useManualNotificationToast";

export default function AdminLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { toastNotifications, dismissNotification } = useManualNotificationToast();
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewNotification = (notification: any) => {
    setSelectedNotification(notification);
    setShowModal(true);
    dismissNotification(notification._id);
  };

  return (
    <div className="flex h-screen bg-white dark:bg-[var(--bg-elevated)] overflow-hidden">
      <Sidebar 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
      />
      <div className="flex-1 flex flex-col lg:ml-0">
        <TopNav onMenuToggle={() => setIsMobileOpen(!isMobileOpen)} />
        {/* Hide scrollbars but maintain functionality */}
        <main className="flex-1 bg-gray-50 overflow-auto dark:bg-[var(--bg-elevated)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <ScrollHint />
          <Outlet />
        </main>
      </div>
      
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
}