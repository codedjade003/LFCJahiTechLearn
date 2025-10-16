// src/components/CourseCard.tsx
import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Course } from "../../types/course";
import CourseModal from "./CourseModal";

interface Props extends Course {
  onEnroll?: (courseId: string) => Promise<void>;
  promoVideo?: string;
}

const levelColor: Record<NonNullable<Course["level"]>, string> = {
  Beginner: "bg-lfc-gold text-white",
  Intermediate: "bg-lfc-red text-white",
  Advanced: "bg-lfc-red text-white",
};

const typeColor: Record<string, string> = {
  Video: "text-lfc-red",
  Audio: "text-lfc-gold",
  Graphics: "text-lfc-red",
  Required: "text-lfc-red",
  "Content Creation": "text-lfc-gold",
  Utility: "text-gray-600",
  Secretariat: "text-gray-600",
  DEFAULT: "text-gray-600",
};

// Add this function above your component
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function resolveImageUrl(url?: string) {
  if (!url) return ""; // fallback handled later
  return url.startsWith("http") ? url : `${API_BASE}${url}`;
}

// Utility function to optimize image URLs and handle WebP
const optimizeImageUrl = (url: string | undefined, width: number = 400, height: number = 300): string => {
  if (!url) return "/default-course.png";
  
  // Resolve server paths first
  const resolvedUrl = resolveImageUrl(url);
  
  // If it's a Cloudinary URL, optimize it
  if (resolvedUrl.includes('cloudinary.com')) {
    return resolvedUrl.replace('/upload/', `/upload/w_${width},h_${height},c_fill,f_auto,q_auto/`);
  }
  
  // For other URLs, return resolved URL - let browser handle WebP support
  return resolvedUrl;
};

const CourseCard: React.FC<Props> = ({
  _id,
  title,
  description,
  duration,
  tags = [],
  instructor,
  instructors = [],
  progress = 0,
  level = "Beginner",
  type = "Video",
  thumbnail,
  promoVideo,
  categories,
  enrolled = false,
  objectives = [],
  prerequisites = [],
  isPublic = true,
  onEnroll,
}) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [avatarStatus, setAvatarStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  if (!isPublic) return null;

  const displayCategory =
    (Array.isArray(categories) && categories.length ? categories[0] : type) ||
    "Video";
  const typeClass = typeColor[displayCategory] || typeColor.DEFAULT;

  // Preload images to prevent flickering
  useEffect(() => {
    if (thumbnail) {
      const img = new Image();
      img.src = optimizeImageUrl(thumbnail);
      img.onload = () => setImageStatus('loaded');
      img.onerror = () => setImageStatus('error');
    } else {
      setImageStatus('error');
    }
  }, [thumbnail]);

  const handleImageLoad = useCallback(() => {
    setImageStatus('loaded');
  }, []);

  const handleImageError = useCallback(() => {
    setImageStatus('error');
  }, []);

  const handleAvatarLoad = useCallback(() => {
    setAvatarStatus('loaded');
  }, []);

  const handleAvatarError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setAvatarStatus('error');
    const img = e.currentTarget;
    
    // If WebP fails, try JPEG fallback before default
    if (img.src.toLowerCase().includes('.webp')) {
      const jpegUrl = img.src.replace(/\.webp$/i, '.jpg');
      const pngUrl = img.src.replace(/\.webp$/i, '.png');
      
      // Try JPEG first, then PNG, then default
      img.onerror = null; // Remove current handler to prevent loop
      img.src = jpegUrl;
      
      img.onerror = () => {
        img.onerror = null;
        img.src = pngUrl;
        
        img.onerror = () => {
          img.src = "/default-avatar.png";
          setAvatarStatus('loaded');
        };
      };
    } else {
      img.src = "/default-avatar.png";
      setAvatarStatus('loaded');
    }
  }, []);

  const handleEnrollClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!_id) return;

    if (enrolled) {
      navigate(`/dashboard/courses/${_id}`);
      return;
    }

    if (onEnroll) {
      setIsEnrolling(true);
      try {
        await onEnroll(_id);
        navigate(`/dashboard/courses/${_id}`);
      } catch (err) {
        console.error("Enroll failed", err);
      } finally {
        setIsEnrolling(false);
      }
    }
  };

  const handleCardClick = () => {
    if (_id) setShowModal(true);
  };

  const buttonText = enrolled
    ? progress > 0
      ? "Continue"
      : "Start"
    : isEnrolling
    ? "Enrolling..."
    : "Enroll";

  const buttonClass = enrolled
    ? "bg-blue-600 hover:bg-blue-700 text-white"
    : "bg-lfc-red hover:bg-red-700 text-white";

  const displayInstructor =
    instructor?.name || instructors[0]?.name || "Unknown Instructor";
  const displayAvatar = optimizeImageUrl(
    instructor?.avatar || instructors[0]?.avatar,
    80,
    80
  );

  // Get final image URLs with proper fallbacks
  const getThumbnailUrl = () => {
    return imageStatus === 'error' 
      ? "/default-course.png" 
      : optimizeImageUrl(thumbnail) || "/default-course.png";
  };

  const getAvatarUrl = () => {
    return avatarStatus === 'error'
      ? "/default-avatar.png"
      : displayAvatar || "/default-avatar.png";
  };

  return (
    <>
      <div
        className="course-card flex flex-col bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer w-full max-w-sm mx-auto"
        onClick={handleCardClick}
      >
        {/* Thumbnail Section - Fixed flickering */}
        <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
          {/* Main Image */}
          <img
            src={getThumbnailUrl()}
            alt={title}
            className={`w-full h-full object-cover transition-all duration-300 ${
              imageStatus === 'loaded' ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            decoding="async"
          />
          
          {/* Loading State */}
          {imageStatus === 'loading' && (
            <div className="absolute inset-0 bg-gray-300 animate-pulse flex items-center justify-center">
              <div className="text-gray-400">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          )}

          {/* Error State Fallback */}
          {imageStatus === 'error' && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">Course Image</span>
              </div>
            </div>
          )}

          {/* Progress Bar Overlay */}
          {enrolled && progress > 0 && (
            <div className="absolute bottom-0 left-0 w-full bg-gray-800 bg-opacity-50">
              <div
                className="bg-lfc-red h-1.5 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <div className={`text-xs font-semibold px-2 py-1 rounded bg-white/90 ${typeClass} border backdrop-blur-sm`}>
              {displayCategory}
            </div>
            
            {level && (
              <div className={`text-xs font-bold px-2 py-1 rounded ${levelColor[level]} shadow-sm`}>
                {level}
              </div>
            )}
          </div>

          {/* Enrollment Badge */}
          {enrolled && (
            <div className="absolute top-12 left-3">
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                Enrolled • {progress}%
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-1 p-6">
          {/* Duration */}
          {duration && duration !== "NaN" && (
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{duration}</span>
            </div>
          )}

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-3 leading-tight">
            {title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed">
            {description}
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-lfc-gold/20 text-lfc-gold text-sm rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Progress Bar */}
          {enrolled && progress > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span className="font-medium">Your progress</span>
                <span>{progress}% complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-lfc-red h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              {/* Instructor Avatar */}
              <div className="flex items-center min-w-0 flex-1">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  <img
                    className="w-full h-full object-cover"
                    src={getAvatarUrl()}
                    alt={displayInstructor}
                    onLoad={handleAvatarLoad}
                    onError={handleAvatarError}
                    loading="lazy"
                    decoding="async"
                  />
                  {avatarStatus === 'loading' && (
                    <div className="absolute inset-0 bg-gray-300 animate-pulse" />
                  )}
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700 truncate">
                  {displayInstructor}
                </span>
              </div>

              {/* Enroll Button */}
              <button
                onClick={handleEnrollClick}
                disabled={isEnrolling}
                className={`px-5 py-2.5 font-medium rounded-lg transition-all duration-200 flex items-center justify-center min-w-[120px] ${buttonClass} ${
                  isEnrolling ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-lg transform hover:scale-105'
                }`}
              >
                {isEnrolling ? (
                  <svg className="animate-spin w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : enrolled ? (
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )}
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>

      <CourseModal
        course={{
          _id,
          title,
          description,
          duration,
          tags,
          instructor,
          instructors,
          progress,
          level,
          type,
          thumbnail,
          promoVideo,
          categories,
          enrolled,
          objectives,
          prerequisites,
          isPublic,
        }}
        open={showModal}
        onClose={() => setShowModal(false)}
        onEnroll={onEnroll}
        isEnrolling={isEnrolling}
        enrolled={enrolled}
        progress={progress}
      />
    </>
  );
};

export default CourseCard;