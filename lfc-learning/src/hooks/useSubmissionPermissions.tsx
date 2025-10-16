// src/hooks/useSubmissionPermissions.ts
import { useState, useCallback } from 'react';

interface SubmissionPermissions {
  canGrade: boolean;
  canView: boolean;
  loading: boolean;
}

export function useSubmissionPermissions() {
  const [permissions, setPermissions] = useState<SubmissionPermissions>({
    canGrade: false,
    canView: false,
    loading: true
  });

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const checkSubmissionPermissions = useCallback(async (courseId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/courses/${courseId}/permissions`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setPermissions({
          canGrade: data.canGrade || data.canManage || false,
          canView: data.canGrade || data.canManage || data.canReview || false,
          loading: false
        });
      } else {
        setPermissions(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error checking submission permissions:', error);
      setPermissions(prev => ({ ...prev, loading: false }));
    }
  }, []);

  return {
    permissions,
    checkSubmissionPermissions
  };
}