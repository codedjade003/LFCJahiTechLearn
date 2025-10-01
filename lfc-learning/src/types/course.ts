// src/types/course.ts
export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";
export type CourseType =
  | "Video"
  | "Audio"
  | "Graphics"
  | "Required"
  | "Content Creation"
  | "Utility"
  | "Secretariat";

export interface Instructor {
  userId?: string;
  name?: string;
  avatar?: string;
  role?: "main" | "assistant";
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  categories?: string[];
  tags?: string[];
  duration?: string;
  thumbnail?: string;
  promoVideo?: string;
  prerequisites?: string[];
  objectives?: string[];
  level?: CourseLevel;
  type?: CourseType;
  instructor?: Instructor;       // legacy single instructor
  instructors?: Instructor[];    // multiple instructors
  isPublic?: boolean;

  // client-only fields
  progress?: number;
  enrolled?: boolean;
}
