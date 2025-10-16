// src/pages/Dashboard/CourseDetails.tsx
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaPlay, 
  FaFilePdf, 
  FaCheckCircle,
  FaClock,
  FaBook,
  FaChevronDown,
  FaChevronRight,
  FaDownload,
  FaVideo,
  FaFileAlt,
  FaTrophy,
  FaGraduationCap
} from "react-icons/fa";
import { FaLinkedin, FaWhatsapp, FaFacebook, FaXTwitter } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import Certificate from "../../components/shared/Certificate";
import { useAuth } from "../../context/AuthContext";
import ModuleSurvey, { SurveyData } from "../../components/shared/ModuleSurvey";

interface Module {
  _id: string;
  type: 'video' | 'pdf' | 'quiz';
  title: string;
  description?: string;
  contentUrl?: string;
  duration?: string;
  estimatedDuration?: {
    value: number;
    unit: string;
  };
  quiz?: {
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: string;
    }>;
    dueDate?: string;
    timeLimit?: number; // Add this line
  };
}

interface Section {
  _id: string;
  title: string;
  description?: string;
  modules: Module[];
}

interface Course {
  _id: string;
  title: string;
  description: string;
  categories: string[];
  level: "Beginner" | "Intermediate" | "Advanced";
  type: string;
  duration: string;
  prerequisites: string[];
  objectives: string[];
  thumbnail?: string;
  instructor: {
    name: string;
    avatar?: string;
  };
  sections: Section[];
}

interface Enrollment {
  _id: string;
  progress: number;
  completed: boolean;
  completedAt?: string;
  sectionProgress: Array<{
    sectionId: string;
    completed: boolean;
    modulesCompleted: number;
    totalModules: number;
  }>;
  moduleProgress: Array<{
    moduleId: string;
    completed: boolean;
    completedAt?: string;
  }>;
}

type Page = 'overview' | 'modules' | 'completion';

// Add this component above CourseDetails
// Enhanced QuizComponent with Advanced Proctoring
const QuizComponent = ({ module, onComplete }: { module: Module; onComplete: () => void }) => {
  const { courseId } = useParams();
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  
  const [quizState, setQuizState] = useState({
    currentQuestion: 0,
    selectedAnswer: null as string | null,
    score: 0,
    showResults: false,
    userAnswers: [] as string[],
    submitted: false
  });

  const [proctoring, setProctoring] = useState({
    fullscreenAttempted: false,
    tabSwitches: 0,
    visibilityChanges: 0,
    startTime: Date.now(),
    violations: 0,
    timeLeft: module.quiz?.timeLimit || 1800 // 30 minutes default
  });

  const handleAnswerSelect = (answer: string) => {
    setQuizState(prev => ({ ...prev, selectedAnswer: answer }));
  };

  const handleNextQuestion = () => {
    if (!quizState.selectedAnswer) return;

    const question = module.quiz?.questions[quizState.currentQuestion];
    let newScore = quizState.score;
    
    if (quizState.selectedAnswer === question?.correctAnswer) {
      newScore += 1;
    }

    const nextQuestion = quizState.currentQuestion + 1;
    const totalQuestions = module.quiz?.questions.length || 0;
    
    if (nextQuestion < totalQuestions) {
      setQuizState({
        currentQuestion: nextQuestion,
        selectedAnswer: null,
        score: newScore,
        showResults: false,
        userAnswers: [...quizState.userAnswers, quizState.selectedAnswer],
        submitted: false
      });
    } else {
      const finalAnswers = [...quizState.userAnswers, quizState.selectedAnswer];
      const finalScore = newScore;
      
      setQuizState(prev => ({ 
        ...prev, 
        showResults: true,
        score: finalScore,
        userAnswers: finalAnswers,
        submitted: false
      }));
    }
  };

  const handleQuizCompletion = async () => {
    if (quizState.submitted) return;
    
    const totalQuestions = module.quiz?.questions.length || 0;
    const percentage = (quizState.score / totalQuestions) * 100;
    const passed = percentage >= 70;

    setQuizState(prev => ({ ...prev, submitted: true }));

    try {
      await submitQuizResults(quizState.userAnswers, quizState.score, passed);
      
      if (passed) {
        // Only complete if not requiring review
        onComplete();
      } else {
        toast.error(`Quiz failed. You scored ${percentage.toFixed(1)}%, but need 70% to pass.`);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error("Failed to submit quiz results");
      setQuizState(prev => ({ ...prev, submitted: false }));
    }
  };

  const submitQuizResults = async (answers: string[], score: number, passed: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const totalQuestions = module.quiz?.questions.length || 1;
      const percentage = (score / totalQuestions) * 100;
      const timeSpent = Date.now() - proctoring.startTime;
      
      // ✅ USE PROCTORING ROUTE INSTEAD OF OLD ROUTE
      const res = await fetch(`${API_BASE}/api/proctoring/${courseId}/quizzes/${module._id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          answers,
          score,
          percentage: percentage,
          passed: passed,
          proctoringData: {
            timeSpent,
            tabSwitches: proctoring.tabSwitches,
            violations: proctoring.violations,
            fullscreenAttempted: proctoring.fullscreenAttempted,
            timeLeft: proctoring.timeLeft
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        console.log('✅ Quiz submitted with proctoring:', data);
        
        // Show appropriate message based on review status
        if (data.requiresReview) {
          toast.warning("Quiz submitted but requires manual review");
        } else {
          toast.success("Quiz submitted successfully!");
        }
        
        return true;
      } else {
        const error = await res.json();
        console.error('Failed to submit quiz results:', error);
        throw new Error(error.message || 'Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw error;
    }
  };

  const recordViolation = (type: string) => {
    setProctoring(prev => ({
      ...prev,
      violations: prev.violations + 1
    }));
    
    logViolation(type);
  };

  const logViolation = async (type: string) => {
    try {
      const token = localStorage.getItem("token");
      
      // ✅ USE PROCTORING ROUTE FOR VIOLATIONS
      await fetch(`${API_BASE}/api/proctoring/${courseId}/quizzes/${module._id}/violation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type,
          timestamp: new Date().toISOString(),
          tabSwitches: proctoring.tabSwitches,
          violations: proctoring.violations + 1
        })
      });
    } catch (error) {
      console.error('Failed to log violation:', error);
    }
  };

  // Enhanced Proctoring System
  const enableAdvancedProctoring = () => {
    // 1. Force fullscreen
    const requestFullscreen = async () => {
      try {
        const element = document.documentElement;
        if (element.requestFullscreen) {
          await element.requestFullscreen();
          setProctoring(prev => ({ ...prev, fullscreenAttempted: true }));
        }
      } catch (err) {
        console.log('Fullscreen failed:', err);
        recordViolation('fullscreen_denied');
      }
    };

    // 2. Detect tab/window switches
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setProctoring(prev => ({
          ...prev,
          tabSwitches: prev.tabSwitches + 1,
          visibilityChanges: prev.visibilityChanges + 1
        }));
        recordViolation('tab_switch');
        toast.warning("⚠️ Please return to the quiz tab immediately!");
      }
    };

    // 3. Prevent right-click, copy, paste
    const preventDefaultActions = (e: Event) => {
      e.preventDefault();
      recordViolation('restricted_action');
      return false;
    };

    // 4. Detect developer tools
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        recordViolation('dev_tools_detected');
        toast.error("Developer tools detected! Please close them to continue.");
      }
    };

    // 5. Keyboard restrictions
    const blockShortcuts = (e: KeyboardEvent) => {
      const blockedKeys = [
        'F12', 'F11', 'PrintScreen', 'Escape',
        'Control', 'Alt', 'Meta', 'ContextMenu'
      ];
      
      if (e.ctrlKey || e.metaKey) {
        if (['c', 'v', 'u', 'i', 'j', 'a'].includes(e.key.toLowerCase())) {
          e.preventDefault();
          recordViolation(`keyboard_shortcut_${e.key}`);
          toast.warning("Keyboard shortcuts are disabled during quiz");
        }
      }
      
      if (blockedKeys.includes(e.key)) {
        e.preventDefault();
        recordViolation(`function_key_${e.key}`);
      }
    };

    // 6. Prevent dragging and text selection
    const preventDragAndSelect = (e: Event) => {
      e.preventDefault();
    };

    // Set up all event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', preventDefaultActions);
    document.addEventListener('copy', preventDefaultActions);
    document.addEventListener('cut', preventDefaultActions);
    document.addEventListener('paste', preventDefaultActions);
    document.addEventListener('keydown', blockShortcuts);
    document.addEventListener('dragstart', preventDragAndSelect);
    document.addEventListener('selectstart', preventDragAndSelect);

    // Start monitoring
    requestFullscreen();
    const devToolsInterval = setInterval(detectDevTools, 1000);

    return () => {
      // Cleanup
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', preventDefaultActions);
      document.removeEventListener('copy', preventDefaultActions);
      document.removeEventListener('cut', preventDefaultActions);
      document.removeEventListener('paste', preventDefaultActions);
      document.removeEventListener('keydown', blockShortcuts);
      document.removeEventListener('dragstart', preventDragAndSelect);
      document.removeEventListener('selectstart', preventDragAndSelect);
      clearInterval(devToolsInterval);
      
      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  };

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setProctoring(prev => {
        if (prev.timeLeft <= 0) {
          clearInterval(timer);
          handleAutoSubmit();
          return prev;
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const handleAutoSubmit = async () => {
    if (quizState.submitted) return;
    
    const totalQuestions = module.quiz?.questions.length || 0;
    const percentage = (quizState.score / totalQuestions) * 100;
    const passed = percentage >= 70;

    setQuizState(prev => ({ ...prev, submitted: true }));

    try {
      await submitQuizResults(quizState.userAnswers, quizState.score, passed);
      toast.info("Time's up! Quiz automatically submitted.");
      
      if (passed) {
        onComplete();
      }
    } catch (error) {
      console.error('Error auto-submitting quiz:', error);
      toast.error("Failed to auto-submit quiz");
    }
  };

  useEffect(() => {
    const cleanup = enableAdvancedProctoring();
    return cleanup;
  }, []);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (quizState.showResults) {
    const totalQuestions = module.quiz?.questions.length || 0;
    const percentage = (quizState.score / totalQuestions) * 100;
    const passed = percentage >= 70;

    return (
      <div className="text-center p-8 bg-white rounded-lg border border-gray-200">
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
          passed ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {passed ? (
            <FaTrophy className="text-3xl text-green-600" />
          ) : (
            <FaClock className="text-3xl text-red-600" />
          )}
        </div>
        <h3 className="text-2xl font-bold mb-2">
          {passed ? 'Quiz Completed! 🎉' : 'Quiz Failed 😔'}
        </h3>
        <p className="text-lg mb-2">Score: {quizState.score}/{totalQuestions}</p>
        <p className="text-lg mb-2">Percentage: {percentage.toFixed(1)}%</p>
        <p className="text-lg mb-6">
          {passed ? 'Congratulations! You passed the quiz.' : `You need 70% or higher to pass. ${percentage >= 60 ? 'You were close!' : 'Keep studying!'}`}
        </p>
        
        {/* Proctoring Summary */}
        {proctoring.violations > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              Note: {proctoring.violations} proctoring violation(s) were recorded during this attempt.
            </p>
          </div>
        )}
        
        {!passed && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              You can retake the quiz after reviewing the course material.
            </p>
          </div>
        )}
        
        <button 
          onClick={handleQuizCompletion}
          disabled={quizState.submitted}
          className="px-8 py-3 bg-lfc-red text-white rounded-lg hover:bg-lfc-gold-dark disabled:opacity-50 text-lg font-semibold"
        >
          {quizState.submitted ? 'Submitting...' : 'Continue'}
        </button>
        
        {!passed && (
          <button 
            onClick={() => window.location.reload()}
            className="ml-4 px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-lg font-semibold"
          >
            Retry Quiz
          </button>
        )}
      </div>
    );
  }

  const question = module.quiz?.questions[quizState.currentQuestion];
  if (!question) return null;

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      {/* Enhanced Quiz Header with Proctoring Info */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaClock className="text-red-500 mr-2" />
            <span className="text-red-700 font-semibold">Secure Quiz Mode Active</span>
          </div>
          <div className="text-red-600 font-bold">
            Time: {formatTime(proctoring.timeLeft)}
          </div>
        </div>
        <p className="text-red-600 text-sm mt-1">
          Fullscreen mode • Tab switching monitored • Right-click disabled • Keyboard shortcuts blocked
        </p>
        {proctoring.tabSwitches > 0 && (
          <p className="text-red-500 text-xs mt-1 font-semibold">
            ⚠️ Tab switches detected: {proctoring.tabSwitches}
          </p>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold">Question {quizState.currentQuestion + 1} of {module.quiz?.questions.length}</h3>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
            Score: {quizState.score}
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
            proctoring.violations === 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            Violations: {proctoring.violations}
          </div>
        </div>
      </div>
      
      <p className="text-lg mb-6 bg-gray-50 p-4 rounded-lg border">{question.question}</p>
      
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(option)}
            className={`w-full text-left p-4 rounded-lg border transition-all ${
              quizState.selectedAnswer === option 
                ? 'border-lfc-red bg-red-50 transform scale-105' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full border mr-3 flex items-center justify-center ${
                quizState.selectedAnswer === option 
                  ? 'border-lfc-red bg-lfc-red text-white' 
                  : 'border-gray-400'
              }`}>
                {quizState.selectedAnswer === option && '✓'}
              </div>
              <span>{option}</span>
            </div>
          </button>
        ))}
      </div>
      
      <div className="flex justify-between items-center mt-8">
        <div className="text-sm text-gray-500">
          Question {quizState.currentQuestion + 1} of {module.quiz?.questions.length}
        </div>
        <button
          onClick={handleNextQuestion}
          disabled={!quizState.selectedAnswer}
          className="px-8 py-3 bg-lfc-red text-white rounded-lg hover:bg-lfc-gold-dark disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {quizState.currentQuestion + 1 === module.quiz?.questions.length ? 'Finish Quiz' : 'Next Question'}
        </button>
      </div>

      {/* Time warning */}
      {proctoring.timeLeft < 300 && ( // 5 minutes warning
        <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
          <p className="text-orange-700 text-sm font-semibold">
            ⏰ Time warning: {formatTime(proctoring.timeLeft)} remaining
          </p>
        </div>
      )}
    </div>
  );
};

const resolveMediaUrl = (url: string | undefined) => {
  if (!url) return "";
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  
  // If it's already a full URL (Cloudinary, external, etc.), return as is
  if (url.startsWith('http')) {
    return url;
  }
  
  // If it's a Cloudinary URL without protocol
  if (url.includes('cloudinary.com') || url.includes('res.cloudinary.com')) {
    return `https://${url}`;
  }
  
  // For local files, prepend API base
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState<Page>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyModuleId, setSurveyModuleId] = useState<string | null>(null);
  const [surveyModuleTitle, setSurveyModuleTitle] = useState<string>('');

  const submitFeedback = async () => {
    if (!feedback.trim()) return;
    
    setSubmittingFeedback(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/courses/${courseId}/feedback`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          feedback: feedback.trim(),
          rating: rating 
        }),
      });
      
      if (res.ok) {
        setFeedback('');
        setRating(5);
        alert('Thank you for your feedback!');
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to submit feedback');
      }
    } catch (err) {
      console.error("Error submitting feedback", err);
      alert('Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
      fetchEnrollmentProgress();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/courses/${courseId}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setCourse(data);
        // Expand first section by default
        if (data.sections.length > 0) {
          setExpandedSections(new Set([data.sections[0]._id]));
        }
      }
    } catch (err) {
      console.error("Error fetching course data", err);
    }
  };

  const fetchEnrollmentProgress = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/progress/${courseId}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setEnrollment(data);
      }
    } catch (err) {
      console.error("Error fetching enrollment progress", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const markModuleComplete = async (moduleId: string, moduleTitle?: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error('No auth token');

      console.log('Marking module complete:', { courseId, moduleId });

      // ✅ CORRECT ENDPOINT - matches your backend route
      const res = await fetch(`${API_BASE}/api/progress/${courseId}/modules/${moduleId}/complete`, {
        method: "PUT", // ✅ Use PUT method, not POST
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });

      console.log('Response status:', res.status);

      if (res.ok) {
        const data = await res.json();
        console.log('Module marked complete:', data);
        await fetchEnrollmentProgress();
        toast.success("Module marked as complete!");
        
        // Show survey after marking complete
        if (moduleTitle) {
          setSurveyModuleId(moduleId);
          setSurveyModuleTitle(moduleTitle);
          setShowSurvey(true);
        }
      } else {
        const errorText = await res.text();
        console.log("Mark complete failed:", errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message === "Module already completed") {
            await fetchEnrollmentProgress();
            toast.info("Module already completed");
          } else {
            toast.error(errorData.message || "Failed to mark module complete");
          }
        } catch (parseError) {
          toast.error("Failed to mark module complete");
        }
      }
    } catch (err) {
      console.error("Error marking module complete:", err);
      toast.error("Network error while marking module complete");
    }
  };

  const handleSurveySubmit = async (surveyData: SurveyData) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/feedback/modules/${surveyModuleId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          ...surveyData
        })
      });

      if (res.ok) {
        toast.success("Thank you for your feedback!");
      } else {
        console.error("Failed to submit survey");
      }
    } catch (error) {
      console.error("Error submitting survey:", error);
    }
  };

  const isModuleCompleted = (moduleId: string) => {
    return enrollment?.moduleProgress?.some(mp => 
      mp.moduleId === moduleId && mp.completed
    ) || false;
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'video': return <FaVideo className="text-red-500" />;
      case 'pdf': return <FaFilePdf className="text-red-500" />;
      case 'quiz': return <FaFileAlt className="text-red-500" />;
      default: return <FaPlay className="text-red-500" />;
    }
  };

  // ShareButton Component
  const ShareButton = ({ 
    platform, 
    courseTitle, 
    progress,
    passed
  }: { 
    platform: 'linkedin' | 'x' | 'whatsapp' | 'facebook';
    courseTitle: string;
    progress: number;
    passed: boolean;
  }) => {
    const shareMessage = passed 
      ? `🎓 I successfully completed "${courseTitle}" with ${progress}% mastery! So proud of this achievement!`
      : `📚 I'm making great progress in "${courseTitle}" - currently at ${progress}% completion!`;

    const shareUrls = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&summary=${encodeURIComponent(shareMessage)}`,
      x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(window.location.origin)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareMessage} ${window.location.origin}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(shareMessage)}`
    };

    const platformIcons = {
      linkedin: <FaLinkedin className="text-xl" />,
      x: <FaXTwitter className="text-xl" />, // Using X/Twitter icon
      whatsapp: <FaWhatsapp className="text-xl" />,
      facebook: <FaFacebook className="text-xl" />
    };

    const platformColors = {
      linkedin: 'bg-blue-600 hover:bg-blue-700',
      x: 'bg-black hover:bg-gray-800',
      whatsapp: 'bg-green-500 hover:bg-green-600',
      facebook: 'bg-blue-800 hover:bg-blue-900'
    };

    const platformNames = {
      linkedin: 'LinkedIn',
      x: 'X',
      whatsapp: 'WhatsApp',
      facebook: 'Facebook'
    };

    const handleShare = () => {
      const url = shareUrls[platform];
      window.open(url, '_blank', 'width=600,height=400');
    };

    return (
      <button
        onClick={handleShare}
        className={`p-3 rounded-full text-white ${platformColors[platform]} transition-colors transform hover:scale-110`}
        title={`Share on ${platformNames[platform]}`}
      >
        <span className="text-xl font-bold">{platformIcons[platform]}</span>
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-yt-light-gray">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-yt-light-hover rounded w-1/3"></div>
            <div className="h-32 bg-yt-light-hover rounded"></div>
            <div className="h-8 bg-yt-light-hover rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col h-screen bg-yt-light-gray">
        <div className="p-6">
          <div className="bg-white p-8 rounded-lg text-center border border-yt-light-border">
            <p className="text-yt-text-gray mb-4">Course not found.</p>
            <Link to="/dashboard/courses" className="text-lfc-red hover:underline">
              Back to My Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-yt-light-gray">
      {/* Header */}
      <header className="bg-white border-b border-yt-light-border shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/dashboard/courses')}
                className="mr-4 p-2 rounded-md text-yt-text-dark hover:bg-yt-light-hover"
              >
                <FaArrowLeft />
              </button>
              <h1 className="text-2xl font-bold text-yt-text-dark">{course.title}</h1>
            </div>
            
            {enrollment && (
              <div className="text-right">
                <div className="text-sm text-yt-text-gray mb-1">Overall Progress</div>
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-yt-progress-light-bg rounded-full mr-3">
                    <div 
                      className="h-2 bg-lfc-gold rounded-full transition-all duration-300"
                      style={{ width: `${enrollment.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-semibold text-yt-text-dark">
                    {enrollment.progress}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-8 mt-4 border-b">
            {(['overview', 'modules'] as Page[]).map((page) => (
              <button
                key={page}
                onClick={() => setActivePage(page)}
                className={`pb-3 px-1 font-medium transition-colors ${
                  activePage === page
                    ? 'text-lfc-red border-b-2 border-lfc-red'
                    : 'text-yt-text-gray hover:text-yt-text-dark'
                }`}
              >
                {page === 'overview' && 'Overview'}
                {page === 'modules' && 'Course Content'}
              </button>
            ))}
            {/* Only show completion tab when course is fully completed */}
            {enrollment?.completed && (
              <button
                onClick={() => setActivePage('completion')}
                className={`pb-3 px-1 font-medium transition-colors ${
                  activePage === 'completion'
                    ? 'text-lfc-red border-b-2 border-lfc-red'
                    : 'text-yt-text-gray hover:text-yt-text-dark'
                }`}
              >
                Completion
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Course Outline */}
        <aside className="w-80 bg-white border-r border-yt-light-border overflow-y-auto">
          <div className="p-4">
            <h2 className="font-semibold text-yt-text-dark mb-4">Course Content</h2>
            <div className="space-y-2">
              {course.sections.map((section) => {
                const sectionProgress = enrollment?.sectionProgress?.find(sp => 
                  sp.sectionId === section._id
                ) || { completed: false, modulesCompleted: 0, totalModules: section.modules.length };
                
                const isExpanded = expandedSections.has(section._id);

                return (
                  <div key={section._id} className="border border-yt-light-border rounded-lg">
                    <button
                      onClick={() => toggleSection(section._id)}
                      className="w-full text-left p-3 rounded-lg hover:bg-yt-light-hover transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                          <h3 className="font-medium text-yt-text-dark">{section.title}</h3>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-yt-text-gray">
                          <span>{sectionProgress.modulesCompleted}/{sectionProgress.totalModules}</span>
                          {sectionProgress.completed && <FaCheckCircle className="text-green-500" />}
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="pl-8 pr-3 pb-3 space-y-2">
                            {section.modules.map((module) => {
                              const isCompleted = isModuleCompleted(module._id);
                              return (
                                <button
                                  key={module._id}
                                  onClick={() => {
                                    setActiveModule(module._id);
                                    setActivePage('modules');
                                  }}
                                  className={`w-full text-left p-2 rounded text-sm transition-colors ${
                                    isCompleted
                                      ? 'text-green-600 bg-green-50'
                                      : 'text-yt-text-dark hover:bg-yt-light-hover'
                                  } ${
                                    activeModule === module._id ? 'bg-lfc-red bg-opacity-10' : ''
                                  }`}
                                >
                                  <div className="flex items-center space-x-2">
                                    {getModuleIcon(module.type)}
                                    <span className="flex-1 truncate">{module.title}</span>
                                    {module.duration && (
                                      <span className="text-xs text-yt-text-gray">{module.duration}</span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-white p-6">
          <AnimatePresence mode="wait">
            {activePage === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl"
              >
                {/* Course Info Badges */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="px-3 py-1 bg-lfc-red bg-opacity-10 text-lfc-red rounded-full text-sm">
                    {course.type}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                    {course.level}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                    {course.duration}
                  </span>
                  {course.categories.map((category, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                      {category}
                    </span>
                  ))}
                </div>

                {/* Description */}
                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-3">Description</h2>
                  <p className="text-yt-text-gray leading-relaxed">{course.description}</p>
                </section>

                {/* Objectives */}
                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-3">Learning Objectives</h2>
                  <ul className="space-y-2">
                    {course.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                        <span className="text-yt-text-gray">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Prerequisites */}
                {course.prerequisites.length > 0 && (
                  <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-3">Prerequisites</h2>
                    <ul className="space-y-2">
                      {course.prerequisites.map((prereq, index) => (
                        <li key={index} className="flex items-start">
                          <FaBook className="text-lfc-red mt-1 mr-3 flex-shrink-0" />
                          <span className="text-yt-text-gray">{prereq}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Instructor */}
                <section>
                  <h2 className="text-xl font-semibold mb-3">Instructor</h2>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-lfc-gold rounded-full flex items-center justify-center">
                      <FaGraduationCap className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{course.instructor.name}</h3>
                      <p className="text-yt-text-gray">Course Instructor</p>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}

            {activePage === 'modules' && (
              <motion.div
                key="modules"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl"
              >
                {activeModule ? (() => {
                  const module = course.sections
                    .flatMap(s => s.modules)
                    .find(m => m._id === activeModule);

                  if (!module) return null;

                  // FIX: Remove the extra { before module.type check
                  if (module.type === 'quiz') {
                    return (
                      <QuizComponent 
                        module={module} 
                        onComplete={() => {
                          markModuleComplete(module._id, module.title);
                          setActiveModule(null);
                        }} 
                      />
                    );
                  }

                  return (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-2xl font-bold mb-2">{module.title}</h2>
                          <div className="flex items-center space-x-4 text-yt-text-gray">
                            <span className="flex items-center">
                              {getModuleIcon(module.type)}
                              <span className="ml-2 capitalize">{module.type}</span>
                            </span>
                            {module.duration && (
                              <span className="flex items-center">
                                <FaClock className="mr-1" />
                                {module.duration}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {!isModuleCompleted(module._id) && (
                          <button
                            onClick={async () => {
                              try {
                                await markModuleComplete(module._id, module.title);
                              } catch (error) {
                                console.error("Failed to mark complete:", error);
                              }
                            }}
                            className="px-6 py-2 bg-lfc-red text-white rounded-md hover:bg-lfc-gold-dark"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>

                      {module.description && (
                        <p className="text-yt-text-gray mb-6">{module.description}</p>
                      )}

                      {module.type === 'video' && module.contentUrl && (
                        <div className="bg-black rounded-lg overflow-hidden mb-6">
                          <video 
                            controls 
                            className="w-full h-auto max-h-96"
                            src={resolveMediaUrl(module.contentUrl)}
                            onError={(e) => {
                              console.error('Failed to load video:', module.contentUrl);
                              const videoElement = e.target as HTMLVideoElement;
                              videoElement.style.display = 'none';
                              // Show error message
                              const errorDiv = document.createElement('div');
                              errorDiv.className = 'text-white p-4 text-center';
                              errorDiv.innerHTML = `
                                <p>Failed to load video</p>
                                <p class="text-sm opacity-75">URL: ${module.contentUrl}</p>
                                <button onclick="window.open('${resolveMediaUrl(module.contentUrl)}', '_blank')" 
                                        class="mt-2 px-4 py-2 bg-red-600 rounded hover:bg-red-700">
                                  Open Video in New Tab
                                </button>
                              `;
                              (e.target as HTMLElement).parentNode?.appendChild(errorDiv);
                            }}
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}

                      {module.type === 'pdf' && module.contentUrl && (
                        <div className="border rounded-lg p-6 text-center">
                          <FaFilePdf className="text-4xl text-red-500 mx-auto mb-4" />
                          <p className="text-yt-text-gray mb-4">PDF Document</p>
                          <a
                            href={resolveMediaUrl(module.contentUrl)}
                            download
                            className="px-6 py-2 bg-lfc-red text-white rounded-md hover:bg-lfc-gold-dark inline-flex items-center"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FaDownload className="mr-2" />
                            Download PDF
                          </a>
                        </div>
                      )}

                      {isModuleCompleted(module._id) && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                          <div className="flex items-center text-green-600">
                            <FaCheckCircle className="mr-2" />
                            <span>Module completed</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })() : (
                  <div className="text-center py-12">
                    <FaBook className="text-4xl text-yt-text-gray mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Select a module to begin</h3>
                    <p className="text-yt-text-gray">Choose a module from the sidebar to start learning</p>
                  </div>
                )}
              </motion.div>
            )}

            {activePage === 'completion' && (
              <motion.div
                key="completion"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="max-w-2xl mx-auto text-center"
              >
                {/* Calculate completion status */}
                {(() => {
                  const totalModules = course.sections.flatMap(s => s.modules).length;
                  const completedModules = enrollment?.moduleProgress?.filter(m => m.completed).length || 0;
                  const allModulesCompleted = completedModules === totalModules && totalModules > 0;
                  const progressPercentage = enrollment?.progress || 0;
                  const passed = allModulesCompleted && progressPercentage >= 70; // Use the 70% threshold

                  // Only show full celebration if all modules are completed AND passed
                  if (passed) {
                    return (
                      <div>
                        <div className="bg-gradient-to-br from-lfc-red to-lfc-gold p-1 rounded-full w-32 h-32 mx-auto mb-6">
                          <div className="bg-white rounded-full w-full h-full flex items-center justify-center">
                            <FaTrophy className="text-4xl text-yellow-500" />
                          </div>
                        </div>
                        
                        <h2 className="text-3xl font-bold mb-4">Congratulations! 🎉</h2>
                        <p className="text-xl text-yt-text-gray mb-8">
                          You've successfully completed <strong>{course.title}</strong> with flying colors!
                        </p>

                        <div className="bg-gray-50 rounded-lg p-6 mb-8">
                          <h3 className="font-semibold mb-4">Course Completion Details</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-yt-text-gray">Final Score</span>
                              <div className="font-semibold text-2xl text-green-600">{progressPercentage}%</div>
                            </div>
                            <div>
                              <span className="text-yt-text-gray">Modules Completed</span>
                              <div className="font-semibold text-2xl">
                                {completedModules}/{totalModules}
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 text-sm text-green-600 font-semibold">
                            ✅ Passed with excellence!
                          </div>
                        </div>

                        {/* Certificate Section */}
                        <div className="mb-8">
                          <Certificate
                            studentName={user?.name || "Student"}
                            courseName={course.title}
                            completionDate={enrollment?.completedAt || new Date().toISOString()}
                            score={progressPercentage}
                          />
                        </div>

                        {/* Share Section */}
                        <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                          <h3 className="font-semibold mb-4 text-blue-800">
                            {passed ? 'Share Your Achievement!' : 'Share Your Progress!'}
                          </h3>
                          <p className="text-blue-700 mb-4">
                            {passed 
                              ? 'Celebrate your success and inspire others!'
                              : 'Let people know about your learning journey!'
                            }
                          </p>
                          <div className="flex justify-center space-x-4">
                            <ShareButton 
                              platform="linkedin"
                              courseTitle={course.title}
                              progress={progressPercentage}
                              passed={passed}
                            />
                            <ShareButton 
                              platform="x"
                              courseTitle={course.title}
                              progress={progressPercentage}
                              passed={passed}
                            />
                            <ShareButton 
                              platform="whatsapp"
                              courseTitle={course.title}
                              progress={progressPercentage}
                              passed={passed}
                            />
                            <ShareButton 
                              platform="facebook"
                              courseTitle={course.title}
                              progress={progressPercentage}
                              passed={passed}
                            />
                          </div>
                        </div>

                        <div className="mb-8">
                          <h3 className="font-semibold mb-4">Share Your Feedback</h3>
                          <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="What did you think of this course? Share your experience..."
                            className="w-full h-32 p-3 border border-yt-light-border rounded-lg resize-none focus:outline-none focus:border-lfc-red"
                          />
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Rating</label>
                            <div className="flex space-x-1 justify-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setRating(star)}
                                  className="text-2xl focus:outline-none"
                                >
                                  {star <= rating ? '⭐' : '☆'}
                                </button>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={submitFeedback}
                            disabled={submittingFeedback || !feedback.trim()}
                            className="mt-3 px-6 py-2 bg-lfc-red text-white rounded-md hover:bg-lfc-gold-dark disabled:opacity-50"
                          >
                            {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                          </button>
                        </div>

                        <div className="flex justify-center space-x-4">
                          <button
                            onClick={() => navigate('/dashboard/courses')}
                            className="px-6 py-2 border border-yt-light-border rounded-md hover:bg-yt-light-hover"
                          >
                            Back to Courses
                          </button>
                          <button
                            onClick={() => setActivePage('overview')}
                            className="px-6 py-2 bg-lfc-red text-white rounded-md hover:bg-lfc-gold-dark"
                          >
                            Review Course
                          </button>
                        </div>
                      </div>
                    );
                  } else {
                    // Show progress instead of completion
                    return (
                      <div>
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1 rounded-full w-32 h-32 mx-auto mb-6">
                          <div className="bg-white rounded-full w-full h-full flex items-center justify-center">
                            <FaClock className="text-4xl text-blue-500" />
                          </div>
                        </div>
                        
                        <h2 className="text-3xl font-bold mb-4">Keep Going! 💪</h2>
                        <p className="text-xl text-yt-text-gray mb-8">
                          You're making great progress in <strong>{course.title}</strong>
                        </p>

                        <div className="bg-gray-50 rounded-lg p-6 mb-8">
                          <h3 className="font-semibold mb-4">Your Progress</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-yt-text-gray">Overall Progress</span>
                              <div className="font-semibold text-2xl">{progressPercentage}%</div>
                            </div>
                            <div>
                              <span className="text-yt-text-gray">Modules Completed</span>
                              <div className="font-semibold text-2xl">
                                {completedModules}/{totalModules}
                              </div>
                            </div>
                          </div>
                          <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-4">
                              <div 
                                className="bg-lfc-red h-4 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-center space-x-4">
                          <button
                            onClick={() => setActivePage('modules')}
                            className="px-6 py-2 bg-lfc-red text-white rounded-md hover:bg-lfc-gold-dark"
                          >
                            Continue Learning
                          </button>
                          <button
                            onClick={() => navigate('/dashboard/courses')}
                            className="px-6 py-2 border border-yt-light-border rounded-md hover:bg-yt-light-hover"
                          >
                            Back to Courses
                          </button>
                        </div>
                      </div>
                    );
                  }
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Module Survey Modal */}
      {showSurvey && surveyModuleId && courseId && (
        <ModuleSurvey
          moduleTitle={surveyModuleTitle}
          courseId={courseId}
          moduleId={surveyModuleId}
          onClose={() => setShowSurvey(false)}
          onSubmit={handleSurveySubmit}
        />
      )}
    </div>
  );
}