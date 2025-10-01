import { useState, type JSX } from "react";
import { FaPlus, FaUserPlus, FaFileExport } from "react-icons/fa";
import CourseFormModal from "./CourseFormModal";
/**
 * CourseManagement - UI only (Phase 1)
 * Hook buttons to your endpoints later (POST /courses, /enrollments, etc.)
 */
export default function CourseManagement(): JSX.Element {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreateCourse = async (data: any) => {
    console.log("Submitting course payload:", data);

    // Replace this with your actual token retrieval logic
    const token = localStorage.getItem("token") || "";

    // 🔹 Hook into your backend using fetch
    await fetch("/api/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data.courseInfo),
    });
    // Then for each section, module, assignment, etc. chain calls
  };
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold text-lfc-gray">Course Management</h2>
      </div>

      <div className="p-6 space-y-4">
        <button
          className="w-full bg-lfc-red hover:opacity-95 text-white py-3 px-4 rounded-lg flex items-center justify-center"
          onClick={() => setIsModalOpen(true)}
        >
          <FaPlus className="mr-2" /> Add New Course
        </button>

        <div>
          <label className="block text-lfc-gray mb-2">Bulk Actions</label>
          <select className="w-full border rounded-lg p-2">
            <option>Select action...</option>
            <option>Publish Selected</option>
            <option>Unpublish Selected</option>
            <option>Delete Selected</option>
            <option>Assign to Category</option>
          </select>
        </div>

        <div>
          <label className="block text-lfc-gray mb-2">Auto Enroll Users</label>
          <select className="w-full border rounded-lg p-2">
            <option>Select course...</option>
            <option>Introduction to Programming</option>
            <option>Web Development Basics</option>
            <option>Data Science Fundamentals</option>
          </select>
        </div>

        <button className="w-full bg-lfc-gold hover:opacity-95 text-black py-3 px-4 rounded-lg flex items-center justify-center">
          <FaUserPlus className="mr-2" /> Enroll All Users
        </button>

        <button className="w-full bg-gray-100 hover:bg-gray-200 text-lfc-gray py-3 px-4 rounded-lg flex items-center justify-center">
          <FaFileExport className="mr-2" /> Export Course Data
        </button>

        {isModalOpen && (
          <CourseFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleCreateCourse}
          />
        )}
      </div>
    </div>
  );
}
