import { useState, useEffect } from "react";
import { FaSave, FaTrash } from "react-icons/fa";
import MaterialsUploader from "../../shared/MaterialsUploader";

interface Project {
  title: string;
  instructions: string;
  submissionTypes: string[];
  dueDate: string;
  materials: Array<{
    url: string;
    name: string;
    type: string;
    public_id?: string;
  }>;
}

export default function CourseProjectsTab({ courseId }: { courseId: string }) {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [submissionTypes, setSubmissionTypes] = useState<string[]>(["file_upload"]);
  const [dueDate, setDueDate] = useState("");
  const [editing, setEditing] = useState(false);
  const [materials, setMaterials] = useState<Array<{
    name: string;
    url: string;
    type: string;
    public_id?: string;
  }>>([]);

    async function fetchProject() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/api/courses/${courseId}/project`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.status === 404) {
        setProject(null);
        resetForm();
        return;
      }
      
      if (!res.ok) throw new Error("Failed to fetch project");
      
      const projectData = await res.json();
      
      if (projectData) {
        setProject(projectData);
        // Hydrate form with existing project data
        setTitle(projectData.title || "");
        setInstructions(projectData.instructions || "");
        setSubmissionTypes(projectData.submissionTypes || ["file_upload"]);
        setDueDate(projectData.dueDate ? projectData.dueDate.split("T")[0] : "");
        setMaterials(projectData.materials || []);
      } else {
        setProject(null);
        resetForm();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load project");
    } finally {
      setLoading(false);
    }
  }

    // SIMPLIFIED handleSubmit - Use project endpoint
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const projectData = { 
      title, 
      instructions, 
      submissionTypes, 
      dueDate, 
      materials 
    };
    
    const token = localStorage.getItem("token");
    
    if (!token) {
      setError("Please log in to manage project");
      return;
    }

    try {
      let response: Response;
      
      if (project) {
        // Use project endpoint for updates
        response = await fetch(`${API_BASE}/api/courses/${courseId}/project`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(projectData),
        });
      } else {
        // Use project endpoint for creation
        response = await fetch(`${API_BASE}/api/courses/${courseId}/project`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(projectData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save project");
      }

      await fetchProject();
      resetForm();
      setError("");
    } catch (err: any) {
      console.error("Error saving project", err);
      setError(err.message || "Error saving project");
    }
  }

  // SIMPLIFIED handleDelete - Use project endpoint
  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this project?")) return;
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to delete project");
        return;
      }

      const response = await fetch(`${API_BASE}/api/courses/${courseId}/project`, {
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to delete project");
      
      await fetchProject(); // Refresh to show project is gone
      setError("");
    } catch (err: any) {
      console.error("Error deleting project", err);
      setError(err.message || "Error deleting project");
    }
  }

  useEffect(() => {
    if (courseId) fetchProject();
  }, [courseId]);

  const resetForm = () => {
    setTitle("");
    setInstructions("");
    setSubmissionTypes(["file_upload"]);
    setDueDate("");
    setMaterials([]);
    setEditing(false);
  };

  // Toggle submission type
  const toggleSubmissionType = (type: string) => {
    setSubmissionTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Start editing existing project
  const startEditing = () => {
    if (project) {
      setTitle(project.title || "");
      setInstructions(project.instructions || "");
      setSubmissionTypes(project.submissionTypes || ["file_upload"]);
      setDueDate(project.dueDate ? project.dueDate.split("T")[0] : "");
      setMaterials(project.materials || []);
      setEditing(true);
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    if (project) {
      // Reset to original project values
      setTitle(project.title || "");
      setInstructions(project.instructions || "");
      setSubmissionTypes(project.submissionTypes || ["file_upload"]);
      setDueDate(project.dueDate ? project.dueDate.split("T")[0] : "");
      setMaterials(project.materials || []);
    } else {
      resetForm();
    }
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Show form when editing or when no project exists */}
      {(editing || !project) && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg p-5 shadow-sm"
        >
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">
            {project ? "Edit Project" : "Add Project"}
          </h3>

          {project && editing && (
            <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-md">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                You are editing the project.{" "}
                <button 
                  type="button"
                  onClick={cancelEditing}
                  className="text-blue-600 dark:text-blue-300 underline hover:text-blue-800 dark:hover:text-blue-100"
                >
                  Cancel edit
                </button>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Title
              </label>
              <input
                type="text"
                className="w-full border border-[var(--border-primary)] rounded-md px-3 py-2.5 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Due Date
              </label>
              <input
                type="date"
                className="w-full border border-[var(--border-primary)] rounded-md px-3 py-2.5 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Instructions
            </label>
            <textarea
              rows={3}
              className="w-full border border-[var(--border-primary)] rounded-md px-3 py-2.5 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Provide detailed instructions for the project"
            />
          </div>

          {/* Materials Section */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Materials
            </label>
            <MaterialsUploader materials={materials} setMaterials={setMaterials} />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Submission Types (Select multiple)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["text", "file_upload", "link"].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`px-3 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                    submissionTypes.includes(type)
                      ? "bg-lfc-red dark:bg-red-800 text-gray-200 border-lfc-red"
                      : "bg-yt-light-hover text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-[var(--bg-tertiary)]"
                  }`}
                  onClick={() => toggleSubmissionType(type)}
                >
                  {type.replace("_", " ")}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              Selected: {submissionTypes.map(t => t.replace('_', ' ')).join(', ')}
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              className="px-4 py-2.5 bg-lfc-red dark:bg-red-800 text-gray-200 rounded-md hover:bg-lfc-red-hover dark:hover:bg-red-700 flex items-center font-medium text-sm"
              disabled={!title.trim() || !dueDate || submissionTypes.length === 0}
            >
              <FaSave className="mr-2" />{" "}
              {project ? "Update Project" : "Add Project"}
            </button>
            
            {project && (
              <button
                type="button"
                onClick={cancelEditing}
                className="px-4 py-2.5 border border-[var(--border-primary)] text-gray-700 dark:text-[var(--text-secondary)] dark:text-[var(--text-secondary)] rounded-md hover:bg-[var(--hover-bg)] dark:bg-[var(--bg-secondary)] dark:bg-[var(--bg-secondary)] dark:bg-[var(--bg-secondary)] font-medium text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* Project View - Only show when not editing and project exists */}
      {!editing && project && (
        <div className="bg-white dark:bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg p-5 shadow-sm">
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">
            Course Project
          </h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-[var(--text-primary)] text-lg">
                {project.title}
              </h4>
              <p className="text-sm text-[var(--text-secondary)] mt-2 whitespace-pre-wrap">
                {project.instructions}
              </p>
            </div>

            <div className="flex items-center text-sm text-[var(--text-secondary)]">
              <span className="bg-lfc-gold text-white px-2 py-1 rounded-full mr-3 capitalize">
                {project.submissionTypes.map(t => t.replace('_', ' ')).join(', ')}
              </span>
              <span>
                Due: {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : "N/A"}
              </span>
            </div>

            {/* Display materials if they exist */}
            {project.materials && project.materials.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-[var(--text-primary)] mb-2">Materials:</h5>
                <div className="space-y-2">
                  {project.materials.map((material, index) => (
                    <div key={index} className="flex items-center p-2 bg-gray-200 dark:bg-[var(--bg-secondary)] dark:bg-[var(--bg-secondary)] dark:bg-[var(--bg-secondary)] rounded-md">
                      <div className={`p-1 rounded mr-2 ${
                        material.type === 'image' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 dark:text-blue-300' :
                        material.type === 'video' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300' :
                        material.type === 'pdf' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300' :
                        'bg-gray-100 dark:bg-[var(--bg-tertiary)] dark:bg-[var(--bg-tertiary)] text-gray-600 dark:text-[var(--text-secondary)]'
                      }`}>
                        {material.type === 'image' && '🖼️'}
                        {material.type === 'video' && '🎬'}
                        {material.type === 'pdf' && '📄'}
                        {!['image', 'video', 'pdf'].includes(material.type) && '📎'}
                      </div>
                      <span className="text-sm text-[var(--text-primary)]">{material.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-2 pt-2">
              <button
                onClick={startEditing}
                className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 text-sm px-3 py-1 border border-blue-300 dark:border-blue-700 rounded-md"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="text-red-600 dark:text-red-800 hover:text-red-800 dark:hover:text-red-700 text-sm px-3 py-1 border border-red-300 dark:border-red-700 rounded-md flex items-center"
              >
                <FaTrash className="mr-1" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-sm text-[var(--text-secondary)]">Loading project...</div>
      )}
    </div>
  );
}