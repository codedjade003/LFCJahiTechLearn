// src/components/Admin/CourseFormModal.tsx
import { useState } from "react";
import { FaTimes } from "react-icons/fa";

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function CourseFormModal({
  isOpen,
  onClose,
  onSubmit,
}: CourseFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);

  if (!isOpen) return null;

  const toggleType = (type: string) => {
    setTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = () => {
    const payload = {
      title,
      description,
      category,
      types,
      isPublic,
    };
    onSubmit(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <FaTimes />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-lfc-gray">
          Create New Course
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Course Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded p-2"
          />

          <textarea
            placeholder="Course Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded p-2"
          />

          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded p-2"
          />

          {/* Types multi-select */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Types</p>
            <div className="flex gap-2 flex-wrap">
              {["Video", "Audio", "Graphics", "Required", "Content Creation", "Utility", "Secretariat"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleType(type)}
                  className={`px-3 py-1 rounded-full border ${
                    types.includes(type)
                      ? "bg-lfc-red text-white border-lfc-red"
                      : "bg-gray-100 text-gray-700 border-gray-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Public toggle */}
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4"
            />
            Make course public (visible to students)
          </label>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            className="bg-lfc-gold text-black px-4 py-2 rounded-lg hover:opacity-90"
          >
            Save Course
          </button>
        </div>
      </div>
    </div>
  );
}
