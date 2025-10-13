// src/pages/Dashboard/ProjectDetail.tsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaFileUpload, 
  FaLink, 
  FaFileAlt, 
  FaCalendar,
  FaCheckCircle,
  FaDownload,
  FaUser
} from "react-icons/fa";

interface Project {
  title: string;
  instructions: string;
  materials: Array<{
    url: string;
    name: string;
    type: string;
  }>;
  submissionTypes: string[];
  dueDate: string;
}

interface Course {
  _id: string;
  title: string;
  project?: Project;
  instructor: {
    name: string;
    avatar?: string;
  };
}

interface Submission {
  _id: string;
  submissionType: string;
  submission: {
    text?: string;
    link?: string;
    file?: {
      url: string;
      name: string;
      type: string;
    };
  };
  createdAt: string;
  grade?: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: {
    name: string;
    avatar?: string;
  };
}

type SubmissionType = 'text' | 'link' | 'file_upload';

interface SubmissionData {
  type: SubmissionType;
  text: string;
  link: string;
  file: File | null;
}

export default function ProjectDetail() {
  const { courseId } = useParams(); // Changed from projectId to courseId
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissionData, setSubmissionData] = useState<SubmissionData>({
    type: 'text',
    text: '',
    link: '',
    file: null
  });

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  // Fetch submission after course is loaded
  useEffect(() => {
    if (course && courseId) {
      fetchSubmission();
    }
  }, [course, courseId]);

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch the specific course
      const res = await fetch(`${API_BASE}/api/courses/${courseId}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      
      if (res.ok) {
        const courseData = await res.json();
        setCourse(courseData);
        
        if (courseData.project) {
          setProject(courseData.project);
        } else {
          console.error("No project found in course");
          setLoading(false);
        }
      } else {
        console.error("Error fetching course");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching course", err);
      setLoading(false);
    }
  };

  const fetchSubmission = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!courseId) {
        console.error("Missing courseId");
        setLoading(false);
        return;
      }

      const res = await fetch(
        `${API_BASE}/api/submissions/course/${courseId}/project`, // FIXED ROUTE
        {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );
      
      console.log('Fetch project submission response status:', res.status);
      
      if (res.ok) {
        const submissionData = await res.json();
        console.log('Project submission data:', submissionData);
        setSubmission(submissionData);
      } else if (res.status === 404) {
        // No submission exists yet - this is normal
        console.log('No project submission found (404)');
        setSubmission(null);
      } else {
        console.error("Error fetching project submission:", res.status);
        const errorText = await res.text();
        console.error('Error response:', errorText);
      }
    } catch (err) {
      console.error("Error fetching project submission", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSubmissionData(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };

  // Alternative: Keep separate but fix file upload
  const submitProject = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!courseId || !project) {
        alert('Missing course or project information');
        return;
      }

      console.log('🔄 Starting project submission...');

      // For file uploads, use FormData
      if (submissionData.type === 'file_upload' && submissionData.file) {
        const formData = new FormData();
        formData.append('submissionType', submissionData.type);
        formData.append('file', submissionData.file);
        
        console.log('📤 Uploading file:', submissionData.file.name);

        const res = await fetch(
          `${API_BASE}/api/submissions/course/${courseId}/project`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
            body: formData,
          }
        );

        console.log('📥 File upload response status:', res.status);
        
        if (res.ok) {
          const result = await res.json();
          console.log('✅ Project submitted successfully:', result);
          alert('Project submitted successfully!');
          fetchSubmission();
          setSubmissionData({ type: 'text', text: '', link: '', file: null });
          return;
        } else {
          const errorText = await res.text();
          console.error('❌ File upload failed:', errorText);
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText };
          }
          alert(`Failed to submit project: ${errorData.message}`);
          return;
        }
      }

      // For text and link submissions, use JSON
      const submissionPayload = {
        submissionType: submissionData.type,
        // Send text/link directly at root level, not inside submission object
        text: submissionData.type === 'text' ? submissionData.text : undefined,
        link: submissionData.type === 'link' ? submissionData.link : undefined
      };

      console.log('📤 Sending JSON submission:', submissionPayload);

      const res = await fetch(
        `${API_BASE}/api/submissions/course/${courseId}/project`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(submissionPayload),
        }
      );
      
      console.log('📥 JSON submission response status:', res.status);
      
      if (res.ok) {
        const result = await res.json();
        console.log('✅ Project submitted successfully:', result);
        alert('Project submitted successfully!');
        fetchSubmission();
        setSubmissionData({ type: 'text', text: '', link: '', file: null });
      } else {
        const errorText = await res.text();
        console.error('❌ JSON submission failed:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        alert(`Failed to submit project: ${errorData.message}`);
      }
    } catch (err) {
      console.error("💥 Error submitting project", err);
      alert('Failed to submit project. Please check your connection and try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-yt-light-hover rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!course || !project) {
    return (
      <div className="p-6">
        <div className="bg-white p-8 rounded-lg text-center border border-yt-light-border">
          <p className="text-yt-text-gray mb-4">Project not found.</p>
        <Link to="/dashboard/project" className="text-lfc-red hover:underline">
          Back to My Projects
        </Link>
        </div>
      </div>
    );
  }

  const isSubmitted = !!submission;
  const isGraded = submission?.grade !== undefined;
  const isOverdue = project.dueDate && new Date(project.dueDate) < new Date();

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/dashboard/project')}
            className="mr-4 p-2 rounded-md text-yt-text-dark hover:bg-yt-light-hover"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-yt-text-dark">{project.title}</h1>
            <Link 
              to={`/dashboard/courses/${course._id}`}
              className="text-lfc-red hover:underline"
            >
              {course.title}
            </Link>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isGraded ? 'bg-green-100 text-green-800' :
            isSubmitted ? 'bg-blue-100 text-blue-800' :
            isOverdue ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {isGraded ? 'Graded' : 
             isSubmitted ? 'Submitted' : 
             isOverdue ? 'Overdue' : 'Pending'}
          </span>
          
          {project.dueDate && (
            <span className="flex items-center text-sm text-yt-text-gray">
              <FaCalendar className="mr-1" />
              Due: {new Date(project.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Project Content */}
      <div className="bg-white rounded-lg border border-yt-light-border shadow-sm">
        {/* Instructions */}
        <div className="p-6 border-b border-yt-light-border">
          <h2 className="text-lg font-semibold mb-3">Instructions</h2>
          <div className="prose max-w-none">
            <p className="text-yt-text-gray whitespace-pre-wrap">{project.instructions}</p>
          </div>
        </div>

        {/* Materials */}
        {project.materials && project.materials.length > 0 && (
          <div className="p-6 border-b border-yt-light-border">
            <h2 className="text-lg font-semibold mb-3">Materials</h2>
            <div className="space-y-2">
              {project.materials.map((material, index) => (
                <a
                  key={index}
                  href={`${API_BASE}${material.url}`}
                  download
                  className="flex items-center p-3 border border-yt-light-border rounded-lg hover:bg-yt-light-hover transition-colors"
                >
                  <FaDownload className="text-lfc-red mr-3" />
                  <span className="text-yt-text-dark">{material.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Submission Area */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FaCheckCircle className="text-green-500 mr-2" />
                Project Submitted
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Your Submission</h4>
                  {submission.submissionType === 'text' && submission.submission.text && (
                    <div className="p-3 bg-white border rounded-lg">
                      <p className="text-yt-text-gray whitespace-pre-wrap">
                        {submission.submission.text}
                      </p>
                    </div>
                  )}
                  {submission.submissionType === 'link' && submission.submission.link && (
                    <a 
                      href={submission.submission.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-lfc-red hover:underline block p-3 bg-white border rounded-lg"
                    >
                      {submission.submission.link}
                    </a>
                  )}
                  {submission.submissionType === 'file_upload' && submission.submission.file && (
                    <div className="flex items-center p-3 bg-white border rounded-lg">
                      <FaFileAlt className="text-lfc-red mr-3" />
                      <div>
                        <span className="block">{submission.submission.file.name}</span>
                        <span className="text-sm text-yt-text-gray">{submission.submission.file.type}</span>
                      </div>
                      <a 
                        href={`${API_BASE}${submission.submission.file.url}`}
                        download
                        className="ml-auto text-lfc-red hover:underline"
                      >
                        Download
                      </a>
                    </div>
                  )}                                    
                  <p className="text-sm text-yt-text-gray mt-2">
                    Submitted on: {submission.createdAt ? new Date(submission.createdAt).toLocaleDateString() : 'Date not available'}
                  </p>
                </div>

                {isGraded && (
                  <div>
                    <h4 className="font-medium mb-2">Grading & Feedback</h4>
                    <div className="p-3 bg-white border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span>Score:</span>
                        <span className="font-semibold text-2xl text-lfc-red">{submission.grade}%</span>
                      </div>
                      
                      {submission.feedback && (
                        <div className="mb-3">
                          <span className="font-medium block mb-1">Feedback:</span>
                          <p className="text-yt-text-gray whitespace-pre-wrap">{submission.feedback}</p>
                        </div>
                      )}
                      
                      {submission.gradedBy && (
                        <div className="flex items-center text-sm text-yt-text-gray">
                          <FaUser className="mr-2" />
                          Graded by: {submission.gradedBy.name}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold mb-4">Submit Project</h3>
              
              {/* Submission Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">Submission Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {project.submissionTypes.map((type: string) => (
                    <button
                      key={type}
                      onClick={() => setSubmissionData(prev => ({ ...prev, type: type as SubmissionType }))}
                      className={`p-3 border rounded-lg text-center transition-colors ${
                        submissionData.type === type
                          ? 'border-lfc-red bg-red-50 text-lfc-red'
                          : 'border-yt-light-border hover:border-lfc-red'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        {type === 'text' && <FaFileAlt className="text-xl mb-1" />}
                        {type === 'link' && <FaLink className="text-xl mb-1" />}
                        {type === 'file_upload' && <FaFileUpload className="text-xl mb-1" />}
                        <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submission Form */}
              <div className="space-y-4">
                {submissionData.type === 'text' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Answer</label>
                    <textarea
                      value={submissionData.text}
                      onChange={(e) => setSubmissionData(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Type your project submission here..."
                      className="w-full h-32 p-3 border border-yt-light-border rounded-lg resize-none focus:outline-none focus:border-lfc-red"
                    />
                  </div>
                )}

                {submissionData.type === 'link' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Submission Link</label>
                    <input
                      type="url"
                      value={submissionData.link}
                      onChange={(e) => setSubmissionData(prev => ({ ...prev, link: e.target.value }))}
                      placeholder="https://example.com/your-work"
                      className="w-full p-3 border border-yt-light-border rounded-lg focus:outline-none focus:border-lfc-red"
                    />
                  </div>
                )}

                {submissionData.type === 'file_upload' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Upload File</label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="w-full p-3 border border-yt-light-border rounded-lg focus:outline-none focus:border-lfc-red"
                    />
                    {submissionData.file && (
                      <p className="text-sm text-yt-text-gray mt-2">
                        Selected: {submissionData.file.name}
                      </p>
                    )}
                  </div>
                )}

                <button
                  onClick={submitProject}
                  disabled={
                    (submissionData.type === 'text' && !submissionData.text.trim()) ||
                    (submissionData.type === 'link' && !submissionData.link.trim()) ||
                    (submissionData.type === 'file_upload' && !submissionData.file)
                  }
                  className="px-6 py-3 bg-lfc-red text-white rounded-lg hover:bg-lfc-gold-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Project
                </button>

                {isOverdue && (
                  <p className="text-red-600 text-sm">
                    ⚠️ The due date has passed. Late submissions may not be accepted.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}