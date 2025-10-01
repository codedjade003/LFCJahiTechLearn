import { useState, useEffect } from "react";
import { FaSave, FaTrash } from "react-icons/fa";
import MaterialsUploader from "../../shared/MaterialsUploader";

interface Project {
  title: string;
  instructions: string;
  submissionTypes: string[]; // CHANGED: plural array
  dueDate: string;
  materials: Array<{ // ADDED: materials field
    url: string;
    name: string;
    type: string;
  }>;
}

export default function CourseProjectsTab({ courseId }: { courseId: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [submissionTypes, setSubmissionTypes] = useState<string[]>(["file_upload"]); // CHANGED: plural array
  const [dueDate, setDueDate] = useState("");
  const [editing, setEditing] = useState(false);
  // Add this state for materials
  const [materials, setMaterials] = useState<Array<{ name: string; url: string; type: string }>>([]);

  // Fetch existing project
  async function fetchProject() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/courses/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch course");
      const courseData = await res.json();
      setProject(courseData.project || null);
      // 👇 hydrate uploader state with existing materials
      setMaterials(project?.materials || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load project");
    } finally {
      setLoading(false);
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

  // Save / Update
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return setError("Please log in first");

    const projectData = { 
      title, 
      instructions, 
      submissionTypes, // CHANGED: plural
      dueDate,
      materials: [] // ADDED: empty materials array for now
    };

    try {
      // First get the course to update
      const courseRes = await fetch(
        `http://localhost:5000/api/courses/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (!courseRes.ok) throw new Error("Failed to fetch course");
      const course = await courseRes.json();

      // Update course with project data
      const updateRes = await fetch(
        `http://localhost:5000/api/courses/${courseId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...course,
            project: projectData
          }),
        }
      );
      
      if (!updateRes.ok) throw new Error("Failed to save project");
      const saved = await updateRes.json();
      setProject(saved.project || projectData);
      resetForm();
      setError("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error saving project");
    }
  }

  // Delete
  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return setError("Please log in first");

      // Get course first
      const courseRes = await fetch(
        `http://localhost:5000/api/courses/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (!courseRes.ok) throw new Error("Failed to fetch course");
      const course = await courseRes.json();

      // Update course without project
      const updateRes = await fetch(
        `http://localhost:5000/api/courses/${courseId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...course,
            project: null
          }),
        }
      );
      
      if (!updateRes.ok) throw new Error("Failed to delete project");
      setProject(null);
      resetForm();
      setError("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error deleting project");
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Form */}
      {(editing || !project) && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-yt-light-border rounded-lg p-5 shadow-sm"
        >
          <h3 className="text-lg font-medium text-yt-text-dark mb-4">
            {project ? "Edit Project" : "Add Project"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-yt-text-dark mb-2">
                Title
              </label>
              <input
                type="text"
                className="w-full border border-yt-light-border rounded-md px-3 py-2.5 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-yt-text-dark mb-2">
                Due Date
              </label>
              <input
                type="date"
                className="w-full border border-yt-light-border rounded-md px-3 py-2.5 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-yt-text-dark mb-2">
              Instructions
            </label>
            <textarea
              rows={3}
              className="w-full border border-yt-light-border rounded-md px-3 py-2.5 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Provide detailed instructions for the project"
            />
          </div>

          {/* Materials Section */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-yt-text-dark mb-2">
              Materials
            </label>
            <MaterialsUploader materials={materials} setMaterials={setMaterials} />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-yt-text-dark mb-2">
              Submission Types (Select multiple)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["text", "file_upload", "link"].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`px-3 py-2 rounded-md text-sm font-medium capitalize ${
                    submissionTypes.includes(type)
                      ? "bg-lfc-red text-white"
                      : "bg-yt-light-hover text-yt-text-dark hover:bg-gray-200"
                  }`}
                  onClick={() => toggleSubmissionType(type)}
                >
                  {type.replace("_", " ")}
                </button>
              ))}
            </div>
            <p className="text-xs text-yt-text-gray mt-2">
              Selected: {submissionTypes.map(t => t.replace('_', ' ')).join(', ')}
            </p>
          </div>

          <button
            type="submit"
            className="px-4 py-2.5 bg-lfc-red text-white rounded-md hover:bg-lfc-gold-dark flex items-center font-medium text-sm"
            disabled={!title.trim() || !dueDate || submissionTypes.length === 0}
          >
            <FaSave className="mr-2" />{" "}
            {project ? "Update Project" : "Add Project"}
          </button>
        </form>
      )}

      {/* Project View */}
      {!editing && project && (
        <div className="bg-white border border-yt-light-border rounded-lg p-5 shadow-sm">
          <h3 className="text-lg font-medium text-yt-text-dark mb-4">
            Course Project
          </h3>
          <h4 className="font-medium text-yt-text-dark">
            {project?.title || ""}
          </h4>
          <p className="text-sm text-yt-text-gray mt-1">
            {project?.instructions || ""}
          </p>
          <div className="flex items-center mt-2 text-xs text-yt-text-gray">
            <span className="bg-lfc-gold text-white px-2 py-1 rounded-full mr-2">
              {project?.submissionTypes
                ? project.submissionTypes.map(t => t.replace('_', ' ')).join(', ')
                : ""}
            </span>
            <span>
              Due:{" "}
              {project?.dueDate
                ? new Date(project.dueDate).toLocaleDateString()
                : "N/A"}
            </span>
          </div>

          <div className="flex space-x-2 mt-4">
            <button
              onClick={() => {
                setEditing(true);
                setTitle(project?.title || "");
                setInstructions(project?.instructions || "");
                setSubmissionTypes(project?.submissionTypes || ["file_upload"]);
                setDueDate(
                  project?.dueDate
                    ? project.dueDate.split("T")[0]
                    : ""
                );
              }}
              className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1 border border-blue-200 rounded-md"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800 text-sm px-3 py-1 border border-red-200 rounded-md flex items-center"
            >
              <FaTrash className="mr-1" /> Delete
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-sm text-yt-text-gray">Loading project...</div>
      )}
    </div>
  );
}