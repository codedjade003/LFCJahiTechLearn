// src/pages/Dashboard/MyCourses.tsx - UPDATED
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBookOpen, FaClock, FaUser, FaArrowRight } from "react-icons/fa";
import TechyBackground from "../../components/shared/TechyBackground";

interface Enrollment {
  _id: string;
  course: string | { _id: string };
  progress: number;
  completed: boolean;
  lastAccessed: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  instructor: {
    name: string;
    avatar: string;
  };
  isDeleted?: boolean;
  status?: string;
}

export default function MyCourses() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Record<string, Course>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        return;
      }

      // 1. Fetch enrollments
      const enrollmentsRes = await fetch(`${API_BASE}/api/enrollments/my`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      
      if (!enrollmentsRes.ok) throw new Error("Failed to fetch enrollments");
      
      const enrollmentsData: Enrollment[] = await enrollmentsRes.json();
      
      // FRONTEND SAFETY CHECK: Filter out enrollments with invalid course IDs
      const validEnrollments = enrollmentsData.filter(enrollment => {
        const courseId = getCourseIdFromEnrollment(enrollment);
        // Only keep enrollments with valid-looking MongoDB ObjectIds
        return courseId && courseId.length === 24 && /^[0-9a-fA-F]{24}$/.test(courseId);
      });
      
      setEnrollments(validEnrollments);

      if (validEnrollments.length === 0) {
        setLoading(false);
        return;
      }

      // 2. Extract valid course IDs
      const courseIds: string[] = [];
      
      validEnrollments.forEach(enrollment => {
        const courseId = getCourseIdFromEnrollment(enrollment);
        if (courseId && courseId.length === 24) {
          courseIds.push(courseId);
        }
      });

      console.log("Valid course IDs:", courseIds);

      // 3. Fetch all courses in parallel
      const coursePromises = courseIds.map(courseId =>
        fetch(`${API_BASE}/api/courses/${courseId}`, {
          headers: { "Authorization": `Bearer ${token}` },
        }).then(async (res) => {
          if (!res.ok) {
            console.warn(`Course ${courseId} not found or inaccessible`);
            return null;
          }
          const courseData = await res.json();
          
          // Additional check: skip deleted courses
          if (courseData.isDeleted || courseData.status === 'deleted') {
            console.warn(`Course ${courseId} is marked as deleted`);
            return null;
          }
          
          return courseData;
        }).catch(err => {
          console.warn(`Error fetching course ${courseId}:`, err);
          return null;
        })
      );

      const coursesData = await Promise.all(coursePromises);
      
      // 4. Map only valid, non-deleted courses
      const coursesMap: Record<string, Course> = {};
      coursesData.forEach((course, index) => {
        if (course && course._id && !course.isDeleted && course.status !== 'deleted') {
          coursesMap[courseIds[index]] = course;
        }
      });
      
      setCourses(coursesMap);
      console.log("Final courses map:", coursesMap);
      
    } catch (err) {
      console.error("Error fetching enrolled courses", err);
      setError("Failed to load your courses");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get course ID from enrollment
  const getCourseIdFromEnrollment = (enrollment: Enrollment): string => {
    if (typeof enrollment.course === 'string') {
      return enrollment.course;
    } else if (enrollment.course && typeof enrollment.course === 'object' && enrollment.course._id) {
      return enrollment.course._id;
    }
    return '';
  };

  const resolveImageUrl = (url?: string) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${API_BASE}${url}`;
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchEnrolledCourses}
            className="mt-2 px-4 py-2 bg-lfc-red text-white rounded-md hover:bg-lfc-gold-dark"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Filter out enrollments without valid courses for display
  const displayEnrollments = enrollments.filter(enrollment => {
    const courseId = getCourseIdFromEnrollment(enrollment);
    return courses[courseId]; // Only show enrollments with valid courses
  });

  return (
    <div className="p-6 relative min-h-screen">
      <TechyBackground variant="minimal" />
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-yt-text-dark">My Courses</h1>
        <span className="text-yt-text-gray">
          {displayEnrollments.length} {displayEnrollments.length === 1 ? 'course' : 'courses'} enrolled
        </span>
      </div>

      {displayEnrollments.length === 0 ? (
        <div className="bg-white dark:bg-[var(--bg-elevated)] p-8 rounded-lg text-center border border-yt-light-border">
          <div className="w-16 h-16 bg-yt-light-hover rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBookOpen className="text-2xl text-yt-text-gray" />
          </div>
          <p className="text-yt-text-gray mb-4">You haven't enrolled in any courses yet.</p>
          <Link 
            to="/courses"
            className="px-4 py-2 bg-lfc-red text-white rounded-md hover:bg-lfc-gold-dark inline-flex items-center"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayEnrollments.map((enrollment) => {
            const courseId = getCourseIdFromEnrollment(enrollment);
            const course = courses[courseId];
            
            if (!course) return null;

            return (
              <Link
                key={enrollment._id}
                to={`/dashboard/courses/${course._id}`}
                className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg shadow-sm border border-yt-light-border overflow-hidden hover:shadow-md transition-shadow block"
              >
                {/* Your existing course card JSX here */}
                <div className="h-48 bg-yt-light-hover overflow-hidden relative">
                  {course.thumbnail ? (
                    <img
                      src={resolveImageUrl(course.thumbnail)}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-yt-text-gray">
                      <FaBookOpen className="text-4xl" />
                    </div>
                  )}
                  
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50">
                    <div className="h-2 bg-gray-600">
                      <div 
                        className={`h-full ${
                          enrollment.progress === 100 ? 'bg-green-500' : 
                          enrollment.progress >= 50 ? 'bg-lfc-gold' : 'bg-lfc-red'
                        }`}
                        style={{ width: `${enrollment.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg text-yt-text-dark line-clamp-2 flex-1">
                      {course.title}
                    </h3>
                    <FaArrowRight className="text-yt-text-gray ml-2 flex-shrink-0" />
                  </div>

                  <p className="text-yt-text-gray text-sm mb-3 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-xs text-yt-text-gray">
                      <FaClock className="mr-1" />
                      <span>{course.duration || 'Self-paced'}</span>
                    </div>
                    
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      enrollment.completed ? 'bg-green-100 text-green-800' :
                      enrollment.progress > 0 ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {enrollment.completed ? 'Completed' : `${enrollment.progress}%`}
                    </span>
                  </div>

                  <div className="flex items-center pt-3 border-t border-yt-light-border">
                    {course.instructor?.avatar ? (
                      <img
                        src={resolveImageUrl(course.instructor.avatar)}
                        alt={course.instructor.name}
                        className="w-6 h-6 rounded-full mr-2 object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-lfc-gold flex items-center justify-center mr-2">
                        <FaUser className="text-white text-xs" />
                      </div>
                    )}
                    <span className="text-sm text-yt-text-dark">
                      {course.instructor?.name || 'Unknown Instructor'}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}