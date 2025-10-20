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
import { motion, AnimatePresence } from "framer-motion";
import { ShareButton } from "../../components/ShareButton";
import ModuleSurvey, { type SurveyData } from "../../components/shared/ModuleSurvey";
import ModuleOverviewModal from "../../components/Student/ModuleOverviewModal";
import ModuleCompletionModal from "../../components/Student/ModuleCompletionModal";
import OnboardingTour from "../../components/shared/OnboardingTour";
import { courseDetailsTour } from "../../config/onboardingTours";

interface Module {
  _id: string;
  type: 'video' | 'pdf' | 'quiz';
  title: string;
  description?: string;
  objectives?: string[];
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
    timeLimit?: number;
  };
  survey?: {
    questions: Array<{
      question: string;
      type: "text" | "rating" | "multiple-choice";
      options?: string[];
    }>;
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
const QuizComponent = ({ 
  module, 
  onComplete,
  setPendingModule,
  setShowCompletionModal
}: { 
  module: Module; 
  onComplete: () => void;
  setPendingModule: (module: Module) => void;
  setShowCompletionModal: (show: boolean) => void;
}) => {
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
        // Show completion modal with survey instead of directly completing
        setPendingModule(module);
        setShowCompletionModal(true);
        onComplete(); // Still mark as complete in the background
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
      <div className="text-center p-8 bg-white dark:bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-primary)]">
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
          passed ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {passed ? (
            <FaTrophy className="text-3xl text-green-700 dark:text-green-300" />
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
          <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 mb-6">
            <p className="text-yellow-900 dark:text-yellow-200 text-sm">
              Note: {proctoring.violations} proctoring violation(s) were recorded during this attempt.
            </p>
          </div>
        )}
        
        {!passed && (
          <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 mb-6">
            <p className="text-yellow-900 dark:text-yellow-200">
              You can retake the quiz after reviewing the course material.
            </p>
          </div>
        )}
        
        <button 
          onClick={handleQuizCompletion}
          disabled={quizState.submitted}
          className="px-8 py-3 bg-lfc-red dark:bg-red-800 text-gray-200 rounded-lg hover:bg-lfc-red-hover dark:hover:bg-red-700 disabled:opacity-50 text-lg font-semibold"
        >
          {quizState.submitted ? 'Submitting...' : 'Continue'}
        </button>
        
        {!passed && (
          <button 
            onClick={() => window.location.reload()}
            className="ml-4 px-8 py-3 border border-[var(--border-primary)] rounded-lg hover:bg-gray-200 dark:bg-[var(--bg-secondary)] text-lg font-semibold"
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
    <div className="p-6 bg-white dark:bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-primary)]">
      {/* Enhanced Quiz Header with Proctoring Info */}
      <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaClock className="text-red-500 mr-2" />
            <span className="text-red-800 dark:text-red-200 font-semibold">Secure Quiz Mode Active</span>
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
          <div className="bg-gray-200 dark:bg-[var(--bg-tertiary)] px-3 py-1 rounded-full text-sm">
            Score: {quizState.score}
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
            proctoring.violations === 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            Violations: {proctoring.violations}
          </div>
        </div>
      </div>
      
      <p className="text-lg mb-6 bg-gray-200 dark:bg-[var(--bg-secondary)] p-4 rounded-lg border">{question.question}</p>
      
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(option)}
            className={`w-full text-left p-4 rounded-lg border transition-all ${
              quizState.selectedAnswer === option 
                ? 'border-lfc-red dark:border-red-800 bg-red-100 dark:bg-red-900/20 transform scale-105' 
                : 'border-[var(--border-primary)] hover:border-[var(--border-secondary)] hover:bg-gray-200 dark:bg-[var(--bg-secondary)]'
            }`}
          >
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full border mr-3 flex items-center justify-center ${
                quizState.selectedAnswer === option 
                  ? 'border-lfc-red dark:border-red-800 bg-lfc-red dark:bg-red-800 text-gray-200' 
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
          className="px-8 py-3 bg-lfc-red dark:bg-red-800 text-gray-200 rounded-lg hover:bg-lfc-red-hover dark:hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {quizState.currentQuestion + 1 === module.quiz?.questions.length ? 'Finish Quiz' : 'Next Question'}
        </button>
      </div>

      {/* Time warning */}
      {proctoring.timeLeft < 300 && ( // 5 minutes warning
        <div className="mt-4 bg-orange-100 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 rounded-lg p-3">
          <p className="text-orange-800 dark:text-orange-200 text-sm font-semibold">
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
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [certificate, setCertificate] = useState<{ validationCode: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState<Page>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyModuleId] = useState<string | null>(null);
  const [surveyModuleTitle] = useState<string>('');
  const [showOverviewModal, setShowOverviewModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [pendingModule, setPendingModule] = useState<Module | null>(null);

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

  useEffect(() => {
    if (enrollment?.completed && enrollment._id) {
      fetchCertificate();
    }
  }, [enrollment?.completed, enrollment?._id]);

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

  const fetchCertificate = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !enrollment?._id) return;

      const res = await fetch(`${API_BASE}/api/certificates/${enrollment._id}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setCertificate(data);
      }
    } catch (err) {
      console.error("Error fetching certificate", err);
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

  const markModuleComplete = async (moduleId: string) => {
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
        
        // Show completion modal with survey
        if (course) {
          const module = (course.sections || [])
            .flatMap(s => s.modules || [])
            .find(m => m._id === moduleId);
          
          if (module) {
            setPendingModule(module);
            setShowCompletionModal(true);
          }
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

  // Certificate download function
  const downloadCertificate = async () => {
    try {
      if (!enrollment?._id) {
        toast.error("Enrollment not found");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to download your certificate");
        return;
      }

      toast.info("Generating your certificate...");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/certificates/generate/${enrollment._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate certificate");
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${course?.title.replace(/\s+/g, "-") || "course"}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Certificate downloaded successfully!");
    } catch (error: any) {
      console.error("Certificate download error:", error);
      toast.error(error.message || "Failed to download certificate");
    }
  };


  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-200 dark:bg-[var(--bg-primary)]">
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
      <div className="flex flex-col h-screen bg-gray-200 dark:bg-[var(--bg-primary)]">
        <div className="p-6">
          <div className="bg-white dark:bg-[var(--bg-elevated)] p-8 rounded-lg text-center border border-[var(--border-primary)]">
            <p className="text-[var(--text-secondary)] mb-4">Course not found.</p>
            <Link to="/dashboard/courses" className="text-lfc-red hover:underline">
              Back to My Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-200 dark:bg-[var(--bg-primary)]">
      {/* Onboarding Tour */}
      <OnboardingTour tourKey="courseDetails" steps={courseDetailsTour} />
      
      {/* Header */}
      <header className="bg-white dark:bg-[var(--bg-elevated)] border-b border-[var(--border-primary)] shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/dashboard/courses')}
                className="mr-4 p-2 rounded-md text-[var(--text-primary)] hover:bg-[var(--hover-bg)] dark:hover:bg-[var(--hover-bg)]"
              >
                <FaArrowLeft />
              </button>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">{course.title}</h1>
            </div>
            
            {enrollment && (
              <div className="text-right">
                <div className="text-sm text-[var(--text-secondary)] mb-1">Overall Progress</div>
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-[var(--bg-tertiary)] rounded-full mr-3">
                    <div 
                      className="h-2 bg-lfc-gold rounded-full transition-all duration-300"
                      style={{ width: `${enrollment.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-semibold text-[var(--text-primary)]">
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
                    ? 'text-lfc-red border-b-2 border-lfc-red dark:border-red-800 dark:border-[var(--lfc-red)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
                    ? 'text-lfc-red border-b-2 border-lfc-red dark:border-red-800 dark:border-[var(--lfc-red)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
        <aside className="w-80 bg-white dark:bg-[var(--bg-elevated)] border-r border-[var(--border-primary)] overflow-y-auto">
          <div className="p-4">
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Course Content</h2>
            <div className="space-y-2">
              {(course.sections || []).map((section) => {
                const sectionProgress = enrollment?.sectionProgress?.find(sp => 
                  sp.sectionId === section._id
                ) || { completed: false, modulesCompleted: 0, totalModules: (section.modules || []).length };
                
                const isExpanded = expandedSections.has(section._id);

                return (
                  <div key={section._id} className="border border-[var(--border-primary)] rounded-lg">
                    <button
                      onClick={() => toggleSection(section._id)}
                      className="w-full text-left p-3 rounded-lg hover:bg-[var(--hover-bg)] dark:hover:bg-[var(--hover-bg)] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                          <h3 className="font-medium text-[var(--text-primary)]">{section.title}</h3>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-[var(--text-secondary)]">
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
                                  onClick={async () => {
                                    const isCompleted = isModuleCompleted(module._id);
                                    if (!isCompleted && (module.description || (module.objectives && module.objectives.length > 0))) {
                                      setPendingModule(module);
                                      setShowOverviewModal(true);
                                    } else {
                                      // Track module access
                                      if (!isCompleted && courseId) {
                                        try {
                                          const token = localStorage.getItem("token");
                                          await fetch(`${API_BASE}/api/progress/${courseId}/modules/${module._id}/access`, {
                                            method: "POST",
                                            headers: {
                                              "Authorization": `Bearer ${token}`,
                                              "Content-Type": "application/json",
                                            },
                                          });
                                        } catch (err) {
                                          console.error("Error tracking module access:", err);
                                        }
                                      }
                                      
                                      setActiveModule(module._id);
                                      setActivePage('modules');
                                    }
                                  }}
                                  className={`w-full text-left p-2 rounded text-sm transition-colors ${
                                    isCompleted
                                      ? 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/20'
                                      : 'text-[var(--text-primary)] hover:bg-[var(--hover-bg)] dark:hover:bg-[var(--hover-bg)]'
                                  } ${
                                    activeModule === module._id ? 'bg-lfc-red bg-opacity-10' : ''
                                  }`}
                                >
                                  <div className="flex items-center space-x-2">
                                    {getModuleIcon(module.type)}
                                    <span className="flex-1 truncate">{module.title}</span>
                                    {module.duration && (
                                      <span className="text-xs text-[var(--text-secondary)]">{module.duration}</span>
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
        <main className="flex-1 overflow-y-auto bg-white dark:bg-[var(--bg-elevated)] p-6">
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
                  <span className="px-3 py-1 bg-lfc-red dark:bg-red-800 bg-opacity-10 text-red-300 rounded-full text-sm">
                    {course.type}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full text-sm">
                    {course.level}
                  </span>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 dark:text-green-300 rounded-full text-sm">
                    {course.duration}
                  </span>
                  {course.categories.map((category, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-200 dark:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-full text-sm">
                      {category}
                    </span>
                  ))}
                </div>

                {/* Description */}
                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-3">Description</h2>
                  <p className="text-[var(--text-secondary)] leading-relaxed">{course.description}</p>
                </section>

                {/* Objectives */}
                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-3">Learning Objectives</h2>
                  <ul className="space-y-2">
                    {course.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                        <span className="text-[var(--text-secondary)]">{objective}</span>
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
                          <span className="text-[var(--text-secondary)]">{prereq}</span>
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
                      <p className="text-[var(--text-secondary)]">Course Instructor</p>
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
                          markModuleComplete(module._id);
                          setActiveModule(null);
                        }}
                        setPendingModule={setPendingModule}
                        setShowCompletionModal={setShowCompletionModal}
                      />
                    );
                  }

                  return (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-2xl font-bold mb-2">{module.title}</h2>
                          <div className="flex items-center space-x-4 text-[var(--text-secondary)]">
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
                                await markModuleComplete(module._id);
                              } catch (error) {
                                console.error("Failed to mark complete:", error);
                              }
                            }}
                            className="px-6 py-2 bg-lfc-red dark:bg-red-800 text-gray-200 rounded-md hover:bg-lfc-red-hover dark:hover:bg-red-700"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>

                      {module.description && (
                        <p className="text-[var(--text-secondary)] mb-6">{module.description}</p>
                      )}

                      {module.type === 'video' && module.contentUrl && (
                        <div className="bg-black dark:bg-gray-900 rounded-lg overflow-hidden mb-6">
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
                          <p className="text-[var(--text-secondary)] mb-4">PDF Document</p>
                          <a
                            href={resolveMediaUrl(module.contentUrl)}
                            download
                            className="px-6 py-2 bg-lfc-red dark:bg-red-800 text-gray-200 rounded-md hover:bg-lfc-red-hover dark:hover:bg-red-700 inline-flex items-center"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FaDownload className="mr-2" />
                            Download PDF
                          </a>
                        </div>
                      )}

                      {isModuleCompleted(module._id) && (
                        <div className="bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg p-4 mt-6">
                          <div className="flex items-center text-green-700 dark:text-green-300">
                            <FaCheckCircle className="mr-2" />
                            <span>Module completed</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })() : (
                  <div className="text-center py-12">
                    <FaBook className="text-4xl text-[var(--text-secondary)] mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Select a module to begin</h3>
                    <p className="text-[var(--text-secondary)]">Choose a module from the sidebar to start learning</p>
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
                        <div className="bg-gradient-to-br from-lfc-red to-lfc-gold dark:from-red-800 dark:to-lfc-gold p-1 rounded-full w-32 h-32 mx-auto mb-6">
                          <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-full w-full h-full flex items-center justify-center">
                            <FaTrophy className="text-4xl text-yellow-500" />
                          </div>
                        </div>
                        
                        <h2 className="text-3xl font-bold mb-4">Congratulations! 🎉</h2>
                        <p className="text-xl text-[var(--text-secondary)] mb-8">
                          You've successfully completed <strong>{course.title}</strong> with flying colors!
                        </p>

                        <div className="bg-gray-200 dark:bg-[var(--bg-secondary)] rounded-lg p-6 mb-8">
                          <h3 className="font-semibold mb-4">Course Completion Details</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-[var(--text-secondary)]">Final Score</span>
                              <div className="font-semibold text-2xl text-green-700 dark:text-green-300">{progressPercentage}%</div>
                            </div>
                            <div>
                              <span className="text-[var(--text-secondary)]">Modules Completed</span>
                              <div className="font-semibold text-2xl">
                                {completedModules}/{totalModules}
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 text-sm text-green-700 dark:text-green-300 font-semibold">
                            ✅ Passed with excellence!
                          </div>
                        </div>

                        {/* Certificate Download Button */}
                        <div className="mb-8 text-center">
                          <button
                            onClick={downloadCertificate}
                            className="px-8 py-4 bg-gradient-to-r from-lfc-red to-lfc-gold dark:from-red-800 dark:to-lfc-gold text-gray-200 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all inline-flex items-center gap-3 text-lg"
                          >
                            <FaDownload className="text-xl" />
                            Download Your Certificate
                          </button>
                          <p className="text-sm text-[var(--text-secondary)] mt-2">
                            Get your official certificate of completion
                          </p>
                        </div>

                        {/* Share Section */}
                        <div className="mb-8 p-6 bg-blue-100 dark:bg-blue-900/20 rounded-lg border border-blue-300 dark:border-blue-700">
                          <h3 className="font-semibold mb-4 text-blue-800">
                            {passed ? 'Share Your Achievement!' : 'Share Your Progress!'}
                          </h3>
                          <p className="text-blue-800 dark:text-blue-200 mb-4">
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
                              validationCode={certificate?.validationCode}
                            />
                            <ShareButton 
                              platform="x"
                              courseTitle={course.title}
                              progress={progressPercentage}
                              passed={passed}
                              validationCode={certificate?.validationCode}
                            />
                            <ShareButton 
                              platform="whatsapp"
                              courseTitle={course.title}
                              progress={progressPercentage}
                              passed={passed}
                              validationCode={certificate?.validationCode}
                            />
                            <ShareButton 
                              platform="facebook"
                              courseTitle={course.title}
                              progress={progressPercentage}
                              passed={passed}
                              validationCode={certificate?.validationCode}
                            />
                          </div>
                        </div>

                        <div className="mb-8">
                          <h3 className="font-semibold mb-4">Share Your Feedback</h3>
                          <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="What did you think of this course? Share your experience..."
                            className="w-full h-32 p-3 border border-[var(--border-primary)] rounded-lg resize-none focus:outline-none focus:border-lfc-red dark:border-red-800"
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
                            className="mt-3 px-6 py-2 bg-lfc-red dark:bg-red-800 text-gray-200 rounded-md hover:bg-lfc-red-hover dark:hover:bg-red-700 disabled:opacity-50"
                          >
                            {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                          </button>
                        </div>

                        <div className="flex justify-center space-x-4">
                          <button
                            onClick={() => navigate('/dashboard/courses')}
                            className="px-6 py-2 border border-[var(--border-primary)] rounded-md hover:bg-[var(--hover-bg)] dark:hover:bg-[var(--hover-bg)]"
                          >
                            Back to Courses
                          </button>
                          <button
                            onClick={() => setActivePage('overview')}
                            className="px-6 py-2 bg-lfc-red dark:bg-red-800 text-gray-200 rounded-md hover:bg-lfc-red-hover dark:hover:bg-red-700"
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
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-700 dark:to-purple-800 p-1 rounded-full w-32 h-32 mx-auto mb-6">
                          <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-full w-full h-full flex items-center justify-center">
                            <FaClock className="text-4xl text-blue-500" />
                          </div>
                        </div>
                        
                        <h2 className="text-3xl font-bold mb-4">Keep Going! 💪</h2>
                        <p className="text-xl text-[var(--text-secondary)] mb-8">
                          You're making great progress in <strong>{course.title}</strong>
                        </p>

                        <div className="bg-gray-200 dark:bg-[var(--bg-secondary)] rounded-lg p-6 mb-8">
                          <h3 className="font-semibold mb-4">Your Progress</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-[var(--text-secondary)]">Overall Progress</span>
                              <div className="font-semibold text-2xl">{progressPercentage}%</div>
                            </div>
                            <div>
                              <span className="text-[var(--text-secondary)]">Modules Completed</span>
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
                            className="px-6 py-2 bg-lfc-red dark:bg-red-800 text-gray-200 rounded-md hover:bg-lfc-red-hover dark:hover:bg-red-700"
                          >
                            Continue Learning
                          </button>
                          <button
                            onClick={() => navigate('/dashboard/courses')}
                            className="px-6 py-2 border border-[var(--border-primary)] rounded-md hover:bg-[var(--hover-bg)] dark:hover:bg-[var(--hover-bg)]"
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

      {/* Module Overview Modal */}
      {showOverviewModal && pendingModule && (
        <ModuleOverviewModal
          isOpen={showOverviewModal}
          onClose={() => {
            setShowOverviewModal(false);
            setPendingModule(null);
          }}
          onStart={async () => {
            setShowOverviewModal(false);
            if (pendingModule && courseId) {
              // Track module access
              try {
                const token = localStorage.getItem("token");
                await fetch(`${API_BASE}/api/progress/${courseId}/modules/${pendingModule._id}/access`, {
                  method: "POST",
                  headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                });
              } catch (err) {
                console.error("Error tracking module access:", err);
              }
              
              setActiveModule(pendingModule._id);
              setActivePage('modules');
              setPendingModule(null);
            }
          }}
          module={{
            title: pendingModule.title,
            description: pendingModule.description,
            objectives: pendingModule.objectives,
            type: pendingModule.type,
            duration: pendingModule.duration,
          }}
        />
      )}

      {/* Module Completion Modal */}
      {showCompletionModal && pendingModule && (
        <ModuleCompletionModal
          isOpen={showCompletionModal}
          onClose={() => {
            setShowCompletionModal(false);
            setPendingModule(null);
          }}
          onComplete={async (surveyResponses) => {
            setShowCompletionModal(false);
            
            // Submit survey responses if provided
            if (surveyResponses && pendingModule && courseId) {
              try {
                const token = localStorage.getItem("token");
                await fetch(`${API_BASE}/api/feedback/modules/${pendingModule._id}`, {
                  method: "POST",
                  headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    responses: surveyResponses,
                    courseId: courseId,
                    moduleTitle: pendingModule.title,
                  }),
                });
              } catch (err) {
                console.error("Error submitting survey:", err);
              }
            }
            
            // Auto-advance to next module
            if (course && pendingModule) {
              const allModules = course.sections.flatMap(s => s.modules);
              const currentIndex = allModules.findIndex(m => m._id === pendingModule._id);
              
              if (currentIndex !== -1 && currentIndex < allModules.length - 1) {
                const nextModule = allModules[currentIndex + 1];
                setActiveModule(nextModule._id);
                setActivePage('modules');
              }
            }
            
            setPendingModule(null);
          }}
          module={{
            title: pendingModule.title,
            survey: pendingModule.survey,
          }}
        />
      )}
    </div>
  );
}