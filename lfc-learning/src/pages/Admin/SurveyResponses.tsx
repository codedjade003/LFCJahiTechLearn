// src/pages/Admin/SurveyResponses.tsx
import { useState, useEffect } from "react";
import { FaFilter, FaDownload, FaChevronDown, FaChevronUp, FaStar } from "react-icons/fa";

interface SurveyResponse {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  courseId: {
    _id: string;
    title: string;
  };
  moduleId: string;
  moduleTitle: string;
  responses: Record<string, any>;
  submittedAt: string;
}

interface Module {
  _id: string;
  title: string;
  survey?: {
    questions: Array<{
      question: string;
      type: "text" | "rating" | "multiple-choice";
      options?: string[];
    }>;
  };
}

export default function SurveyResponses() {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [courses, setCourses] = useState<any[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchCourses();
    fetchResponses();
  }, []);

  useEffect(() => {
    if (selectedCourse !== "all") {
      fetchModules(selectedCourse);
    } else {
      setModules([]);
      setSelectedModule("all");
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const fetchModules = async (courseId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const course = await res.json();
        const allModules = course.sections?.flatMap((s: any) => s.modules) || [];
        setModules(allModules);
      }
    } catch (err) {
      console.error("Error fetching modules:", err);
    }
  };

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/feedback/survey-responses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setResponses(data);
      }
    } catch (err) {
      console.error("Error fetching survey responses:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const filteredResponses = getFilteredResponses();
    
    if (filteredResponses.length === 0) {
      alert("No data to export");
      return;
    }

    // Create CSV headers
    const headers = ["Student Name", "Email", "Course", "Module", "Submitted At"];
    
    // Get all unique question keys
    const questionKeys = new Set<string>();
    filteredResponses.forEach(r => {
      Object.keys(r.responses).forEach(key => questionKeys.add(key));
    });
    
    headers.push(...Array.from(questionKeys).map(k => `Q${parseInt(k) + 1}`));

    // Create CSV rows
    const rows = filteredResponses.map(r => {
      const row = [
        r.userId.name,
        r.userId.email,
        r.courseId.title,
        r.moduleTitle,
        new Date(r.submittedAt).toLocaleString()
      ];
      
      questionKeys.forEach(key => {
        const value = r.responses[key];
        row.push(typeof value === 'object' ? JSON.stringify(value) : value);
      });
      
      return row;
    });

    // Combine headers and rows
    const csv = [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(",")
    ).join("\n");

    // Download
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `survey-responses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getFilteredResponses = () => {
    return responses.filter(r => {
      if (selectedCourse !== "all" && r.courseId._id !== selectedCourse) return false;
      if (selectedModule !== "all" && r.moduleId !== selectedModule) return false;
      return true;
    });
  };

  const renderResponseValue = (value: any, questionType?: string) => {
    if (questionType === "rating") {
      return (
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <FaStar
              key={star}
              className={star <= value ? "text-lfc-gold" : "text-gray-300"}
              size={16}
            />
          ))}
          <span className="ml-2 text-sm text-gray-600">({value}/5)</span>
        </div>
      );
    }
    
    if (typeof value === 'object') {
      return <pre className="text-sm text-gray-700">{JSON.stringify(value, null, 2)}</pre>;
    }
    
    return <p className="text-sm text-gray-700">{value}</p>;
  };

  const getModuleQuestions = (moduleId: string) => {
    const module = modules.find(m => m._id === moduleId);
    return module?.survey?.questions || [];
  };

  const filteredResponses = getFilteredResponses();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading survey responses...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Survey Responses</h1>
          <p className="text-gray-600 mt-1">View and analyze student feedback from module surveys</p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={filteredResponses.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-lfc-gold text-white rounded-lg hover:bg-lfc-gold/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaDownload />
          Export to CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <FaFilter className="text-gray-500" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>{course.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Module</label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              disabled={selectedCourse === "all"}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="all">All Modules</option>
              {modules.map(module => (
                <option key={module._id} value={module._id}>{module.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Responses</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{filteredResponses.length}</div>
        </div>
        <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Unique Students</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">
            {new Set(filteredResponses.map(r => r.userId._id)).size}
          </div>
        </div>
        <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Courses Covered</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">
            {new Set(filteredResponses.map(r => r.courseId._id)).size}
          </div>
        </div>
      </div>

      {/* Responses List */}
      <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Responses ({filteredResponses.length})</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredResponses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No survey responses found. Students will see surveys after completing modules with configured surveys.
            </div>
          ) : (
            filteredResponses.map(response => {
              const isExpanded = expandedResponse === response._id;
              const questions = getModuleQuestions(response.moduleId);
              
              return (
                <div key={response._id} className="p-4">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedResponse(isExpanded ? null : response._id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="font-medium text-gray-900">{response.userId.name}</div>
                        <div className="text-sm text-gray-500">{response.userId.email}</div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {response.courseId.title} • {response.moduleTitle}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Submitted {new Date(response.submittedAt).toLocaleString()}
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pl-4 border-l-2 border-lfc-gold space-y-4">
                      {Object.entries(response.responses).map(([key, value]) => {
                        const questionIndex = parseInt(key);
                        const question = questions[questionIndex];
                        
                        return (
                          <div key={key} className="space-y-2">
                            <div className="font-medium text-sm text-gray-900">
                              {question?.question || `Question ${questionIndex + 1}`}
                            </div>
                            {renderResponseValue(value, question?.type)}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
