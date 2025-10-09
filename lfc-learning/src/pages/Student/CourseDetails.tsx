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
const QuizComponent = ({ module, onComplete }: { module: Module; onComplete: () => void }) => {
  const [quizState, setQuizState] = useState({
    currentQuestion: 0,
    selectedAnswer: null as string | null,
    score: 0,
    showResults: false
  });

  const handleAnswerSelect = (answer: string) => {
    setQuizState(prev => ({ ...prev, selectedAnswer: answer }));
  };

  const handleNextQuestion = () => {
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
        showResults: false
      });
    } else {
      setQuizState(prev => ({ ...prev, showResults: true }));
      // Auto-mark complete if passed
      const finalScore = newScore / totalQuestions;
      if (finalScore >= 0.7) {
        setTimeout(onComplete, 500);
      }
    }
  };

  if (quizState.showResults) {
    return (
      <div className="text-center p-8">
        <FaTrophy className="text-4xl text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Quiz Completed!</h3>
        <p className="text-lg mb-4">Score: {quizState.score}/{module.quiz?.questions.length}</p>
        <button onClick={onComplete} className="px-6 py-2 bg-lfc-red text-white rounded-md">
          Continue
        </button>
      </div>
    );
  }

  const question = module.quiz?.questions[quizState.currentQuestion];
  if (!question) return null;

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Question {quizState.currentQuestion + 1}</h3>
      <p className="text-lg mb-6">{question.question}</p>
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(option)}
            className={`w-full text-left p-4 rounded-lg border transition-colors ${
              quizState.selectedAnswer === option ? 'border-lfc-red bg-red-50' : 'border-gray-300'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <button
        onClick={handleNextQuestion}
        disabled={!quizState.selectedAnswer}
        className="mt-6 px-6 py-2 bg-lfc-red text-white rounded-md disabled:opacity-50"
      >
        {quizState.currentQuestion + 1 === module.quiz?.questions.length ? 'Finish' : 'Next'}
      </button>
    </div>
  );
};

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState<Page>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);

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

  const markModuleComplete = async (moduleId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error('No auth token');

      const res = await fetch(`${API_BASE}/api/progress/${courseId}/modules/${moduleId}/complete`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });

      if (res.ok) {
        await fetchEnrollmentProgress();
      } else {
        const error = await res.json();
        console.error("Mark complete failed:", error);
        // show user-friendly error (toast)
        toast.error(error.message || "Failed to mark module complete");
      }
    } catch (err) {
      if (err instanceof Error) {
        toast.error(`Error marking module complete: ${err.message}`);
      } else {
        toast.error("Unknown error occurred");
      }
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
            {(['overview', 'modules', 'completion'] as Page[]).map((page) => (
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
                {page === 'completion' && 'Completion'}
              </button>
            ))}
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
                          markModuleComplete(module._id);
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
                                await markModuleComplete(module._id);
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
                            src={`${API_BASE}${module.contentUrl}`}
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
                            href={`${API_BASE}${module.contentUrl}`}
                            download
                            className="px-6 py-2 bg-lfc-red text-white rounded-md hover:bg-lfc-gold-dark inline-flex items-center"
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
                <div className="bg-gradient-to-br from-lfc-red to-lfc-gold p-1 rounded-full w-32 h-32 mx-auto mb-6">
                  <div className="bg-white rounded-full w-full h-full flex items-center justify-center">
                    <FaTrophy className="text-4xl text-yellow-500" />
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold mb-4">Congratulations! 🎉</h2>
                <p className="text-xl text-yt-text-gray mb-8">
                  You've successfully completed <strong>{course.title}</strong>
                </p>

                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h3 className="font-semibold mb-4">Course Completion Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-yt-text-gray">Progress</span>
                      <div className="font-semibold">{enrollment?.progress}%</div>
                    </div>
                    <div>
                      <span className="text-yt-text-gray">Modules Completed</span>
                      <div className="font-semibold">
                        {enrollment?.moduleProgress?.filter(m => m.completed).length}/
                        {course.sections.flatMap(s => s.modules).length}
                      </div>
                    </div>
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
                    <div className="flex space-x-1">
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
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}