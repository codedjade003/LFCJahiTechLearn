// src/components/shared/ScrollHint.tsx
import { useState, useEffect } from "react";
import { FaArrowDown, FaTimes, FaCog } from "react-icons/fa";

const ScrollHint = () => {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if hint was shown today
    const lastShown = localStorage.getItem("scrollHintLastShown");
    const hintsDisabled = localStorage.getItem("scrollHintsDisabled") === "true";
    
    if (hintsDisabled) {
      return;
    }

    const today = new Date().toDateString();
    
    if (lastShown !== today && !dismissed) {
      // Show hint after a short delay
      const timer = setTimeout(() => {
        setShow(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [dismissed]);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem("scrollHintLastShown", new Date().toDateString());
  };

  const handleDisable = () => {
    localStorage.setItem("scrollHintsDisabled", "true");
    setShow(false);
    setDismissed(true);
  };

  if (!show) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-bounce">
      <div className="bg-white dark:bg-[var(--bg-elevated)] border-2 border-lfc-gold dark:border-yellow-500 rounded-lg shadow-lg p-4 max-w-xs">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <FaArrowDown className="text-lfc-gold dark:text-yellow-400 animate-bounce" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-[var(--text-primary)]">
              Scroll Tip
            </h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Dismiss hint"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>
        
        <p className="text-xs text-gray-600 dark:text-[var(--text-secondary)] mb-3">
          You can scroll anywhere content is cut off, even though scrollbars are hidden for a cleaner look!
        </p>
        
        <div className="flex items-center justify-between text-xs">
          <button
            onClick={handleDisable}
            className="flex items-center space-x-1 text-gray-500 dark:text-[var(--text-tertiary)] hover:text-lfc-red dark:hover:text-red-400 transition-colors"
          >
            <FaCog className="text-xs" />
            <span>Turn off in settings</span>
          </button>
          <button
            onClick={handleDismiss}
            className="text-lfc-gold dark:text-yellow-400 hover:text-lfc-gold-hover dark:hover:text-yellow-300 font-medium"
          >
            Got it!
          </button>
        </div>
      </div>
      
      {/* Doodle-style arrow pointing down */}
      <svg
        className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-lfc-gold dark:text-yellow-400"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 4V20M12 20L6 14M12 20L18 14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="2 2"
        />
      </svg>
    </div>
  );
};

export default ScrollHint;
