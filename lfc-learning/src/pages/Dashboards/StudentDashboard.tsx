import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Notifications from "../../components/Dashboard/Notifications";
import CourseCategories from "../../components/Dashboard/CourseCategories";
import CourseGrid from "../../components/Dashboard/CourseGrid";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import { useAuth } from "../../context/AuthContext";
import { useOnboarding } from "../../context/OnboardingContext";
import DashboardStats from "../../components/Dashboard/DashboardStats";
import ProfileCompletionBanner from "../../components/Dashboard/ProfileCompletionBanner";
import OnboardingModal from "../../components/Dashboard/OnboardingModal";
import OnboardingTour from "../../components/shared/OnboardingTour";
import TechyBackground from "../../components/shared/TechyBackground";
import Notification from "../../components/shared/Notification";
import type { Course } from "../../types/course";
import type { Step } from "react-joyride";

interface UserProfile {
  profilePicture: string;
  name: string;
  dateOfBirth: string;
  phoneNumber: string;
  maritalStatus: string;
  technicalUnit: string;
  profilePicturePreview?: string;
  profilePicturePosition?: { x: number; y: number };
  hasSeenOnboarding?: boolean;
}

const StudentDashboard = () => {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  useAuthGuard();

  // Onboarding tour steps
  const dashboardTourSteps: Step[] = [
    {
      target: "body",
      content: "Welcome to your Student Dashboard! Let's take a quick tour to help you get started.",
      placement: "center",
    },
    {
      target: '[data-tour="stats"]',
      content: "Here you can see your learning progress, enrolled courses, and achievements at a glance.",
      placement: "bottom",
    },
    {
      target: '[data-tour="search"]',
      content: "Use the search bar to quickly find courses, instructors, or topics you're interested in.",
      placement: "bottom",
    },
    {
      target: '[data-tour="categories"]',
      content: "Browse courses by category. Click on any category to filter the course list.",
      placement: "bottom",
    },
    {
      target: '[data-tour="courses"]',
      content: "All available courses are displayed here. Click on any course to view details and enroll.",
      placement: "top",
    },
  ];

  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const FIXED_CATEGORIES = [
    "All Courses",
    "Video",
    "Audio",
    "Graphics",
    "Secretariat",
    "Required",
    "Content Creation",
    "Utility",
  ];

  const [selectedCategory, setSelectedCategory] = useState("All Courses");
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [, setEnrollmentAttempted] = useState(false);
  const [showProfileWarning, setShowProfileWarning] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'error' | 'success' | 'warning'; visible: boolean }>({
    message: '',
    type: 'error',
    visible: false
  });
  const { fetchUser, user } = useAuth();
  const { progress } = useOnboarding();

  // Use the fixed categories for the filter options
  const filterOptions = useMemo(() => FIXED_CATEGORIES, []);

  // Use refs to track values without causing re-renders
  const hasFetchedRef = useRef(false);
  const onboardingSteps = useRef(["Profile Info", "Technical Unit Preference"]);

  // Enhanced data loading with enrollment status
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const loadAllData = async () => {
      setIsInitialLoading(true);
      
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsInitialLoading(false);
          return;
        }

        // Fetch user first
        await fetchUser();
        
        // Fetch courses and user's enrollments in parallel
        const [coursesRes, enrollmentsRes] = await Promise.allSettled([
          fetch(`${API_BASE}/api/courses`),
          fetch(`${API_BASE}/api/enrollments/my`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        let apiCourses: Course[] = [];
        let userEnrollments: Array<{ courseId: string; progress: number }> = [];

        if (coursesRes.status === 'fulfilled' && coursesRes.value.ok) {
          apiCourses = await coursesRes.value.json();
        }

        if (enrollmentsRes.status === 'fulfilled' && enrollmentsRes.value.ok) {
          userEnrollments = await enrollmentsRes.value.json();
        }

        // Create a map of courseId -> enrollment for quick lookup
        const enrollmentMap = new Map();
        userEnrollments.forEach((enrollment: any) => {
          if (enrollment.course && enrollment.course._id) {
            enrollmentMap.set(enrollment.course._id, enrollment);
          }
        });

        // Transform API courses with enrollment status
        const transformedCourses = apiCourses
          .filter((course: any) => course.isPublic !== false)
          .map((course: any) => {
            const enrollment = enrollmentMap.get(course._id);

            let displayDuration = course.duration;
            if (!course.duration || course.duration === "NaN") {
              displayDuration = undefined;
            }

            return {
              _id: course._id,
              title: course.title,
              description: course.description,
              categories: course.categories || [],
              duration: displayDuration,
              tags: course.tags || [],
              instructor: course.instructor,
              instructors: course.instructors || [],
              progress: enrollment?.progress || 0,
              level: course.level || "Beginner",
              type: course.type || "Video",
              thumbnail: course.thumbnail,
              promoVideo: course.promoVideo,
              enrolled: !!enrollment,
              isPublic: course.isPublic !== false,
              objectives: course.objectives || [],
              prerequisites: course.prerequisites || [],
            };
          });

        setCourses(transformedCourses);

        // Load user profile data
        const userRes = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          const userProfile: UserProfile = {
            profilePicture: userData.profilePicture?.url || userData.profilePicture || "",
            name: userData.name || "",
            dateOfBirth: userData.dateOfBirth || "",
            phoneNumber: userData.phoneNumber || "",
            maritalStatus: userData.maritalStatus || "",
            technicalUnit: userData.technicalUnit || "All Courses",
            profilePicturePosition: userData.profilePicture?.position || { x: 50, y: 50 },
            hasSeenOnboarding: userData.hasSeenOnboarding || false,
          };

          setProfile(userProfile);
          setSelectedCategory(userData.technicalUnit || "All Courses");
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setTimeout(() => setIsInitialLoading(false), 50);
      }
    };

    loadAllData();
  }, [fetchUser]);

  // Show onboarding modal after tour completes OR if tour is disabled
  useEffect(() => {
    if (!isInitialLoading && profile && !onboardingDismissed) {
      // Only show modal if user hasn't seen onboarding
      if (!profile.hasSeenOnboarding) {
        // If tour is completed OR if user has onboarding disabled, show modal
        if (progress.dashboard) {
          // Tour completed, show modal after short delay
          setTimeout(() => setShowOnboarding(true), 500);
        }
      }
    }
  }, [isInitialLoading, profile, progress.dashboard, onboardingDismissed]);

  const handleFinish = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !profile) {
        console.error("Missing token or profile:", { token: !!token, profile: !!profile });
        return;
      }

      // Validate age if date of birth is provided
      if (profile.dateOfBirth) {
        const today = new Date();
        const birth = new Date(profile.dateOfBirth);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        if (age < 18) {
          alert("You must be at least 18 years old to join the Technical Unit.");
          return;
        }
      }

      if (file) {
        const pictureFormData = new FormData();
        pictureFormData.append("image", file);
        
        // Add position data if available
        if (profile.profilePicturePosition) {
          pictureFormData.append("position", JSON.stringify(profile.profilePicturePosition));
        }

        const pictureResponse = await fetch(`${API_BASE}/api/auth/profile-picture`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: pictureFormData,
        });
        
        if (!pictureResponse.ok) {
          const errorData = await pictureResponse.json().catch(() => ({ message: "Unknown error" }));
          console.error("Picture upload failed");
          throw new Error(`Failed to upload profile picture: ${errorData.message || pictureResponse.statusText}`);
        }
      }

      const { profilePicturePreview, profilePicture, profilePicturePosition, ...safeProfile } = profile;

      const profileResponse = await fetch(`${API_BASE}/api/auth/update-profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(safeProfile),
      });
      
      if (!profileResponse.ok) {
        const errorData = await profileResponse.json().catch(() => ({ message: "Unknown error" }));
        console.error("Profile update failed");
        throw new Error(`Failed to update profile: ${errorData.message || profileResponse.statusText}`);
      }

      await profileResponse.json();

      await fetch(`${API_BASE}/api/auth/seen-onboarding`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowOnboarding(false);
      setOnboardingDismissed(true);
      setProfile(prev => prev ? { ...prev, ...safeProfile, hasSeenOnboarding: true } : null);
      await fetchUser();
    } catch (err) {
      console.error("Error saving profile:", err);
      alert(`Failed to save profile: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }, [file, profile, fetchUser, API_BASE]);

  const handleSkip = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch(`${API_BASE}/api/auth/seen-onboarding`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(prev => prev ? { ...prev, hasSeenOnboarding: true } : null);
      }
    } catch (err) {
      console.error("Error marking onboarding as seen:", err);
    }
    setShowOnboarding(false);
    setOnboardingDismissed(true);
  }, [API_BASE]);

  const handleNextStep = useCallback(() => {
    if (currentStep === onboardingSteps.current.length - 1) {
      handleFinish();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, handleFinish]);

  const handleInputChange = useCallback((field: keyof UserProfile, value: string) => {
    setProfile((prev: UserProfile | null) => 
      prev ? { ...prev, [field]: value } : null
    );
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newFile = e.target.files[0];
      setFile(newFile);
      setProfile((prev: UserProfile | null) => 
        prev ? {
          ...prev,
          profilePicturePreview: URL.createObjectURL(newFile),
        } : null
      );
    }
  }, []);

  // Enhanced search and filtering - prioritizes type and category
  const filteredCourses = useMemo(() => {
    let filtered = courses;

    // Category filtering
    if (selectedCategory !== "All Courses") {
      filtered = filtered.filter((course) => {
        return (
          course.type === selectedCategory ||
          (course.categories && course.categories.includes(selectedCategory))
        );
      });
    }

    // Search filtering - prioritizes type and category over other fields
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      
      const scoredCourses = filtered.map((course) => {
        let score = 0;
        
        // Priority 1: Exact matches in type/category
        if (course.type?.toLowerCase() === query) score += 100;
        if (course.categories?.some(cat => cat.toLowerCase() === query)) score += 100;
        
        // Priority 2: Partial matches in type/category
        if (course.type?.toLowerCase().includes(query)) score += 80;
        if (course.categories?.some(cat => cat.toLowerCase().includes(query))) score += 80;
        
        // Priority 3: Other fields (title, instructor, etc.)
        if (course.title?.toLowerCase().includes(query)) score += 40;
        if (course.instructor?.name?.toLowerCase().includes(query)) score += 30;
        if (course.description?.toLowerCase().includes(query)) score += 20;
        if (course.level?.toLowerCase().includes(query)) score += 10;

        return { course, score };
      });

      filtered = scoredCourses
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ course }) => course);
    }

    return filtered;
  }, [courses, selectedCategory, searchQuery]);

  const totalPages = useMemo(() => 
    Math.ceil(filteredCourses.length / pageSize), 
    [filteredCourses.length, pageSize]
  );

  const paginatedCourses = useMemo(() => 
    filteredCourses.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredCourses, currentPage, pageSize]
  );

  const completionPercent = useMemo(() => {
    if (!profile) return 100;
    
    // Profile completion criteria: 5 fields total
    // name (already there), email (already there), dateOfBirth, phoneNumber, maritalStatus
    // So initially it's 2/5 = 40%
    const totalFields = 5;
    const alreadyFilledFields = 2; // name and email are always there from signup
    
    const additionalFields: (keyof UserProfile)[] = ['dateOfBirth', 'phoneNumber', 'maritalStatus'];
    const filledAdditionalFields = additionalFields.filter(field => 
      profile[field] !== undefined && profile[field] !== null && profile[field] !== ""
    ).length;
    
    const totalFilledFields = alreadyFilledFields + filledAdditionalFields;
    return Math.round((totalFilledFields / totalFields) * 100);
  }, [profile]);

  const isProfileIncomplete = useMemo(() => 
    completionPercent < 100, 
    [completionPercent]
  );

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }, [totalPages]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleOnboardingCategoryChange = useCallback((value: string) => {
    handleInputChange("technicalUnit", value);
    setSelectedCategory(value);
  }, [handleInputChange]);

  const handleProfilePicturePositionChange = useCallback((position: { x: number; y: number }) => {
    setProfile((prev: UserProfile | null) => 
      prev ? { ...prev, profilePicturePosition: position } : null
    );
  }, []);

  const handleEnrollmentBlocked = useCallback(() => {
    // Show 403 error notification
    setNotification({
      message: 'Please complete your profile before enrolling in courses',
      type: 'error',
      visible: true
    });
    
    // Show profile completion modal with warning
    setEnrollmentAttempted(true);
    setShowProfileWarning(true);
    setCurrentStep(0);
    setShowOnboarding(true);
    
    // Hide warning after 5 seconds
    setTimeout(() => {
      setShowProfileWarning(false);
    }, 5000);
  }, []);

  const showBanner = useMemo(() => 
    !isInitialLoading && profile && isProfileIncomplete,
    [isInitialLoading, profile, isProfileIncomplete]
  );

  const handleBannerClick = useCallback(() => {
    setCurrentStep(0);
    setShowOnboarding(true);
  }, []);

  // Handle enrollment from child components
  const handleEnrollmentUpdate = useCallback((courseId: string, enrolled: boolean) => {
    setCourses(prevCourses => 
      prevCourses.map(course => 
        course._id === courseId
          ? { ...course, enrolled, progress: enrolled ? 0 : 0 }
          : course
      )
    );
  }, []);

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lfc-red dark:border-[var(--lfc-red)] mx-auto mb-4"></div>
          <div className="text-lg text-gray-600 dark:text-gray-400">Loading your courses...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[var(--bg-primary)] relative">
      {/* Notification */}
      {notification.visible && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(prev => ({ ...prev, visible: false }))}
          duration={5000}
        />
      )}
      
      {/* Techy Background */}
      <TechyBackground variant="subtle" />
      
      {/* Content */}
      <div className="relative z-0">
        {/* Onboarding Tour - Shows BEFORE profile completion */}
        <OnboardingTour tourKey="dashboard" steps={dashboardTourSteps} />

      {/* Profile completion banner */}
      {showBanner && (
        <ProfileCompletionBanner
          completionPercent={completionPercent}
          onClick={handleBannerClick}
        />
      )}

      {/* Onboarding Modal */}
      {showOnboarding && profile && (
        <OnboardingModal
          profile={profile}
          currentStep={currentStep}
          onboardingSteps={onboardingSteps.current}
          fixedCategories={FIXED_CATEGORIES}
          onSkip={handleSkip}
          onNextStep={handleNextStep}
          onInputChange={handleInputChange}
          onProfilePicturePositionChange={handleProfilePicturePositionChange}
          onFileChange={handleFileChange}
          onCategoryChange={handleOnboardingCategoryChange}
          showWarning={showProfileWarning}
        />
      )}

      {/* Main Content - YouTube-like Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Stats */}
        <div data-tour="stats">
          <DashboardStats />
        </div>

        {/* Notifications */}
        <Notifications />

        {/* Search Bar - YouTube Style */}
        <div className="mb-6" data-tour="search">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search courses, instructors, or topics..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white dark:bg-[var(--bg-elevated)] shadow-sm focus:outline-none focus:ring-2 focus:ring-lfc-gold focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories - Horizontal Scrolling like YouTube */}
        <div className="mb-6" data-tour="categories">
          <CourseCategories 
            filterOptions={filterOptions}
            selectedFilter={selectedCategory}
            onSelectFilter={handleCategoryChange} filterType={"type"}          />
        </div>

        {/* Required Courses Section - Only show when viewing "All Courses" and required courses exist */}
        {selectedCategory === "All Courses" && courses.some(c => c.categories?.includes("Required")) && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-4 flex items-center gap-2">
              Required Courses
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                (Mandatory for all students)
              </span>
            </h2>
            <CourseGrid 
              courses={courses.filter(c => c.categories?.includes("Required")).slice(0, 6)} 
              searchQuery=""
              onEnrollmentUpdate={handleEnrollmentUpdate}
              isProfileComplete={!isProfileIncomplete}
              onEnrollmentBlocked={handleEnrollmentBlocked}
            />
          </div>
        )}

        {/* User's Technical Unit Courses - Only show when viewing "All Courses" and user has technical unit */}
        {selectedCategory === "All Courses" && user?.technicalUnit && courses.some(c => c.type === user.technicalUnit) && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-4 flex items-center gap-2">
              {user.technicalUnit} Courses
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                (Your technical unit)
              </span>
            </h2>
            <CourseGrid 
              courses={courses.filter(c => c.type === user.technicalUnit).slice(0, 6)} 
              searchQuery=""
              onEnrollmentUpdate={handleEnrollmentUpdate}
              isProfileComplete={!isProfileIncomplete}
              onEnrollmentBlocked={handleEnrollmentBlocked}
            />
          </div>
        )}

        {/* Course Grid */}
        <div className="mb-8" data-tour="courses">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-4">
            {selectedCategory === "All Courses" ? "All Courses" : selectedCategory}
          </h2>
          <CourseGrid 
            courses={paginatedCourses} 
            searchQuery={searchQuery}
            onEnrollmentUpdate={handleEnrollmentUpdate}
            isProfileComplete={!isProfileIncomplete}
            onEnrollmentBlocked={handleEnrollmentBlocked}
          />
        </div>

        {/* Pagination - YouTube Style */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white dark:bg-[var(--bg-elevated)] text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 border text-sm font-medium rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'border-lfc-red bg-lfc-red text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white dark:bg-[var(--bg-elevated)] text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default StudentDashboard;