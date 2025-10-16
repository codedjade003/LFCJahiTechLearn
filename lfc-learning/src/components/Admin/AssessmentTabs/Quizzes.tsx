// src/pages/Admin/Quizzes.tsx
import { useState, useEffect } from "react";
import { 
  FaSearch, 
  FaFilter, 
  FaDownload, 
  FaEye, 
  FaChartBar,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaBrain,
  FaArrowLeft,
  FaBook,
  FaCalendar,
  FaListOl,
  FaPercentage,
  FaTimes,
  FaLock
} from "react-icons/fa";
import { useNotification } from "../../../hooks/useNotification";

interface QuizSubmission {
  _id: string;
  submissionType: string;
  submission: {
    answers: any[];
    score: number;
    passed: boolean;
  };
  grade: number;
  createdAt: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
  };
  courseId: {
    _id: string;
    title: string;
    instructor: {
      name: string;
    };
  };
  moduleId: string;
}

interface QuizDetails {
  _id: string;
  title: string;
  description: string;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
  }>;
  passingScore: number;
  timeLimit?: number;
}

export default function Quizzes() {
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    course: 'all',
    search: ''
  });
  const [selectedSubmission, setSelectedSubmission] = useState<QuizSubmission | null>(null);
  const [quizDetails, setQuizDetails] = useState<QuizDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coursePermissions, setCoursePermissions] = useState<Record<string, boolean>>({});
  const { showNotification } = useNotification();


  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchQuizSubmissions();
  }, []);

  const fetchQuizDetails = async (courseId: string, moduleId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/courses/${courseId}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      
      if (res.ok) {
        const course = await res.json();
        
        // Find the quiz module
        for (const section of course.sections) {
          for (const module of section.modules) {
            if (module._id === moduleId && module.type === 'quiz') {
              setQuizDetails({
                _id: module._id,
                title: module.title,
                description: module.description || '',
                questions: module.quiz?.questions || [],
                passingScore: module.quiz?.passingScore || 70,
                timeLimit: module.quiz?.timeLimit
              });
              return;
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching quiz details", err);
    }
  };

  const calculatePercentageScore = (submission: QuizSubmission): number => {
    const totalQuestions = submission.submission.answers.length;
    const rawScore = submission.submission.score;
    return totalQuestions > 0 ? (rawScore / totalQuestions) * 100 : 0;
  };

// Add permission checking to fetchQuizSubmissions
const fetchQuizSubmissions = async () => {
  try {
    const token = localStorage.getItem("token");
    
    // First get courses to check permissions
    const coursesRes = await fetch(`${API_BASE}/api/courses`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    
    if (coursesRes.ok) {
      const courses = await coursesRes.json();
      await checkPermissionsForCourses(courses);
    }

    const res = await fetch(`${API_BASE}/api/submissions/admin/submissions?type=quiz`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    
    if (res.ok) {
      const data = await res.json();
      setSubmissions(data.submissions || []);
    }
  } catch (err) {
    console.error("Error fetching quiz submissions", err);
  } finally {
    setLoading(false);
  }
};

  // Add permission check functions
  const checkPermissionsForCourses = async (courses: any[]) => {
    const token = localStorage.getItem("token");
    const permissionsMap: Record<string, boolean> = {};

    for (const course of courses) {
      try {
        const res = await fetch(`${API_BASE}/api/courses/${course._id}/permissions`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          permissionsMap[course._id] = data.canGrade || data.canManage || data.canReview || false;
        } else {
          permissionsMap[course._id] = false;
        }
      } catch (error) {
        console.error(`Error checking permissions for course ${course._id}:`, error);
        permissionsMap[course._id] = false;
      }
    }

    setCoursePermissions(permissionsMap);
  };

  const canViewQuizResults = (courseId: string) => {
    return coursePermissions[courseId] === true;
  };

  // Update openQuizDetails with permission check
  const openQuizDetails = async (submission: QuizSubmission) => {
    if (!canViewQuizResults(submission.courseId._id)) {
      showNotification("You don't have permission to view quiz results for this course", 'error');
      return;
    }
    setSelectedSubmission(submission);
    setIsModalOpen(true);
    await fetchQuizDetails(submission.courseId._id, submission.moduleId);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSubmission(null);
    setQuizDetails(null);
  };

  const getPassFailBadge = (submission: QuizSubmission) => {
    if (submission.submission.passed) {
      return { color: 'bg-green-100 text-green-800', text: 'Passed', icon: FaCheckCircle };
    } else {
      return { color: 'bg-red-100 text-red-800', text: 'Failed', icon: FaTimesCircle };
    }
  };

  const getAnswerStatus = ( userAnswer: string, correctAnswer: string) => {
    const isCorrect = userAnswer === correctAnswer;
    return {
      isCorrect,
      color: isCorrect ? 'text-green-600' : 'text-red-600',
      bgColor: isCorrect ? 'bg-green-50' : 'bg-red-50',
      icon: isCorrect ? FaCheckCircle : FaTimesCircle
    };
  };

  const filteredSubmissions = submissions.filter(submission => {
    if (filters.status === 'passed' && !submission.submission.passed) return false;
    if (filters.status === 'failed' && submission.submission.passed) return false;
    
    if (filters.search && !submission.studentId.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !submission.courseId.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Calculate statistics
  const totalAttempts = submissions.length;
  const passedAttempts = submissions.filter(s => s.submission.passed).length;

  // Calculate average score properly - convert raw score to percentage
  const averageScore = submissions.length > 0 
    ? submissions.reduce((acc, submission) => {
        return acc + calculatePercentageScore(submission);
      }, 0) / submissions.length 
    : 0;

  const uniqueStudents = new Set(submissions.map(s => s.studentId._id)).size;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-yt-light-hover rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-yt-text-dark">Quiz Results</h1>
          <p className="text-yt-text-gray">Monitor student quiz performance and analytics</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-yt-text-gray">
            {filteredSubmissions.length} attempts
          </span>
          <button className="px-4 py-2 bg-lfc-red text-white rounded-lg hover:bg-lfc-gold-dark flex items-center">
            <FaDownload className="mr-2" />
            Export Results
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-yt-light-border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-yt-text-gray" />
            <input
              type="text"
              placeholder="Search students or courses..."
              className="w-full pl-10 pr-4 py-2 border border-yt-light-border rounded-lg focus:outline-none focus:border-lfc-red"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          
          <select
            className="border border-yt-light-border rounded-lg px-3 py-2 focus:outline-none focus:border-lfc-red"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">All Results</option>
            <option value="passed">Passed Only</option>
            <option value="failed">Failed Only</option>
          </select>

          <select
            className="border border-yt-light-border rounded-lg px-3 py-2 focus:outline-none focus:border-lfc-red"
            value={filters.course}
            onChange={(e) => setFilters({...filters, course: e.target.value})}
          >
            <option value="all">All Courses</option>
          </select>

          <button className="px-4 py-2 border border-yt-light-border rounded-lg hover:bg-yt-light-hover flex items-center justify-center">
            <FaFilter className="mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-yt-light-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yt-text-gray">Total Attempts</p>
              <p className="text-2xl font-bold text-yt-text-dark">{totalAttempts}</p>
            </div>
            <FaBrain className="text-lfc-red text-xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-yt-light-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yt-text-gray">Pass Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0}%
              </p>
            </div>
            <FaCheckCircle className="text-green-600 text-xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-yt-light-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yt-text-gray">Average Score</p>
              <p className="text-2xl font-bold text-yt-text-dark">
                {totalAttempts > 0 ? Math.round(averageScore) : 0}%
              </p>
            </div>
            <FaChartBar className="text-lfc-red text-xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-yt-light-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yt-text-gray">Unique Students</p>
              <p className="text-2xl font-bold text-yt-text-dark">{uniqueStudents}</p>
            </div>
            <FaUser className="text-lfc-red text-xl" />
          </div>
        </div>
      </div>

      {/* Quiz Results List */}
      <div className="bg-white rounded-lg border border-yt-light-border">
        <div className="p-4 border-b border-yt-light-border">
          <h3 className="font-semibold text-yt-text-dark">Quiz Attempts</h3>
        </div>
        
        {filteredSubmissions.length === 0 ? (
          <div className="p-8 text-center">
            <FaBrain className="text-4xl text-yt-text-gray mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No quiz attempts found</h3>
            <p className="text-yt-text-gray">Adjust your filters to see more results</p>
          </div>
        ) : (
          <div className="divide-y divide-yt-light-border">
          {filteredSubmissions.map((submission) => {
            const status = getPassFailBadge(submission);
            const StatusIcon = status.icon;
            const percentageScore = calculatePercentageScore(submission);
            const canView = canViewQuizResults(submission.courseId._id);
            
            return (
              <div key={submission._id} className={`p-4 transition-colors ${
                canView ? 'hover:bg-yt-light-hover' : 'bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                      canView ? 'bg-lfc-red' : 'bg-gray-400'
                    } font-semibold`}>
                      {submission.studentId.name.charAt(0)}
                      {!canView && <FaLock className="absolute" size={10} />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-yt-text-dark truncate">
                          {submission.studentId.name}
                          {!canView && (
                            <FaLock className="inline ml-2 text-gray-400" size={12} />
                          )}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="mr-1" size={10} />
                          {status.text}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          canView ? 'bg-lfc-red text-white' : 'bg-gray-300 text-gray-600'
                        }`}>
                          {Math.round(percentageScore)}%
                        </span>
                      </div>
                      
                      <p className="text-sm text-yt-text-gray truncate">
                        {submission.courseId.title} • Quiz Attempt
                        {!canView && (
                          <span className="text-xs text-gray-500 ml-2">(Restricted Access)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openQuizDetails(submission)}
                      className={`p-2 rounded-lg transition-colors ${
                        canView 
                          ? 'text-yt-text-gray hover:text-lfc-red hover:bg-yt-light-hover' 
                          : 'text-gray-300 cursor-not-allowed'
                      }`}
                      title={canView ? "View Details" : "No permission to view quiz results"}
                      disabled={!canView}
                    >
                      <FaEye />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* Quiz Details Modal */}
      {isModalOpen && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <div className="flex items-center">
                <button 
                  onClick={closeModal}
                  className="mr-4 p-2 rounded-md text-yt-text-dark hover:bg-yt-light-hover"
                >
                  <FaArrowLeft />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-yt-text-dark">Quiz Attempt Details</h2>
                  <p className="text-yt-text-gray">
                    {quizDetails?.title || 'Quiz Submission'} • {selectedSubmission.courseId.title}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedSubmission.submission.passed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                } flex items-center`}>
                  {selectedSubmission.submission.passed ? <FaCheckCircle className="mr-1" size={14} /> : <FaTimesCircle className="mr-1" size={14} />}
                  {selectedSubmission.submission.passed ? 'Passed' : 'Failed'}
                </span>
                
                <span className="flex items-center text-sm text-yt-text-gray">
                  <FaPercentage className="mr-1" />
                  Score: {Math.round(calculatePercentageScore(selectedSubmission))}%
                </span>

                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Student and Quiz Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <FaUser className="mr-2 text-lfc-red" />
                    Student Information
                  </h3>
                  <p className="text-yt-text-dark font-medium">{selectedSubmission.studentId.name}</p>
                  <p className="text-yt-text-gray text-sm">{selectedSubmission.studentId.email}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <FaBook className="mr-2 text-lfc-red" />
                    Course Information
                  </h3>
                  <p className="text-yt-text-dark font-medium">{selectedSubmission.courseId.title}</p>
                  <p className="text-yt-text-gray text-sm">
                    Instructor: {selectedSubmission.courseId.instructor?.name || 'N/A'}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <FaCalendar className="mr-2 text-lfc-red" />
                    Attempt Details
                  </h3>
                  <p className="text-yt-text-dark">
                    Submitted: {new Date(selectedSubmission.createdAt).toLocaleString()}
                  </p>
                  <p className="text-yt-text-gray text-sm">
                    Passing Score: {quizDetails?.passingScore || 70}%
                  </p>
                </div>
              </div>

              {/* Performance Summary */}
              <div className="bg-gray-50 rounded-lg border p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <FaChartBar className="mr-2 text-lfc-red" />
                  Performance Summary
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <p className="text-2xl font-bold text-lfc-red">
                      {Math.round(calculatePercentageScore(selectedSubmission))}%
                    </p>
                    <p className="text-sm text-yt-text-gray">Final Score</p>
                  </div>
                  
                  <div className="text-center p-4 bg-white rounded-lg">
                    <p className="text-2xl font-bold text-yt-text-dark">
                      {quizDetails?.questions.length || 0}
                    </p>
                    <p className="text-sm text-yt-text-gray">Total Questions</p>
                  </div>
                  
                  <div className="text-center p-4 bg-white rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {selectedSubmission.submission.answers.filter((answer, index) => 
                        answer === quizDetails?.questions[index]?.correctAnswer
                      ).length}
                    </p>
                    <p className="text-sm text-yt-text-gray">Correct Answers</p>
                  </div>
                  
                  <div className="text-center p-4 bg-white rounded-lg">
                    <p className="text-2xl font-bold text-yt-text-dark">
                      {quizDetails?.passingScore || 70}%
                    </p>
                    <p className="text-sm text-yt-text-gray">Passing Score</p>
                  </div>
                </div>
              </div>

              {/* Questions and Answers */}
              {quizDetails && (
                <div className="bg-white rounded-lg border">
                  <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold flex items-center">
                      <FaListOl className="mr-2 text-lfc-red" />
                      Questions & Answers
                    </h2>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {quizDetails.questions.map((question, index) => {
                      const userAnswer = selectedSubmission.submission.answers[index];
                      const correctAnswer = question.correctAnswer;
                      const { isCorrect, color, bgColor, icon: AnswerIcon } = 
                        getAnswerStatus(userAnswer, correctAnswer);
                      
                      return (
                        <div key={index} className={`p-6 ${bgColor}`}>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-medium text-yt-text-dark mb-3">
                                {index + 1}. {question.question}
                              </h3>
                              
                              <div className="grid gap-2 mb-3">
                                {question.options.map((option, optIndex) => (
                                  <div
                                    key={optIndex}
                                    className={`p-3 border rounded-lg ${
                                      option === correctAnswer
                                        ? 'border-green-500 bg-green-50'
                                        : option === userAnswer && !isCorrect
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-200 bg-white'
                                    }`}
                                  >
                                    <div className="flex items-center">
                                      <span className="font-medium mr-3">
                                        {String.fromCharCode(65 + optIndex)}.
                                      </span>
                                      <span>{option}</span>
                                      {option === correctAnswer && (
                                        <FaCheckCircle className="ml-auto text-green-500" />
                                      )}
                                      {option === userAnswer && !isCorrect && (
                                        <FaTimesCircle className="ml-auto text-red-500" />
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm">
                                <span className={`flex items-center ${color}`}>
                                  <AnswerIcon className="mr-1" size={14} />
                                  Student's Answer: {String.fromCharCode(65 + question.options.indexOf(userAnswer))}
                                </span>
                                <span className="text-green-600 flex items-center">
                                  <FaCheckCircle className="mr-1" size={14} />
                                  Correct Answer: {String.fromCharCode(65 + question.options.indexOf(correctAnswer))}
                                </span>
                              </div>
                              
                              {question.explanation && (
                                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                  <p className="text-sm text-blue-800">
                                    <strong>Explanation:</strong> {question.explanation}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}