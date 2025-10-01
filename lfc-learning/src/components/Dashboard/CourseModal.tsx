// src/components/CourseModal.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import type { Course } from "../../types/course";

interface CourseModalProps {
  course: Course;
  open: boolean;
  onClose: () => void;
  onEnroll?: (courseId: string) => Promise<void>;
  isEnrolling?: boolean;
  enrolled?: boolean;
  progress?: number;
}

const CourseModal: React.FC<CourseModalProps> = ({
  course,
  open,
  onClose,
  onEnroll,
  isEnrolling = false,
  enrolled = false,
  progress = 0,
}) => {
  const navigate = useNavigate();

  if (!open) return null;

  const handleEnroll = async () => {
    if (enrolled && course._id) {
      // ✅ FIXED: Correct path with "courses" (plural)
      navigate(`/dashboard/courses/${course._id}`);
      onClose();
      return;
    }

    if (onEnroll && course._id) {
      try {
        await onEnroll(course._id);
        // ✅ FIXED: Navigate after successful enrollment
        navigate(`/dashboard/courses/${course._id}`);
        onClose();
      } catch (err) {
        console.error("Enroll failed", err);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        >
          ✕
        </button>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {course.title}
          </h2>
          <p className="text-sm text-gray-700 mb-4">{course.description}</p>

          {course.objectives && course.objectives.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-1">Objectives</h3>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {course.objectives.map((obj, idx) => (
                  <li key={idx}>{obj}</li>
                ))}
              </ul>
            </div>
          )}

          {course.prerequisites && course.prerequisites.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-1">Prerequisites</h3>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {course.prerequisites.map((pre, idx) => (
                  <li key={idx}>{pre}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleEnroll}
              disabled={isEnrolling}
              className={`px-4 py-2 rounded-lg text-white ${
                enrolled
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-lfc-red hover:bg-red-700"
              }`}
            >
              {enrolled
                ? progress > 0
                  ? "Continue"
                  : "Start"
                : isEnrolling
                ? "Enrolling..."
                : "Enroll"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseModal;