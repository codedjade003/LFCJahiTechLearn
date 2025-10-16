// src/hooks/useCoursePermissions.ts
import { useState, useCallback } from 'react';

interface CoursePermissions {
  canManage: boolean;
  canGrade: boolean;
  canReview: boolean;
  isInstructor: boolean;
  loading: boolean;
}

export function useCoursePermissions() {
  const [permissions, setPermissions] = useState<CoursePermissions>({
    canManage: false,
    canGrade: false,
    canReview: false,
    isInstructor: false,
    loading: true
  });

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const checkCoursePermissions = useCallback(async (courseId: string) => {
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
          canManage: data.canManage || false,
          canGrade: data.canGrade || false,
          canReview: data.canReview || false,
          isInstructor: data.isInstructor || false,
          loading: false
        });
      } else {
        setPermissions(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error checking course permissions:', error);
      setPermissions(prev => ({ ...prev, loading: false }));
    }
  }, []);

  return {
    permissions,
    checkCoursePermissions
  };
}