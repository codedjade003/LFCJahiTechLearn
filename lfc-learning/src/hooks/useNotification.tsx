// src/hooks/useNotification.ts
import { useState, useCallback } from 'react';

interface NotificationState {
  message: string;
  type: 'error' | 'success' | 'warning';
  visible: boolean;
}

export function useNotification() {
  const [notification, setNotification] = useState<NotificationState>({
    message: '',
    type: 'error',
    visible: false
  });

  const showNotification = useCallback((message: string, type: 'error' | 'success' | 'warning' = 'error') => {
    setNotification({ message, type, visible: true });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, visible: false }));
  }, []);

  return {
    notification,
    showNotification,
    hideNotification
  };
}