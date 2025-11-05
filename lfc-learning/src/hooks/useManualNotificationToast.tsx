import { useState, useEffect } from "react";

interface ManualNotification {
  _id: string;
  title: string;
  message?: string;
  createdAt: string;
  manual: boolean;
}

export function useManualNotificationToast() {
  const [toastNotifications, setToastNotifications] = useState<ManualNotification[]>([]);
  const [dismissedToday, setDismissedToday] = useState<Set<string>>(new Set());
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    // Check if user has disabled notifications in preferences
    const notificationsEnabled = localStorage.getItem("notificationsEnabled") !== "false";
    if (!notificationsEnabled) return;

    // Load dismissed notifications for today
    const today = new Date().toDateString();
    const stored = localStorage.getItem(`dismissedNotifications_${today}`);
    if (stored) {
      setDismissedToday(new Set(JSON.parse(stored)));
    }

    // Fetch manual notifications
    fetchManualNotifications();

    // Listen for new manual notifications
    const handleNewNotification = () => {
      fetchManualNotifications();
    };
    window.addEventListener("notificationUpdate", handleNewNotification);
    
    return () => {
      window.removeEventListener("notificationUpdate", handleNewNotification);
    };
  }, []);

  const fetchManualNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/notifications/my?source=manual&limit=10`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const manualNotifs = data.notifications.filter((n: ManualNotification) => 
          n.manual && !dismissedToday.has(n._id)
        );
        
        // Only show notifications from today
        const today = new Date().toDateString();
        const todayNotifs = manualNotifs.filter((n: ManualNotification) => 
          new Date(n.createdAt).toDateString() === today
        );
        
        setToastNotifications(todayNotifs);
      }
    } catch (error) {
      console.error("Error fetching manual notifications:", error);
    }
  };

  const dismissNotification = (id: string) => {
    setToastNotifications(prev => prev.filter(n => n._id !== id));
    
    const newDismissed = new Set(dismissedToday);
    newDismissed.add(id);
    setDismissedToday(newDismissed);
    
    // Save to localStorage
    const today = new Date().toDateString();
    localStorage.setItem(`dismissedNotifications_${today}`, JSON.stringify([...newDismissed]));
  };

  return {
    toastNotifications,
    dismissNotification,
  };
}
