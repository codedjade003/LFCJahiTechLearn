import { useState, useEffect } from "react";
import { FaTrash, FaSave } from "react-icons/fa";
import MaterialsUploader from "../../shared/MaterialsUploader";

interface Assignment {
  _id?: string;
  title: string;
  instructions: string;
  submissionTypes: string[]; // Changed to array
  dueDate: string;
  materials?: Array<{
    url: string;
    name: string;
    type: string;
  }>;
}

export default function CourseAssignmentsTab({ courseId }: { courseId: string | null }) {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [submissionTypes, setSubmissionTypes] = useState<string[]>(["text"]); // Fixed variable name and type
  const [dueDate, setDueDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  // Add this state for materials
  const [materials, setMaterials] = useState<Array<{ name: string; url: string; type: string }>>([]);
  // Add this unified upload function at the top of your component, after the state declarations

  async function fetchAssignments() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/courses/${courseId}/assignments`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      
      if (res.status === 404) {
        setAssignments([]);
        return;
      }
      
      if (!res.ok) throw new Error("Failed to fetch assignments");
      
      const data = await res.json();
      setAssignments(data || []);
    } catch (err) {
      console.error("Failed to fetch assignments", err);
      setError("Assignments feature not available yet");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {    
    if (courseId) {
      fetchAssignments();
    }
  }, [courseId]);

  const resetForm = () => {
    setTitle("");
    setInstructions("");
    setSubmissionTypes(["text"]); // Fixed variable name
    setMaterials([]);
    setDueDate("");
    setEditingId(null);
  };

  // Update the handleSubmit function to properly handle materials:
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const assignmentData = { 
      title, 
      instructions, 
      submissionTypes, 
      dueDate, 
      materials // Just pass the materials array directly
    };
    
    const token = localStorage.getItem("token");
    
    if (!token) {
      setError("Please log in to manage assignments");
      return;
    }

    try {
      let response: Response;
      
      if (editingId) {
        response = await fetch(`${API_BASE}/api/courses/${courseId}/assignments/${editingId}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(assignmentData),
        });
      } else {
        response = await fetch(`${API_BASE}/api/courses/${courseId}/assignments`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(assignmentData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save assignment");
      }

      await fetchAssignments();
      resetForm();
      setError("");
    } catch (err: any) {
      console.error("Error saving assignment", err);
      setError(err.message || "Error saving assignment");
    }
  }
  function handleEdit(assignment: Assignment) {
    if (!assignment._id) return;
    
    setTitle(assignment.title);
    setInstructions(assignment.instructions);
    setSubmissionTypes(assignment.submissionTypes || ["text"]); // Fixed variable name
    setMaterials(assignment.materials || []); // 👈 hydrate uploader with existing
    setDueDate(assignment.dueDate.split('T')[0]);
    setEditingId(assignment._id);
  }

  async function handleDelete(id?: string) {
    if (!id) return;
    
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to delete assignments");
        return;
      }

      const res = await fetch(`${API_BASE}/api/courses/${courseId}/assignments/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error("Failed to delete assignment");
      
      await fetchAssignments();
      setError("");
    } catch (err: any) {
      console.error("Error deleting assignment", err);
      setError(err.message || "Error deleting assignment");
    }
  }

  if (!courseId) {
    return (
      <div className="bg-white p-6 rounded-lg border border-yt-light-border shadow-sm">
        <h3 className="text-lg font-medium text-yt-text-dark mb-4">Course Assignments</h3>
        <p className="text-yt-text-gray">Please save the course first to add assignments.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-yt-light-border rounded-lg p-5 shadow-sm">
        <h3 className="text-lg font-medium text-yt-text-dark mb-4">
          {editingId ? "Edit Assignment" : "Add New Assignment"}
        </h3>
        
        {editingId && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              You are editing an assignment.{" "}
              <button 
                type="button"
                onClick={resetForm}
                className="text-blue-600 underline hover:text-blue-800"
              >
                Cancel edit
              </button>
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-yt-text-dark mb-2">Title</label>
            <input
              type="text"
              className="w-full border border-yt-light-border rounded-md px-3 py-2.5 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-yt-text-dark mb-2">Due Date</label>
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
          <label className="block text-sm font-medium text-yt-text-dark mb-2">Instructions</label>
          <textarea
            rows={3}
            className="w-full border border-yt-light-border rounded-md px-3 py-2.5 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold text-sm"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Provide detailed instructions for this assignment"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-yt-text-dark mb-2">
            Materials
          </label>
          <MaterialsUploader materials={materials} setMaterials={setMaterials} />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-yt-text-dark mb-2">Submission Types</label>
          <div className="grid grid-cols-3 gap-2">
            {["text", "file_upload", "link"].map((type) => (
              <button
                key={type}
                type="button"
                className={`px-3 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                  submissionTypes.includes(type)
                    ? "bg-lfc-red text-white border-lfc-red"
                    : "bg-yt-light-hover text-yt-text-dark hover:bg-gray-200 border border-yt-light-border"
                }`}
                onClick={() => {
                  setSubmissionTypes(prev => 
                    prev.includes(type) 
                      ? prev.filter(t => t !== type)
                      : [...prev, type]
                  );
                }}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="px-4 py-2.5 bg-lfc-red text-white rounded-md hover:bg-lfc-gold-dark flex items-center font-medium text-sm"
          disabled={!title.trim() || !dueDate}
        >
          <FaSave className="mr-2" /> {editingId ? "Update Assignment" : "Add Assignment"}
        </button>
      </form>

      <div className="bg-white border border-yt-light-border rounded-lg p-5 shadow-sm">
        <h3 className="text-lg font-medium text-yt-text-dark mb-4">Course Assignments</h3>
        
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-yt-light-hover rounded-lg"></div>
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <p className="text-sm text-yt-text-gray text-center py-4">No assignments added yet.</p>
        ) : (
          <ul className="divide-y divide-yt-light-border">
            {assignments.map((assignment) => {
             if (!assignment || !assignment.title) return null;
             return (
              <li key={assignment._id} className="py-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-yt-text-dark">{assignment.title}</h4>
                    <p className="text-sm text-yt-text-gray mt-1">{assignment.instructions}</p>
                    <div className="flex items-center mt-2 text-xs text-yt-text-gray">
                      <span className="bg-lfc-gold text-white px-2 py-1 rounded-full mr-2 capitalize">
                        {Array.isArray(assignment.submissionTypes) 
                          ? assignment.submissionTypes.join(', ').replace(/_/g, ' ')
                          : "N/A"}
                      </span>
                      <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(assignment)}
                      className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1 border border-blue-200 rounded-md"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(assignment._id)}
                      className="text-red-600 hover:text-red-800 text-sm px-3 py-1 border border-red-200 rounded-md flex items-center"
                    >
                      <FaTrash className="mr-1" /> Delete
                    </button>
                  </div>
                </div>
              </li>
            );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}