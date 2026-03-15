// src/components/shared/OnboardingTour.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import Joyride, { STATUS, ACTIONS, EVENTS, type Step, type CallBackProps } from "react-joyride";
import { useOnboarding } from "../../context/OnboardingContext";
import { useTheme } from "../../context/ThemeContext";

interface OnboardingTourProps {
  tourKey: keyof ReturnType<typeof useOnboarding>["progress"];
  steps: Step[];
  continuous?: boolean;
  showProgress?: boolean;
  showSkipButton?: boolean;
  disableScrolling?: boolean;
  scrollToFirstStep?: boolean;
}

export default function OnboardingTour({
  tourKey,
  steps,
  continuous = true,
  showProgress = true,
  showSkipButton = true,
  disableScrolling = false,
  scrollToFirstStep = false,
}: OnboardingTourProps) {
  const { shouldShowTour, completeTour, skipAllTours } = useOnboarding();
  const { theme } = useTheme();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const isDarkMode = theme === "dark";
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  
  const clearScrollLocks = useCallback(() => {
    document.body.style.overflow = "";
    document.body.style.overflowX = "";
    document.body.style.overflowY = "";
    document.body.style.position = "";
    document.body.style.width = "";
    document.documentElement.style.overflow = "";
    document.documentElement.style.overflowX = "";
    document.documentElement.style.overflowY = "";
  }, []);

  useEffect(() => {
    // Small delay to ensure DOM elements are rendered
    const timer = setTimeout(() => {
      if (shouldShowTour(tourKey)) {
        setStepIndex(0);
        setRun(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [tourKey, shouldShowTour]);

  useEffect(() => {
    return () => {
      clearScrollLocks();
    };
  }, [clearScrollLocks]);

  useEffect(() => {
    if (!run) {
      clearScrollLocks();
    }
  }, [run, clearScrollLocks]);

  const cardStyles = useMemo(
    () => ({
      options: {
        primaryColor: "#C8102E",
        textColor: isDarkMode ? "#E5E7EB" : "#2B2F36",
        backgroundColor: isDarkMode ? "#1A1D22" : "#FFFFFF",
        overlayColor: isDarkMode ? "rgba(0, 0, 0, 0.72)" : "rgba(0, 0, 0, 0.5)",
        arrowColor: isDarkMode ? "#1A1D22" : "#FFFFFF",
        zIndex: 20000,
      },
      tooltip: {
        borderRadius: "12px",
        padding: "20px",
        boxShadow: isDarkMode
          ? "0 20px 40px rgba(0, 0, 0, 0.45)"
          : "0 20px 40px rgba(16, 24, 40, 0.2)",
        border: isDarkMode ? "1px solid #30343A" : "1px solid #E6E7EA",
      },
      tooltipContainer: {
        textAlign: "left" as const,
        fontSize: "14px",
        lineHeight: 1.55,
      },
      buttonNext: {
        backgroundColor: "#C8102E",
        borderRadius: "8px",
        padding: "8px 16px",
        fontSize: "13px",
        fontWeight: 600,
      },
      buttonBack: {
        color: isDarkMode ? "#D1D5DB" : "#4B5563",
        marginRight: "10px",
      },
      buttonSkip: {
        color: isDarkMode ? "#A9AEB8" : "#6B7280",
      },
    }),
    [isDarkMode]
  );

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status, action, type, index } = data;

    if (type === EVENTS.STEP_AFTER) {
      const delta = action === ACTIONS.PREV ? -1 : 1;
      setStepIndex((prev) => Math.max(0, prev + delta));
    }

    if (type === EVENTS.TARGET_NOT_FOUND) {
      const nextIndex = (index ?? 0) + 1;
      if (nextIndex >= steps.length) {
        setRun(false);
        clearScrollLocks();
        await completeTour(tourKey);
      } else {
        setStepIndex(nextIndex);
      }
      return;
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      setStepIndex(0);
      
      // Force re-enable scrolling
      clearScrollLocks();
      
      if (status === STATUS.FINISHED) {
        await completeTour(tourKey);
      }
    }

    // Handle skip all tours
    if (action === ACTIONS.CLOSE && status === STATUS.RUNNING) {
      setRun(false);
      setStepIndex(0);
      
      // Force re-enable scrolling
      clearScrollLocks();
      await skipAllTours();
    }
  };

  if (!run) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous={continuous}
      showProgress={showProgress}
      showSkipButton={showSkipButton}
      callback={handleJoyrideCallback}
      styles={cardStyles}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next",
        open: "Open",
        skip: "Skip Tour",
      }}
      floaterProps={{
        disableAnimation: false,
        disableFlip: false,
        hideArrow: false,
        options: {
          preventOverflow: {
            boundariesElement: "viewport",
            padding: 12,
          },
        },
      }}
      disableOverlayClose
      disableCloseOnEsc
      spotlightClicks
      disableScrolling={disableScrolling}
      scrollToFirstStep={scrollToFirstStep}
      scrollOffset={isMobile ? 56 : 100}
    />
  );
}
