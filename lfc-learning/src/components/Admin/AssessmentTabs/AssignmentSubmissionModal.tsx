// src/components/Admin/AssignmentSubmissionModal.tsx
import { useState, useEffect } from "react";
import { FaTimes, FaDownload, FaExternalLinkAlt, FaStar, FaPaperclip } from "react-icons/fa";

interface AssignmentSubmission {
  _id: string;
  submissionType: string;
  submission: {
    text?: string;
    link?: string;
    file?: {
      url: string;
      name: string;
      type: string;
      size: number;
    };
  };
  grade?: number;
  feedback?: string;
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
  assignmentId?: {
    _id: string;
    title: string;
    dueDate: string;
    instructions?: string;
    maxPoints?: number;
  };
}

interface AssignmentSubmissionModalProps {
  submission: AssignmentSubmission | null;
  isOpen: boolean;
  onClose: () => void;
  onGrade: (submissionId: string, grade: number, feedback: string) => Promise<void>;
}

export default function AssignmentSubmissionModal({ 
  submission, 
  isOpen, 
  onClose, 
  onGrade 
}: AssignmentSubmissionModalProps) {
  const [grade, setGrade] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isGrading, setIsGrading] = useState(false);

  useEffect(() => {
    if (submission) {
      setGrade(submission.grade || 0);
      setFeedback(submission.feedback || "");
    }
  }, [submission]);

  if (!isOpen || !submission) return null;

  const handleSubmitGrade = async () => {
    const maxPoints = submission.assignmentId?.maxPoints || 100;
    if (grade < 0 || grade > maxPoints) {
      alert(`Grade must be between 0 and ${maxPoints}`);
      return;
    }

    setIsGrading(true);
    try {
      await onGrade(submission._id, grade, feedback);
      onClose();
    } catch (error) {
      console.error("Error grading submission:", error);
    } finally {
      setIsGrading(false);
    }
  };

  const renderSubmissionContent = () => {
    switch (submission.submissionType) {
      case "text":
        return (
          <div className="bg-gray-50 dark:bg-[var(--bg-secondary)] p-4 rounded-lg">
            <h4 className="font-medium mb-2">Text Submission</h4>
            <p className="text-gray-700 dark:text-[var(--text-secondary)] whitespace-pre-wrap">
              {submission.submission.text || "No text provided"}
            </p>
          </div>
        );

      case "link":
        return (
          <div className="bg-gray-50 dark:bg-[var(--bg-secondary)] p-4 rounded-lg">
            <h4 className="font-medium mb-2">Link Submission</h4>
            <a 
              href={submission.submission.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              {submission.submission.link}
              <FaExternalLinkAlt className="ml-2" size={12} />
            </a>
          </div>
        );

      case "file_upload":
        const file = submission.submission.file;
        if (!file) return <div>No file uploaded</div>;

        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const isPDF = file.type === 'application/pdf';

        return (
          <div className="bg-gray-50 dark:bg-[var(--bg-secondary)] p-4 rounded-lg">
            <h4 className="font-medium mb-2">File Submission</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaPaperclip className="text-gray-400 mr-2" />
                <span className="font-medium">{file.name}</span>
                {file.size && !isNaN(file.size) && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({(file.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                )}
              </div>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <FaDownload className="mr-1" size={14} />
                Download
              </a>
            </div>

            {/* File Preview */}
            <div className="mt-4">
              {isImage && (
                <img 
                  src={file.url} 
                  alt={file.name}
                  className="max-w-full h-auto rounded-lg border"
                />
              )}
              {isVideo && (
                <video 
                  controls 
                  className="max-w-full rounded-lg border"
                >
                  <source src={file.url} type={file.type} />
                  Your browser does not support the video tag.
                </video>
              )}
              {isPDF && (
                <iframe
                  src={file.url}
                  className="w-full h-96 rounded-lg border"
                  title={file.name}
                />
              )}
            </div>
          </div>
        );

      default:
        return <div>Unknown submission type</div>;
    }
  };

  const maxPoints = submission.assignmentId?.maxPoints || 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-yt-text-dark">
              Assignment Submission Review
            </h2>
            <p className="text-yt-text-gray">
              {submission.courseId.title} • {submission.assignmentId?.title || 'Assignment'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-[var(--text-secondary)]"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Student Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-yt-text-dark mb-2">Student Information</h3>
              <p className="text-yt-text-gray">{submission.studentId.name}</p>
              <p className="text-yt-text-gray text-sm">{submission.studentId.email}</p>
            </div>
            <div>
              <h3 className="font-medium text-yt-text-dark mb-2">Submission Details</h3>
              <p className="text-yt-text-gray">
                Submitted: {new Date(submission.createdAt).toLocaleString()}
              </p>
              {submission.assignmentId?.dueDate && (
                <p className="text-yt-text-gray">
                  Due: {new Date(submission.assignmentId.dueDate).toLocaleString()}
                </p>
              )}
              {maxPoints && (
                <p className="text-yt-text-gray">
                  Max Points: {maxPoints}
                </p>
              )}
            </div>
          </div>

          {/* Assignment Instructions */}
          {submission.assignmentId?.instructions && (
            <div>
              <h3 className="font-medium text-yt-text-dark mb-2">Assignment Instructions</h3>
              <p className="text-yt-text-gray whitespace-pre-wrap">
                {submission.assignmentId.instructions}
              </p>
            </div>
          )}

          {/* Submission Content */}
          <div>
            <h3 className="font-medium text-yt-text-dark mb-2">Student Submission</h3>
            {renderSubmissionContent()}
          </div>

          {/* Grading Section */}
          <div className="border-t pt-6">
            <h3 className="font-medium text-yt-text-dark mb-4">Grade Assignment</h3>
            
            {/* Grade Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-yt-text-dark mb-2">
                  Grade (0-{maxPoints})
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    min="0"
                    max={maxPoints}
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value))}
                    className="w-24 px-3 py-2 border border-yt-light-border rounded-lg focus:outline-none focus:border-lfc-red"
                  />
                  <div className="flex items-center space-x-1">
                    {[0, Math.round(maxPoints * 0.25), Math.round(maxPoints * 0.5), Math.round(maxPoints * 0.75), maxPoints].map((points) => (
                      <button
                        key={points}
                        type="button"
                        onClick={() => setGrade(points)}
                        className={`px-2 py-1 text-xs rounded ${
                          grade === points
                            ? 'bg-lfc-red text-white'
                            : 'bg-gray-100 dark:bg-[var(--bg-tertiary)] text-gray-700 dark:text-[var(--text-secondary)] hover:bg-gray-200'
                        }`}
                      >
                        {points}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-yt-text-dark mb-2">
                  Current Status
                </label>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  submission.grade !== undefined
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {submission.grade !== undefined ? 'Graded' : 'Pending Review'}
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-yt-text-dark mb-2">
                Feedback
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                placeholder="Provide constructive feedback for the student..."
                className="w-full px-3 py-2 border border-yt-light-border rounded-lg focus:outline-none focus:border-lfc-red"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 dark:text-[var(--text-secondary)] rounded-lg hover:bg-gray-50 dark:bg-[var(--bg-secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitGrade}
                disabled={isGrading}
                className="px-4 py-2 bg-lfc-red text-white rounded-lg hover:bg-lfc-gold-dark disabled:opacity-50 flex items-center"
              >
                {isGrading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Grading...
                  </>
                ) : (
                  <>
                    <FaStar className="mr-2" />
                    {submission.grade !== undefined ? 'Update Grade' : 'Submit Grade'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}