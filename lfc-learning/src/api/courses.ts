import type { CourseCardProps } from "../components/Dashboard/CourseCard";

export const fetchCourses = async (): Promise<CourseCardProps[]> => {
  const res = await fetch("http://localhost:5000/api/courses");
  if (!res.ok) throw new Error("Failed to fetch courses");

  const data = await res.json();

  // Map backend shape to frontend CourseCardProps
  return data.map((c: any) => ({
    title: c.title,
    description: c.description,
    categories: c.categories?.[0] || "General", // take first
    duration: c.duration || "N/A",
    tags: c.tags || [],
    instructor: c.instructor || { name: "Unknown Instructor", avatar: "/default-avatar.png" },
    progress: undefined, // only if you implement tracking
    level: c.level,
    type: c.type,
  }));
};
