// src/components/CourseModal.tsx - CLEANED UP UI
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Course } from "../../types/course";
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, 
         FaCheck, FaClock, FaUser, FaTag, FaArrowRight, 
         FaInfoCircle, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [currentPage, setCurrentPage] = useState<'video' | 'details'>('video');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // RESET STATE WHEN MODAL OPENS/CLOSES
  useEffect(() => {
    if (open && course.promoVideo) {
      setVideoError(false);
      setVideoLoaded(false);
      setCurrentPage('video');
      
      const timer = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          // Auto-play the video
          videoRef.current.play().catch(console.error);
        }
      }, 100);

      return () => clearTimeout(timer);
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [open, course.promoVideo]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  const handleEnroll = async () => {
    if (enrolled && course._id) {
      navigate(`/dashboard/courses/${course._id}`);
      onClose();
      return;
    }

    if (onEnroll && course._id) {
      try {
        await onEnroll(course._id);
        navigate(`/dashboard/courses/${course._id}`);
        onClose();
      } catch (err) {
        console.error("Enroll failed", err);
      }
    }
  };

  const togglePlayPause = async () => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        await videoRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Play/Pause failed:', error);
      setVideoError(true);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const nextPage = () => {
    setCurrentPage('details');
  };

  const prevPage = () => {
    setCurrentPage('video');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Modal Container */}
      <div 
        ref={modalRef}
        className="bg-black rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-black/90 transition-colors backdrop-blur-sm"
        >
          ✕
        </button>

        <AnimatePresence mode="wait">
          {/* VIDEO PAGE */}
          {currentPage === 'video' && (
            <motion.div
              key="video-page"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full flex flex-col"
            >
              {/* Main Video Area */}
              <div 
                className="flex-1 relative bg-black flex items-center justify-center"
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => setShowControls(false)}
              >
                {course.promoVideo && !videoError ? (
                  <>
                    <video
                      ref={videoRef}
                      src={course.promoVideo}
                      className="w-full h-full object-contain bg-black"
                      muted={isMuted}
                      autoPlay
                      onEnded={() => setIsPlaying(false)}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onError={() => setVideoError(true)}
                      onLoadedData={() => setVideoLoaded(true)}
                      playsInline
                      preload="auto"
                    />
                    
                    {/* Video Controls Overlay - Show on hover */}
                    <AnimatePresence>
                      {showControls && (
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="absolute bottom-6 left-6 right-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <button
                                  onClick={togglePlayPause}
                                  className="text-white hover:text-gray-300 transition-colors bg-black/60 rounded-full p-3 backdrop-blur-sm"
                                >
                                  {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
                                </button>
                                <button
                                  onClick={toggleMute}
                                  className="text-white hover:text-gray-300 transition-colors bg-black/60 rounded-full p-3 backdrop-blur-sm"
                                >
                                  {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
                                </button>
                              </div>
                              <button
                                onClick={toggleFullscreen}
                                className="text-white hover:text-gray-300 transition-colors bg-black/60 rounded-full p-3 backdrop-blur-sm"
                              >
                                <FaExpand size={20} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Loading Indicator */}
                    {!videoLoaded && !videoError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black">
                        <div className="text-white text-center">
                          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                        </div>
                      </div>
                    )}

                    {/* Central Play Button - Show when paused */}
                    {!isPlaying && videoLoaded && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center cursor-pointer"
                        onClick={togglePlayPause}
                      >
                        <div className="w-20 h-20 bg-lfc-red/90 hover:bg-lfc-red rounded-full flex items-center justify-center transition-all backdrop-blur-sm">
                          <FaPlay size={30} className="ml-2 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Skip to Details Button */}
                    <motion.button
                      onClick={nextPage}
                      className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm text-white rounded-lg px-4 py-2 flex items-center space-x-2 hover:bg-white/30 transition-all group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaInfoCircle className="text-lg" />
                      <span>Course Details</span>
                      <FaChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </>
                ) : (
                  /* VIDEO ERROR FALLBACK */
                  <div className="text-center text-white p-8">
                    <FaPlay className="text-6xl mx-auto mb-4 text-gray-400" />
                    <h3 className="text-2xl font-bold mb-2">Promo Video Unavailable</h3>
                    <button
                      onClick={nextPage}
                      className="bg-lfc-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 mx-auto"
                    >
                      <span>View Course Details</span>
                      <FaArrowRight />
                    </button>
                  </div>
                )}
              </div>

              {/* Course Title & Quick Info */}
              <div className="p-6 bg-gradient-to-t from-black to-transparent border-t border-white/10">
                <h2 className="text-2xl font-bold text-white mb-2">{course.title}</h2>
                <p className="text-gray-300 line-clamp-2">{course.description}</p>
                
                {/* Quick Action Bar */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-300">
                    <span className="flex items-center space-x-1">
                      <FaClock />
                      <span>{course.duration || 'Self-paced'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <FaTag />
                      <span>{course.type}</span>
                    </span>
                  </div>
                  
                  <motion.button
                    onClick={nextPage}
                    className="bg-lfc-red text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>Learn More</span>
                    <FaArrowRight />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* DETAILS PAGE */}
          {currentPage === 'details' && (
            <motion.div
              key="details-page"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full flex"
            >
              {/* Back to Video Panel */}
              <motion.div 
                className="w-16 bg-gray-900 border-r border-gray-700 flex flex-col items-center py-6 cursor-pointer group"
                onClick={prevPage}
                whileHover={{ width: 120 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center space-x-2 text-white mb-4">
                  <FaPlay className="text-lg" />
                  <motion.span 
                    className="text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  >
                    Back to Video
                  </motion.span>
                </div>
                
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-white/40 text-xs transform -rotate-90 whitespace-nowrap">
                    Click to go back
                  </div>
                </div>
              </motion.div>

              {/* Details Content - Scrollable */}
              <div className="flex-1 flex flex-col bg-white overflow-hidden">
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h2>
                  
                  {/* Instructor Info */}
                  {course.instructor && (
                    <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-xl">
                      {course.instructor.avatar ? (
                        <img
                          src={course.instructor.avatar}
                          alt={course.instructor.name}
                          className="w-12 h-12 rounded-full mr-4 object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-lfc-gold flex items-center justify-center mr-4">
                          <FaUser className="text-white text-lg" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{course.instructor.name}</p>
                        <p className="text-sm text-gray-600">Course Instructor</p>
                      </div>
                    </div>
                  )}

                  <p className="text-gray-700 mb-8 text-lg leading-relaxed">{course.description}</p>

                  {/* Progress Bar for enrolled students */}
                  {enrolled && progress > 0 && (
                    <div className="mb-8">
                      <div className="flex justify-between text-gray-600 mb-3">
                        <span className="font-semibold">Your progress</span>
                        <span className="font-bold">{progress}% complete</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-lfc-gold h-3 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Objectives */}
                  {course.objectives && course.objectives.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <FaCheck className="text-green-500 mr-3" />
                        What you'll learn
                      </h3>
                      <div className="grid gap-3">
                        {course.objectives.map((obj, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-start p-3 bg-green-50 rounded-lg border border-green-200"
                          >
                            <span className="text-green-500 mr-3 mt-1 flex-shrink-0">✓</span>
                            <span className="text-gray-700">{obj}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Course Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center mb-2">
                        <FaTag className="text-blue-500 mr-2" />
                        <span className="font-semibold text-blue-700">Category</span>
                      </div>
                      <p className="text-blue-600">{course.type}</p>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center mb-2">
                        <FaClock className="text-purple-500 mr-2" />
                        <span className="font-semibold text-purple-700">Level</span>
                      </div>
                      <p className="text-purple-600">{course.level}</p>
                    </div>
                    
                    {course.duration && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center mb-2">
                          <FaClock className="text-green-500 mr-2" />
                          <span className="font-semibold text-green-700">Duration</span>
                        </div>
                        <p className="text-green-600">{course.duration}</p>
                      </div>
                    )}
                  </div>

                  {/* Prerequisites */}
                  {course.prerequisites && course.prerequisites.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Prerequisites</h3>
                      <ul className="space-y-2">
                        {course.prerequisites.map((pre, idx) => (
                          <li key={idx} className="flex items-start text-gray-700">
                            <span className="text-gray-400 mr-3 mt-1 flex-shrink-0">•</span>
                            <span>{pre}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Fixed Action Buttons */}
                <div className="p-6 border-t border-gray-200 bg-white">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={onClose}
                      className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-lg flex-1"
                    >
                      Close Preview
                    </button>
                    <button
                      onClick={handleEnroll}
                      disabled={isEnrolling}
                      className={`px-8 py-4 rounded-xl text-white font-semibold text-lg flex items-center justify-center transition-all ${
                        enrolled
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-lfc-red hover:bg-red-700"
                      } disabled:opacity-50 disabled:cursor-not-allowed flex-1`}
                    >
                      {enrolled ? (
                        <>
                          {progress > 0 ? "Continue Learning" : "Start Learning"}
                        </>
                      ) : isEnrolling ? (
                        "Enrolling..."
                      ) : (
                        "Enroll Now"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CourseModal;