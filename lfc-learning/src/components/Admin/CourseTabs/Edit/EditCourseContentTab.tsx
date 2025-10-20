// src/components/Admin/EditCourseTabs/EditCourseContentTab.tsx
import { useState, useEffect } from "react";
import {
  FaPlus,
  FaChevronDown,
  FaChevronUp,
  FaSave,
  FaTrash,
  FaUpload,
  FaEdit
} from "react-icons/fa";

interface Section {
  _id: string;
  title: string;
  description: string;
  modules: Module[];
}

// To:
interface Question {
  _id?: string;
  question: string;  // This matches the form field
  options: string[];
  correctAnswer: string;
}

interface Module {
  _id: string;
  title: string;
  type: string;
  description?: string;
  objectives?: string[];
  contentUrl?: string;
  quiz?: {  // Changed from questions? to quiz?
    questions: Question[];
    dueDate?: Date;
  };
  survey?: {
    questions: SurveyQuestion[];
  };
}

interface SurveyQuestion {
  question: string;
  type: "text" | "rating" | "multiple-choice";
  options?: string[];
}

export default function EditCourseContentTab({ courseId }: { courseId: string }) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [newSection, setNewSection] = useState({ title: "", description: "" });
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [activeUploadTab, setActiveUploadTab] = useState<'file' | 'url'>('file');
  const [contentUrl, setContentUrl] = useState('');
  const [editingModule, setEditingModule] = useState<{sectionId: string; moduleId: string} | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editSectionData, setEditSectionData] = useState({ title: "", description: "" });

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  function resolveMediaUrl(url?: string) {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    if (url.includes('/') && !url.startsWith('/')) {
      return `${API_BASE}/${url}`;
    }
    if (url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.avi')) {
      return `${API_BASE}/uploads/videos/${url}`;
    }
    return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
  }

  const [newModule, setNewModule] = useState({
    title: "",
    type: "video",
    description: "",
    objectives: [] as string[],
    file: null as File | null,
    questions: [] as Question[],
    surveyQuestions: [] as SurveyQuestion[],
  });

  useEffect(() => {
    fetchSections();
  }, [courseId]);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/courses/${courseId}/sections`);
      if (res.ok) {
        const data = await res.json();
        setSections(data);
      } else {
        console.error("Failed to fetch sections");
        const errorData = await res.json();
        console.error("Error details:", errorData);
      }
    } catch (err) {
      console.error("Error fetching sections", err);
    } finally {
      setLoading(false);
    }
  };

  const resetModuleForm = () => {
    setNewModule({
      title: "",
      type: "video",
      description: "",
      objectives: [] as string[],
      file: null,
      questions: [],
      surveyQuestions: [] as SurveyQuestion[],
    });
    setContentUrl("");
    setActiveUploadTab('file');
    setEditingModule(null);
  };

  // Section editing functions
  const handleEditSection = (section: Section) => {
    setEditingSection(section._id);
    setEditSectionData({ title: section.title, description: section.description });
  };

  const handleSaveSection = async (sectionId: string) => {
    if (!editSectionData.title.trim()) {
      alert("Section title is required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/courses/${courseId}/sections/${sectionId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(editSectionData),
      });

      if (res.ok) {
        setEditingSection(null);
        setEditSectionData({ title: "", description: "" });
        fetchSections();
        alert("Section updated successfully!");
      } else {
        const errorData = await res.json();
        alert(`Failed to update section: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Error updating section", err);
      alert("Network error while updating section");
    }
  };

  const handleCancelEditSection = () => {
    setEditingSection(null);
    setEditSectionData({ title: "", description: "" });
  };

  // Update handleEditModule to handle the nested quiz structure
  const handleEditModule = (sectionId: string, module: Module) => {
    setEditingModule({ sectionId, moduleId: module._id });
    
    // FIX: Properly extract quiz questions from the nested structure
    const quizQuestions = module.quiz?.questions || [];
    const surveyQuestions = module.survey?.questions || [];
    
    console.log("Editing module quiz data:", {
      moduleQuiz: module.quiz,
      questions: quizQuestions,
      hasQuiz: !!module.quiz,
      questionsCount: quizQuestions.length
    });

    setNewModule({
      title: module.title,
      type: module.type,
      description: module.description || "",
      objectives: module.objectives || [],
      file: null,
      questions: quizQuestions, // This should now have the actual questions
      surveyQuestions: surveyQuestions,
    });
    
    if (module.contentUrl) {
      setContentUrl(module.contentUrl);
      setActiveUploadTab(module.contentUrl.startsWith('http') ? 'url' : 'file');
    }
  };

  const handleAddSection = async () => {
    if (!newSection.title.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/courses/${courseId}/sections`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(newSection),
      });
      if (res.ok) {
        setNewSection({ title: "", description: "" });
        fetchSections();
        alert("Section added successfully!");
      } else {
        const errorData = await res.json();
        console.error("Failed to add section:", errorData);
        alert(`Failed to add section: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Error adding section", err);
      alert("Network error while adding section");
    }
  };

  // ✅ FIXED: Use correct upload types
  const handleAddModule = async (sectionId: string) => {
    if (!courseId) return;
    
    try {
      let finalContentUrl = contentUrl;
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("Please log in to add modules");
        return;
      }

      // Handle file upload - Use CORRECT upload types
      if ((newModule.type === "video" || newModule.type === "pdf") && 
          activeUploadTab === 'file' && newModule.file) {
        
        console.log("📁 File upload details:", {
          file: newModule.file,
          name: newModule.file.name,
          size: newModule.file.size,
          type: newModule.file.type,
          courseId,
          sectionId
        });

        const formData = new FormData();
        formData.append("file", newModule.file);
        
        // ✅ FIXED: Use correct upload types
        let uploadType = "document"; // Default for PDFs
        if (newModule.type === "video") {
          uploadType = "video"; // Use "video" for video files
        } else if (newModule.type === "pdf") {
          uploadType = "document"; // Use "document" for PDFs
        }
        
        const uploadRes = await fetch(`${API_BASE}/api/uploads/${uploadType}`, {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
        });
        
        console.log("📡 Upload response status:", uploadRes.status);
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalContentUrl = uploadData.url || uploadData.secure_url;
          console.log("✅ Upload successful:", finalContentUrl);
        } else {
          const errorData = await uploadRes.json();
          console.error("❌ Upload failed:", errorData);
          throw new Error(errorData.message || "File upload failed");
        }
      }

      // Rest of your code remains the same...
      const payload: any = {
        title: newModule.title,
        type: newModule.type,
        description: newModule.description || "",
        objectives: newModule.objectives.filter(obj => obj.trim() !== ""),
        contentUrl: finalContentUrl || undefined,
      };

      // Quiz handling...
      if (newModule.type === "quiz" && newModule.questions.length > 0) {
        payload.quiz = {
          questions: newModule.questions.map(q => ({
            question: q.question,
            options: q.options.filter(opt => opt.trim() !== ""),
            correctAnswer: q.correctAnswer,
          }))
        };
      } else if (newModule.type === "quiz") {
        payload.quiz = { questions: [] };
      }

      // Survey handling...
      if (newModule.surveyQuestions.length > 0) {
        payload.survey = {
          questions: newModule.surveyQuestions.map(sq => ({
            question: sq.question,
            type: sq.type,
            options: sq.type === "multiple-choice" ? sq.options?.filter(opt => opt.trim() !== "") : undefined,
          }))
        };
      }

      const method = editingModule ? "PUT" : "POST";
      const url = editingModule 
        ? `${API_BASE}/api/courses/${courseId}/sections/${sectionId}/modules/${editingModule.moduleId}`
        : `${API_BASE}/api/courses/${courseId}/sections/${sectionId}/modules`;

      console.log("📤 Saving module payload:", payload);

      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        resetModuleForm();
        fetchSections();
        alert(editingModule ? "Module updated successfully!" : "Module added successfully!");
      } else {
        const errorData = await res.json();
        alert(`Failed to ${editingModule ? 'update' : 'add'} module: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error("Error saving module", err);
      alert(`Error: ${err.message || 'Network error'}`);
    }
  };

  // Update the handleAddQuizQuestion function:
  const handleAddQuizQuestion = () => {
    setNewModule((prev) => ({
      ...prev,
      questions: [...prev.questions, { 
        question: "", 
        options: ["", "", "", ""], 
        correctAnswer: "",
      }],
    }));
  };

  const handleRemoveQuizQuestion = (index: number) => {
    setNewModule((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleQuizChange = (qIndex: number, field: string, value: string | number) => {
    setNewModule((prev) => {
      const updated = [...prev.questions];
      (updated[qIndex] as any)[field] = value;
      return { ...prev, questions: updated };
    });
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    setNewModule((prev) => {
      const updated = [...prev.questions];
      updated[qIndex].options[oIndex] = value;
      return { ...prev, questions: updated };
    });
  };

  const handleAddOption = (qIndex: number) => {
    setNewModule((prev) => {
      const updated = [...prev.questions];
      updated[qIndex].options.push("");
      return { ...prev, questions: updated };
    });
  };

  const handleRemoveOption = (qIndex: number, oIndex: number) => {
    setNewModule((prev) => {
      const updated = [...prev.questions];
      updated[qIndex].options = updated[qIndex].options.filter((_, i) => i !== oIndex);
      return { ...prev, questions: updated };
    });
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/courses/${courseId}/sections/${sectionId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        fetchSections();
        alert("Section deleted successfully!");
      } else {
        const errorData = await res.json();
        console.error("Failed to delete section:", errorData);
        alert(`Failed to delete section: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Error deleting section", err);
      alert("Network error while deleting section");
    }
  };

  const handleDeleteModule = async (sectionId: string, moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/courses/${courseId}/sections/${sectionId}/modules/${moduleId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        fetchSections();
        alert("Module deleted successfully!");
      } else {
        const errorData = await res.json();
        console.error("Failed to delete module:", errorData);
        alert(`Failed to delete module: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Error deleting module", err);
      alert("Network error while deleting module");
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Section */}
      <div className="bg-white dark:bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg shadow-sm p-5">
        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">Add New Section</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Section Title</label>
            <input
              type="text"
              className="w-full border border-[var(--border-primary)] rounded-md px-3 py-2.5 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm"
              placeholder="Enter section title"
              value={newSection.title}
              onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Section Description</label>
            <textarea
              rows={3}
              className="w-full border border-[var(--border-primary)] rounded-md px-3 py-2.5 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm"
              placeholder="Describe what this section covers"
              value={newSection.description}
              onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
            />
          </div>
          <button
            onClick={handleAddSection}
            className="px-4 py-2.5 bg-lfc-red dark:bg-red-800 text-gray-200 rounded-md hover:bg-lfc-red-hover dark:hover:bg-red-700 flex items-center font-medium text-sm"
            disabled={!newSection.title.trim()}
          >
            <FaPlus className="mr-2" /> Add Section
          </button>
        </div>
      </div>

      {/* List Sections */}
      <div>
        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">Course Sections</h3>
        
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-[var(--bg-tertiary)] rounded-lg"></div>
            ))}
          </div>
        ) : sections.length === 0 ? (
          <div className="bg-white dark:bg-[var(--bg-elevated)] p-6 rounded-lg border border-[var(--border-primary)] text-center">
            <p className="text-[var(--text-secondary)]">No sections added yet. Create your first section above.</p>
          </div>
        ) : (
          sections.map((section) => (
            <div
              key={section._id}
              className="mb-5 bg-white dark:bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg shadow-sm overflow-hidden"
            >
              <div className="flex justify-between items-center">
                <button
                  className="flex-1 flex justify-between items-center px-5 py-4 text-left hover:bg-[var(--hover-bg)] transition-colors"
                  onClick={() =>
                    setExpandedSection(expandedSection === section._id ? null : section._id)
                  }
                >
                  <div className="flex-1">
                    {editingSection === section._id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          className="w-full border border-[var(--border-primary)] rounded-md px-3 py-2 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm font-medium"
                          value={editSectionData.title}
                          onChange={(e) => setEditSectionData({ ...editSectionData, title: e.target.value })}
                          placeholder="Section title"
                        />
                        <textarea
                          rows={2}
                          className="w-full border border-[var(--border-primary)] rounded-md px-3 py-2 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm"
                          value={editSectionData.description}
                          onChange={(e) => setEditSectionData({ ...editSectionData, description: e.target.value })}
                          placeholder="Section description"
                        />
                      </div>
                    ) : (
                      <div>
                        <span className="font-medium text-[var(--text-primary)] block">{section.title}</span>
                        {section.description && (
                          <span className="text-sm text-[var(--text-secondary)] mt-1 block">{section.description}</span>
                        )}
                      </div>
                    )}
                  </div>
                  {expandedSection === section._id ? <FaChevronUp /> : <FaChevronDown />}
                </button>
                
                <div className="flex items-center">
                  {editingSection === section._id ? (
                    <div className="flex space-x-2 mr-2">
                      <button
                        onClick={() => handleSaveSection(section._id)}
                        className="px-3 py-1 bg-green-600 text-white dark:text-gray-200 rounded-md text-sm hover:bg-green-700"
                        title="Save section"
                      >
                        <FaSave size={12} />
                      </button>
                      <button
                        onClick={handleCancelEditSection}
                        className="px-3 py-1 bg-gray-200 dark:bg-[var(--bg-secondary)] dark:bg-[var(--bg-secondary)]0 text-white dark:text-gray-200 rounded-md text-sm hover:bg-gray-600"
                        title="Cancel edit"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEditSection(section)}
                      className="px-4 text-[var(--text-secondary)] hover:text-blue-500"
                      title="Edit section"
                    >
                      <FaEdit size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteSection(section._id)}
                    className="px-4 text-[var(--text-secondary)] hover:text-lfc-red dark:hover:text-red-800"
                    title="Delete section"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>

              {expandedSection === section._id && (
                <div className="p-5 border-t border-yt-light-border">
                  {/* Modules List */}
                  {section.modules?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-[var(--text-primary)] mb-3">Modules in this section</h4>
                      <ul className="space-y-3">
                        {section.modules.map((mod) => (
                          <li
                            key={mod._id}
                            className="p-3 border border-[var(--border-primary)] rounded-md bg-yt-light-hover"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="font-medium text-[var(--text-primary)]">{mod.title}</span>
                                <span className="text-xs bg-lfc-gold text-white dark:text-gray-200 px-2 py-1 rounded-full ml-2 capitalize">
                                  {mod.type}
                                </span>
                              </div>
                              <div className="flex space-x-2 items-center">
                                <div className="relative group">
                                  <button
                                    className="text-[var(--text-secondary)] hover:text-blue-500 p-1 rounded hover:bg-gray-100 dark:bg-[var(--bg-tertiary)]"
                                    title="Module actions"
                                  >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                    </svg>
                                  </button>
                                  
                                  <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-[var(--bg-elevated)] rounded-md shadow-lg border border-[var(--border-primary)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                    <div className="py-1">
                                      <button
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-[var(--text-secondary)] hover:bg-gray-100 dark:bg-[var(--bg-tertiary)] flex items-center"
                                        onClick={() => handleEditModule(section._id, mod)}
                                      >
                                        <FaEdit className="mr-1" /> Edit
                                      </button>
                                      <button
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:bg-[var(--bg-tertiary)] flex items-center"
                                        onClick={() => handleDeleteModule(section._id, mod._id)}
                                      >
                                        <FaTrash className="mr-1" /> Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Add/Edit Module Form */}
                  <div className="bg-white dark:bg-[var(--bg-elevated)] p-4 rounded-lg" id="module-form">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-md font-medium text-[var(--text-primary)]">
                        {editingModule && editingModule.sectionId === section._id 
                          ? "Edit Module" 
                          : "Add New Module"}
                      </h4>
                      {editingModule && editingModule.sectionId === section._id && (
                        <button
                          onClick={resetModuleForm}
                          className="px-3 py-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Module Title</label>
                        <input
                          type="text"
                          className="w-full border border-[var(--border-primary)] rounded-md px-3 py-2 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm"
                          placeholder="Enter module title"
                          value={newModule.title}
                          onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Module Description</label>
                        <textarea
                          className="w-full border border-[var(--border-primary)] rounded-md px-3 py-2 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm"
                          placeholder="Brief description of what students will learn"
                          rows={3}
                          value={newModule.description}
                          onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Learning Objectives</label>
                        <div className="space-y-2">
                          {newModule.objectives.map((obj, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input
                                type="text"
                                className="flex-1 border border-[var(--border-primary)] rounded-md px-3 py-2 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm"
                                placeholder={`Objective ${idx + 1}`}
                                value={obj}
                                onChange={(e) => {
                                  const newObjectives = [...newModule.objectives];
                                  newObjectives[idx] = e.target.value;
                                  setNewModule({ ...newModule, objectives: newObjectives });
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newObjectives = newModule.objectives.filter((_, i) => i !== idx);
                                  setNewModule({ ...newModule, objectives: newObjectives });
                                }}
                                className="px-3 py-2 bg-red-500 text-white dark:text-gray-200 rounded-md hover:bg-red-600 text-sm"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setNewModule({ ...newModule, objectives: [...newModule.objectives, ""] })}
                            className="px-3 py-2 bg-lfc-gold/90 text-white dark:text-gray-200 rounded-md hover:bg-lfc-gold/90 dark:hover:bg-lfc-gold text-sm flex items-center gap-2"
                          >
                            <FaPlus /> Add Objective
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Module Type</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {["video", "pdf", "quiz"].map((type) => (
                            <button
                              key={type}
                              type="button"
                              className={`px-3 py-2 rounded-md text-sm font-medium capitalize ${
                                newModule.type === type
                                  ? "bg-lfc-red dark:bg-red-800 text-gray-200"
                                  : "bg-yt-light-hover text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-[var(--bg-elevated)]"
                              }`}
                              onClick={() => setNewModule({ ...newModule, type, questions: [] })}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      {(newModule.type === "video" || newModule.type === "pdf") && (
                        <div>
                          <div className="flex border-b border-yt-light-border mb-3">
                            <button
                              type="button"
                              className={`px-4 py-2 text-sm font-medium ${activeUploadTab === 'file' ? 'border-b-2 border-lfc-red dark:border-red-800 text-lfc-red dark:text-red-800' : 'text-[var(--text-secondary)]'}`}
                              onClick={() => setActiveUploadTab('file')}
                            >
                              Upload File
                            </button>
                            <button
                              type="button"
                              className={`px-4 py-2 text-sm font-medium ${activeUploadTab === 'url' ? 'border-b-2 border-lfc-red dark:border-red-800 text-lfc-red dark:text-red-800' : 'text-[var(--text-secondary)]'}`}
                              onClick={() => setActiveUploadTab('url')}
                            >
                              Use URL
                            </button>
                          </div>

                          {activeUploadTab === 'url' && contentUrl && newModule.type === "video" && (
                            <div className="mt-3 aspect-video bg-black rounded-lg overflow-hidden mb-3">
                              {contentUrl.includes('youtube') || contentUrl.includes('vimeo') ? (
                                <iframe
                                  src={contentUrl.replace('watch?v=', 'embed/').replace('vimeo.com/', 'player.vimeo.com/video/')}
                                  className="w-full min-h-full"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              ) : (
                                <video
                                  src={resolveMediaUrl(contentUrl)}
                                  controls
                                  className="w-full min-h-full object-contain"
                                  onError={(e) => {
                                    console.error("Failed to load video:", contentUrl);
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                            </div>
                          )}

                          {activeUploadTab === 'file' ? (
                            <div>
                              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                Upload {newModule.type === "video" ? "Video" : "PDF"}
                              </label>
                              <div 
                                className="relative flex items-center justify-center w-full h-28 border-2 border-dashed border-yt-light-border rounded-lg cursor-pointer hover:bg-[var(--hover-bg)] hover:border-lfc-gold transition-colors group"
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.currentTarget.classList.add('border-lfc-gold', 'bg-blue-100 dark:bg-blue-900/20');
                                }}
                                onDragLeave={(e) => {
                                  e.preventDefault();
                                  e.currentTarget.classList.remove('border-lfc-gold', 'bg-blue-100 dark:bg-blue-900/20');
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  e.currentTarget.classList.remove('border-lfc-gold', 'bg-blue-100 dark:bg-blue-900/20');
                                  const files = e.dataTransfer.files;
                                  if (files.length > 0) {
                                    setNewModule({ ...newModule, file: files[0] });
                                  }
                                }}
                              >
                                <label className="flex flex-col items-center justify-center w-full min-h-full cursor-pointer">
                                  <div className="flex flex-col items-center justify-center">
                                    <FaUpload className="w-6 h-6 mb-2 text-[var(--text-secondary)] group-hover:text-lfc-gold transition-colors" />
                                    <p className="mb-1 text-xs text-[var(--text-secondary)]"><span className="font-semibold">Click to upload or drag and drop</span></p>
                                    <p className="text-xs text-[var(--text-secondary)]">
                                      {newModule.type === "video" ? "MP4, MOV (MAX. 100MB)" : "PDF (MAX. 10MB)"}
                                    </p>
                                  </div>
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    accept={newModule.type === "video" ? "video/*" : "application/pdf"}
                                    onChange={(e) => setNewModule({ ...newModule, file: e.target.files?.[0] || null })}
                                  />
                                </label>
                              </div>
                              {newModule.file && (
                                <p className="text-xs text-[var(--text-secondary)] mt-2">Selected: {newModule.file.name}</p>
                              )}
                            </div>
                          ) : (
                            <div>
                              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                Enter {newModule.type === "video" ? "Video URL" : "PDF URL"}
                              </label>
                              <input
                                type="url"
                                className="w-full border border-[var(--border-primary)] rounded-md px-3 py-2 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm"
                                placeholder={`Enter ${newModule.type === "video" ? "video (YouTube, Vimeo, etc.)" : "PDF"} URL`}
                                value={contentUrl}
                                onChange={(e) => setContentUrl(e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {newModule.type === "quiz" && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <label className="block text-sm font-medium text-[var(--text-primary)]">Quiz Questions</label>
                            <button
                              type="button"
                              onClick={handleAddQuizQuestion}
                              className="px-3 py-1 bg-lfc-red dark:bg-red-800 text-gray-200 rounded-md text-sm flex items-center"
                            >
                              <FaPlus size={10} className="mr-1" /> Add Question
                            </button>
                          </div>
                          
                          {newModule.questions.map((q, qi) => (
                            <div key={qi} className="p-4 border border-[var(--border-primary)] rounded-md bg-white dark:bg-[var(--bg-elevated)] space-y-3">
                              <div className="flex justify-between items-center">
                                <h5 className="font-medium text-[var(--text-primary)]">Question #{qi + 1}</h5>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQuizQuestion(qi)}
                                  className="text-[var(--text-secondary)] hover:text-lfc-red dark:hover-red-800"
                                >
                                  <FaTrash size={14} />
                                </button>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Question</label>
                                <input
                                  type="text"
                                  className="w-full border border-[var(--border-primary)] rounded-md px-3 py-2 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm"
                                  placeholder="Enter question"
                                  value={q.question}
                                  onChange={(e) => handleQuizChange(qi, "question", e.target.value)}
                                />
                              </div>
                              
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <label className="block text-sm font-medium text-[var(--text-primary)]">Options</label>
                                  <button
                                    type="button"
                                    onClick={() => handleAddOption(qi)}
                                    className="text-xs text-lfc-red dark:text-red-800 hover:text-lfc-gold-dark"
                                  >
                                    + Add Option
                                  </button>
                                </div>
                                <div className="space-y-2">
                                  {q.options.map((opt, oi) => (
                                    <div key={oi} className="flex items-center">
                                      <input
                                        type="text"
                                        className="flex-1 border border-[var(--border-primary)] rounded-md px-3 py-1.5 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm"
                                        placeholder={`Option ${oi + 1}`}
                                        value={opt}
                                        onChange={(e) => handleOptionChange(qi, oi, e.target.value)}
                                      />
                                      {q.options.length > 2 && (
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveOption(qi, oi)}
                                          className="ml-2 text-[var(--text-secondary)] hover:text-lfc-red dark:hover-red-800"
                                        >
                                          <FaTrash size={12} />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Correct Answer</label>
                                <select
                                  className="w-full border border-[var(--border-primary)] rounded-md px-3 py-2 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm"
                                  value={q.correctAnswer}
                                  onChange={(e) => handleQuizChange(qi, "correctAnswer", e.target.value)}
                                >
                                  <option value="">Select correct answer</option>
                                  {q.options.map((opt, oi) => (
                                    <option key={oi} value={opt}>
                                      {opt || `Option ${oi + 1}`}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ))}
                          
                          {newModule.questions.length === 0 && (
                            <p className="text-sm text-[var(--text-secondary)] text-center py-4">No questions added yet.</p>
                          )}
                        </div>
                      )}

                      {/* Survey Configuration (Optional) */}
                      <div className="border-t border-[var(--border-primary)] pt-4 mt-4">
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <label className="block text-sm font-medium text-[var(--text-primary)]">Post-Module Survey (Optional)</label>
                            <p className="text-xs text-[var(--text-muted)] mt-1">Collect feedback after students complete this module</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setNewModule({
                                ...newModule,
                                surveyQuestions: [
                                  ...newModule.surveyQuestions,
                                  { question: "", type: "text", options: [] }
                                ]
                              });
                            }}
                            className="px-3 py-1 bg-lfc-gold dark:bg-lfc-gold/90 text-white dark:text-gray-200 rounded-md text-sm flex items-center hover:bg-lfc-gold/90 dark:bg-lfc-gold"
                          >
                            <FaPlus size={10} className="mr-1" /> Add Survey Question
                          </button>
                        </div>

                        {newModule.surveyQuestions.length > 0 && (
                          <div className="space-y-3">
                            {newModule.surveyQuestions.map((sq, sqi) => (
                              <div key={sqi} className="p-4 border border-[var(--border-primary)] rounded-md bg-gray-200 dark:bg-[var(--bg-secondary)] dark:bg-[var(--bg-secondary)] space-y-3">
                                <div className="flex justify-between items-center">
                                  <h5 className="font-medium text-sm text-[var(--text-primary)]">Survey Question #{sqi + 1}</h5>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newSurveyQuestions = newModule.surveyQuestions.filter((_, i) => i !== sqi);
                                      setNewModule({ ...newModule, surveyQuestions: newSurveyQuestions });
                                    }}
                                    className="text-[var(--text-muted)] hover:text-lfc-red dark:hover-red-800"
                                  >
                                    <FaTrash size={14} />
                                  </button>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">Question Text</label>
                                  <input
                                    type="text"
                                    className="w-full border border-[var(--border-primary)] rounded-md px-3 py-2 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm"
                                    placeholder="e.g., How would you rate this module?"
                                    value={sq.question}
                                    onChange={(e) => {
                                      const newSurveyQuestions = [...newModule.surveyQuestions];
                                      newSurveyQuestions[sqi].question = e.target.value;
                                      setNewModule({ ...newModule, surveyQuestions: newSurveyQuestions });
                                    }}
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">Question Type</label>
                                  <select
                                    className="w-full border border-[var(--border-primary)] rounded-md px-3 py-2 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm"
                                    value={sq.type}
                                    onChange={(e) => {
                                      const newSurveyQuestions = [...newModule.surveyQuestions];
                                      newSurveyQuestions[sqi].type = e.target.value as "text" | "rating" | "multiple-choice";
                                      if (e.target.value !== "multiple-choice") {
                                        newSurveyQuestions[sqi].options = [];
                                      }
                                      setNewModule({ ...newModule, surveyQuestions: newSurveyQuestions });
                                    }}
                                  >
                                    <option value="text">Text Response</option>
                                    <option value="rating">Star Rating (1-5)</option>
                                    <option value="multiple-choice">Multiple Choice</option>
                                  </select>
                                </div>

                                {sq.type === "multiple-choice" && (
                                  <div>
                                    <div className="flex justify-between items-center mb-2">
                                      <label className="block text-xs font-medium text-gray-700 dark:text-[var(--text-secondary)]">Options</label>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newSurveyQuestions = [...newModule.surveyQuestions];
                                          newSurveyQuestions[sqi].options = [...(newSurveyQuestions[sqi].options || []), ""];
                                          setNewModule({ ...newModule, surveyQuestions: newSurveyQuestions });
                                        }}
                                        className="text-xs text-lfc-gold hover:text-lfc-gold/80"
                                      >
                                        + Add Option
                                      </button>
                                    </div>
                                    <div className="space-y-2">
                                      {(sq.options || []).map((opt, oi) => (
                                        <div key={oi} className="flex gap-2">
                                          <input
                                            type="text"
                                            className="flex-1 border border-[var(--border-primary)] rounded-md px-3 py-1.5 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm"
                                            placeholder={`Option ${oi + 1}`}
                                            value={opt}
                                            onChange={(e) => {
                                              const newSurveyQuestions = [...newModule.surveyQuestions];
                                              const newOptions = [...(newSurveyQuestions[sqi].options || [])];
                                              newOptions[oi] = e.target.value;
                                              newSurveyQuestions[sqi].options = newOptions;
                                              setNewModule({ ...newModule, surveyQuestions: newSurveyQuestions });
                                            }}
                                          />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const newSurveyQuestions = [...newModule.surveyQuestions];
                                              newSurveyQuestions[sqi].options = (newSurveyQuestions[sqi].options || []).filter((_, i) => i !== oi);
                                              setNewModule({ ...newModule, surveyQuestions: newSurveyQuestions });
                                            }}
                                            className="px-2 py-1.5 text-[var(--text-muted)] hover:text-lfc-red dark:hover-red-800"
                                          >
                                            <FaTrash size={12} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddModule(section._id)}
                        disabled={!newModule.title.trim() || 
                          ((newModule.type === "video" || newModule.type === "pdf") && 
                          ((activeUploadTab === 'file' && !newModule.file) || 
                          (activeUploadTab === 'url' && !contentUrl.trim())))}
                        className="w-full px-4 py-2.5 bg-lfc-red dark:bg-red-800 text-gray-200 rounded-md hover:bg-lfc-red-hover dark:hover:bg-red-700 disabled:opacity-50 flex items-center justify-center font-medium text-sm"
                      >
                        <FaSave className="mr-2" /> {editingModule ? "Update Module" : "Add Module"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}