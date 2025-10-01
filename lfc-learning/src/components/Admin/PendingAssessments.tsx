// src/components/Admin/PendingAssessments.tsx
import { useState, useEffect } from "react";
import { FaFileAlt, FaProjectDiagram, FaQuestionCircle, FaExclamationCircle } from "react-icons/fa";

interface Assessment {
  _id: string;
  title: string;
  dueDate: string;
  submittedBy: string;
  type: 'assignment' | 'project' | 'quiz' | 'exam';
  status: 'pending' | 'overdue';
}

export default function PendingAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingAssessments();
  }, []);

  const fetchPendingAssessments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/pending-assessments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAssessments(data.assessments);
      } else {
        console.error('Failed to fetch pending assessments');
        setAssessments([]);
      }
    } catch (error) {
      console.error('Error fetching pending assessments:', error);
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const getAssessmentIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <FaFileAlt />;
      case 'project': return <FaProjectDiagram />;
      case 'quiz': return <FaQuestionCircle />;
      case 'exam': return <FaExclamationCircle />;
      default: return <FaFileAlt />;
    }
  };

  const getAssessmentColor = (type: string, status: string) => {
    if (status === 'overdue') return "bg-red-100 text-red-600";
    
    switch (type) {
      case 'assignment': return "bg-blue-100 text-blue-600";
      case 'project': return "bg-purple-100 text-purple-600";
      case 'quiz': return "bg-green-100 text-green-600";
      case 'exam': return "bg-orange-100 text-orange-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const formatDueDate = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Overdue: ${Math.abs(diffDays)} days`;
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return `In ${diffDays} days`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-redCustom">Pending Assessments</h2>
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex items-start p-3 border rounded-lg">
              <div className="w-10 h-10 bg-gray-200 rounded-full mr-4"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold text-redCustom">Pending Assessments</h2>
        <button className="text-goldCustom hover:text-redCustom text-sm">View All</button>
      </div>
      <div className="p-6 space-y-4">
        {assessments.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No pending assessments</div>
        ) : (
          assessments.map((item) => (
            <div key={item._id} className="flex items-start p-3 border rounded-lg hover:bg-gray-50">
              <div className={`p-2 rounded-full mr-4 ${getAssessmentColor(item.type, item.status)}`}>
                {getAssessmentIcon(item.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-medium">{item.title}</h3>
                  <span className={`text-sm ${item.status === 'overdue' ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                    {formatDueDate(item.dueDate)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">Submitted by: {item.submittedBy}</p>
                <div className="flex space-x-2">
                  <button className="text-sm bg-goldCustom hover:bg-redCustom text-white px-3 py-1 rounded">Review</button>
                  <button className="text-sm border border-gray-300 hover:bg-gray-100 px-3 py-1 rounded">View</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}