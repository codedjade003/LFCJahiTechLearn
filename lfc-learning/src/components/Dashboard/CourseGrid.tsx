// src/components/Dashboard/CourseGrid.tsx
import CourseCard from "./CourseCard";
import type { Course } from "../../types/course";

interface CourseGridProps {
  courses: Course[];
  searchQuery?: string;
  onEnrollmentUpdate?: (courseId: string, enrolled: boolean) => void;
}

const CourseGrid = ({ courses, searchQuery = "", onEnrollmentUpdate }: CourseGridProps) => {
  const handleEnroll = async (courseId: string): Promise<void> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication required");

    const response = await fetch(`http://localhost:5000/api/enrollments/${courseId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to enroll in course");
    }

    if (onEnrollmentUpdate) onEnrollmentUpdate(courseId, true);
    return response.json();
  };

  if (!courses?.length) {
    return (
      <div className="col-span-full text-center py-16 text-gray-500">
        <div className="max-w-md mx-auto">
          <p className="text-lg font-semibold text-gray-600 mb-2">
            {searchQuery ? "No courses found" : "No courses available"}
          </p>
          <p className="text-sm text-gray-500">
            {searchQuery
              ? `No courses match "${searchQuery}". Try different keywords or browse all courses.`
              : "New courses will be available soon. Check back later!"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {courses.map((course) => (
        <CourseCard key={course._id} {...course} onEnroll={handleEnroll} />
      ))}
    </div>
  );
};

export default CourseGrid;