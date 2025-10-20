// components/Admin/CourseFormModal.tsx
import { useState } from "react";
import { FaTimes } from "react-icons/fa";

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function CourseFormModal({ isOpen, onClose, onSubmit }: CourseFormModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "Video",
    level: "Beginner",
    instructorName: "",
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Title and description are required");
      return;
    }

    setSaving(true);
    
    try {
      // Prepare course data with all required fields
      const courseData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        level: formData.level,
        instructor: {
          name: formData.instructorName.trim() || "Unknown Instructor",
          avatar: "" // Default empty, can be updated later
        },
        // Remove categories field since it's not needed
        thumbnail: "", // Default empty
        promoVideo: "", // Default empty
      };

      await onSubmit({ courseInfo: courseData });
      
      // Reset form on success
      setFormData({
        title: "",
        description: "",
        type: "Video",
        level: "Beginner",
        instructorName: "",
      });
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-55">
      <div className="bg-white dark:bg-[var(--bg-elevated)] dark:bg-[var(--bg-elevated)] rounded-lg shadow dark:shadow-[var(--shadow-md)] border dark:border-[var(--border-primary)]-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-[var(--text-primary)]">Create New Course</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-[var(--text-secondary)] transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title - Required */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">
              Course Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lfc-red focus:border-lfc-red"
              placeholder="Enter course title"
              required
            />
          </div>

          {/* Description - Required */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lfc-red focus:border-lfc-red"
              placeholder="Describe what students will learn in this course"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">
              Course Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lfc-red focus:border-lfc-red"
            >
              <option value="Video">Video</option>
              <option value="Audio">Audio</option>
              <option value="Graphics">Graphics</option>
              <option value="Required">Required</option>
              <option value="Content Creation">Content Creation</option>
              <option value="Utility">Utility</option>
              <option value="Secretariat">Secretariat</option>
            </select>
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">
              Difficulty Level
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lfc-red focus:border-lfc-red"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Instructor Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">
              Instructor Name
            </label>
            <input
              type="text"
              name="instructorName"
              value={formData.instructorName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lfc-red focus:border-lfc-red"
              placeholder="Enter instructor's name"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-[var(--text-secondary)] hover:text-gray-800 dark:text-[var(--text-primary)] font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !formData.title.trim() || !formData.description.trim()}
              className="bg-lfc-red dark:bg-red-800 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {saving ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating...
                </span>
              ) : (
                "Create Course"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}