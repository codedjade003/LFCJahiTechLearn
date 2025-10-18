// src/components/Student/ModuleOverviewModal.tsx
import { FaTimes, FaCheckCircle } from "react-icons/fa";

interface ModuleOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
  module: {
    title: string;
    description?: string;
    objectives?: string[];
    type: string;
    duration?: string;
  };
}

export default function ModuleOverviewModal({
  isOpen,
  onClose,
  onStart,
  module,
}: ModuleOverviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-[var(--bg-elevated)] border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Module Overview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Module Title */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {module.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="capitalize bg-lfc-gold/10 text-lfc-gold px-3 py-1 rounded-full">
                {module.type}
              </span>
              {module.duration && (
                <span className="text-gray-500">Duration: {module.duration}</span>
              )}
            </div>
          </div>

          {/* Description */}
          {module.description && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                About This Module
              </h4>
              <p className="text-gray-700 leading-relaxed">{module.description}</p>
            </div>
          )}

          {/* Learning Objectives */}
          {module.objectives && module.objectives.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                What You'll Learn
              </h4>
              <ul className="space-y-2">
                {module.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <FaCheckCircle className="text-lfc-gold mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onStart}
            className="px-6 py-2 bg-lfc-red text-white rounded-lg hover:bg-lfc-red/90 transition-colors font-medium"
          >
            Start Module
          </button>
        </div>
      </div>
    </div>
  );
}
