// src/components/shared/OnboardingTour.tsx
import { useEffect, useState } from "react";
import Joyride, { STATUS, ACTIONS, type Step, type CallBackProps } from "react-joyride";
import { useOnboarding } from "../../context/OnboardingContext";

interface OnboardingTourProps {
  tourKey: keyof ReturnType<typeof useOnboarding>["progress"];
  steps: Step[];
  continuous?: boolean;
  showProgress?: boolean;
  showSkipButton?: boolean;
}

export default function OnboardingTour({
  tourKey,
  steps,
  continuous = true,
  showProgress = true,
  showSkipButton = true,
}: OnboardingTourProps) {
  const { shouldShowTour, completeTour, skipAllTours } = useOnboarding();
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Small delay to ensure DOM elements are rendered
    const timer = setTimeout(() => {
      if (shouldShowTour(tourKey)) {
        setRun(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [tourKey, shouldShowTour]);

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status, action } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      
      if (status === STATUS.FINISHED) {
        await completeTour(tourKey);
      }
    }

    // Handle skip all tours
    if (action === ACTIONS.CLOSE && status === STATUS.RUNNING) {
      setRun(false);
      await skipAllTours();
    }
  };

  if (!run) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={continuous}
      showProgress={showProgress}
      showSkipButton={showSkipButton}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "#C8102E", // LFC Red
          textColor: "#333",
          backgroundColor: "#fff",
          overlayColor: "rgba(0, 0, 0, 0.5)",
          arrowColor: "#fff",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: "8px",
          padding: "20px",
        },
        tooltipContainer: {
          textAlign: "left",
        },
        buttonNext: {
          backgroundColor: "#C8102E",
          borderRadius: "6px",
          padding: "8px 16px",
          fontSize: "14px",
        },
        buttonBack: {
          color: "#666",
          marginRight: "10px",
        },
        buttonSkip: {
          color: "#999",
        },
      }}
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
      }}
      disableOverlayClose
      disableCloseOnEsc
      spotlightClicks
      disableScrolling={false}
      scrollToFirstStep={false}
      scrollOffset={100}
    />
  );
}
