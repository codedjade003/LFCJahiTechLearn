// src/context/NotificationContext.tsx
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface NotificationContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <NotificationContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationRefresh() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationRefresh must be used within a NotificationProvider');
  }
  return context;
}
