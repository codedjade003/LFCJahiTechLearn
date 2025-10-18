// src/context/OnboardingContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface OnboardingProgress {
  dashboard: boolean;
  courses: boolean;
  courseDetails: boolean;
  profile: boolean;
  assessments: boolean;
  adminDashboard: boolean;
  courseManagement: boolean;
  userManagement: boolean;
  assessmentGrading: boolean;
  supportTickets: boolean;
  adminSupport: boolean;
}

interface OnboardingContextType {
  progress: OnboardingProgress;
  isFirstLogin: boolean;
  shouldShowTour: (tourKey: keyof OnboardingProgress) => boolean;
  completeTour: (tourKey: keyof OnboardingProgress) => Promise<void>;
  skipAllTours: () => Promise<void>;
  resetProgress: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  
  const [progress, setProgress] = useState<OnboardingProgress>({
    dashboard: false,
    courses: false,
    courseDetails: false,
    profile: false,
    assessments: false,
    adminDashboard: false,
    courseManagement: false,
    userManagement: false,
    assessmentGrading: false,
    supportTickets: false,
    adminSupport: false,
  });

  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [onboardingEnabled, setOnboardingEnabled] = useState(true);

  // Fetch onboarding progress from backend
  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        
        // If user hasn't seen onboarding, force dashboard tour to false so it shows
        let userProgress = data.onboardingProgress || progress;
        if (!data.hasSeenOnboarding && userProgress.dashboard) {
          userProgress = { ...userProgress, dashboard: false };
        }
        
        setProgress(userProgress);
        setIsFirstLogin(data.firstLogin || false);
        setOnboardingEnabled(data.preferences?.onboardingEnabled !== false);
      }
    } catch (err) {
      console.error("Error fetching onboarding progress:", err);
    } finally {
      setLoading(false);
    }
  };

  const shouldShowTour = (tourKey: keyof OnboardingProgress): boolean => {
    if (loading) return false;
    if (!onboardingEnabled) return false; // Respect user preference
    // Show tour if user hasn't completed it yet
    return !progress[tourKey];
  };

  const completeTour = async (tourKey: keyof OnboardingProgress) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Update locally first for immediate feedback
      setProgress((prev) => ({
        ...prev,
        [tourKey]: true,
      }));

      // Save to backend
      await fetch(`${API_BASE}/api/users/onboarding/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tourKey }),
      });

      // Check if all tours are completed
      const allCompleted = Object.values({ ...progress, [tourKey]: true }).every(
        (val) => val === true
      );

      if (allCompleted) {
        // Mark user as fully onboarded
        await fetch(`${API_BASE}/api/users/onboarding/finish`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.error("Error completing tour:", err);
    }
  };

  const skipAllTours = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Mark all tours as completed locally
      const allCompleted: OnboardingProgress = {
        dashboard: true,
        courses: true,
        courseDetails: true,
        profile: true,
        assessments: true,
        adminDashboard: true,
        courseManagement: true,
        userManagement: true,
        assessmentGrading: true,
        supportTickets: true,
        adminSupport: true,
      };

      setProgress(allCompleted);

      // Save to backend
      await fetch(`${API_BASE}/api/users/onboarding/skip-all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("Error skipping tours:", err);
    }
  };

  const resetProgress = () => {
    setProgress({
      dashboard: false,
      courses: false,
      courseDetails: false,
      profile: false,
      assessments: false,
      adminDashboard: false,
      courseManagement: false,
      userManagement: false,
      assessmentGrading: false,
      supportTickets: false,
      adminSupport: false,
    });
  };

  return (
    <OnboardingContext.Provider
      value={{
        progress,
        isFirstLogin,
        shouldShowTour,
        completeTour,
        skipAllTours,
        resetProgress,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
