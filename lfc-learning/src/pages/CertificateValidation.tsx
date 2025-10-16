import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaCertificate, FaCalendar, FaTrophy, FaUser, FaBook } from "react-icons/fa";
import { toast } from "react-toastify";

interface CertificateData {
  valid: boolean;
  certificateId: string;
  studentName: string;
  courseTitle: string;
  completionDate: string;
  issuedAt: string;
  finalScore?: number;
  instructorName?: string;
  metadata?: {
    courseDuration?: string;
    courseLevel?: string;
    totalModules?: number;
    completedModules?: number;
  };
  status: string;
}

export default function CertificateValidation() {
  const { validationCode } = useParams<{ validationCode: string }>();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateCertificate = async () => {
      if (!validationCode) {
        setError("No validation code provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/certificates/validate/${validationCode}`
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Certificate not found");
          setLoading(false);
          return;
        }

        setCertificate(data);
        setLoading(false);
      } catch (err: any) {
        console.error("Validation error:", err);
        setError("Failed to validate certificate");
        setLoading(false);
        toast.error("Failed to validate certificate");
      }
    };

    validateCertificate();
  }, [validationCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-6xl text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-700">Validating certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Invalid Certificate</h1>
          <p className="text-gray-600 mb-6">{error || "Certificate not found"}</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const completionDate = new Date(certificate.completionDate);
  const issuedDate = new Date(certificate.issuedAt);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6 text-center">
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Certificate Verified!</h1>
          <p className="text-xl text-gray-600">This certificate is valid and authentic</p>
        </div>

        {/* Certificate Details */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="border-4 border-blue-600 rounded-lg p-8">
            {/* Certificate Header */}
            <div className="text-center mb-8">
              <FaCertificate className="text-5xl text-blue-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Certificate of Completion</h2>
              <p className="text-gray-600">LFC Jahi Tech Learn</p>
            </div>

            {/* Student Info */}
            <div className="mb-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FaUser className="text-blue-600" />
                <p className="text-gray-600">This certifies that</p>
              </div>
              <h3 className="text-4xl font-bold text-gray-800 mb-4">{certificate.studentName}</h3>
              <p className="text-gray-600 mb-2">has successfully completed</p>
              <h4 className="text-2xl font-semibold text-blue-600">{certificate.courseTitle}</h4>
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaCalendar className="text-blue-600" />
                  <p className="font-semibold text-gray-700">Completion Date</p>
                </div>
                <p className="text-gray-600">
                  {completionDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {certificate.finalScore && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaTrophy className="text-yellow-500" />
                    <p className="font-semibold text-gray-700">Final Score</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{certificate.finalScore}%</p>
                </div>
              )}

              {certificate.metadata?.courseLevel && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaBook className="text-blue-600" />
                    <p className="font-semibold text-gray-700">Course Level</p>
                  </div>
                  <p className="text-gray-600">{certificate.metadata.courseLevel}</p>
                </div>
              )}

              {certificate.metadata?.courseDuration && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaCalendar className="text-blue-600" />
                    <p className="font-semibold text-gray-700">Duration</p>
                  </div>
                  <p className="text-gray-600">{certificate.metadata.courseDuration}</p>
                </div>
              )}
            </div>

            {/* Certificate ID */}
            <div className="border-t pt-6 text-center">
              <p className="text-sm text-gray-600 mb-1">Certificate ID</p>
              <p className="font-mono text-lg font-semibold text-gray-800">{certificate.certificateId}</p>
              <p className="text-xs text-gray-500 mt-2">
                Issued on {issuedDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {certificate.instructorName && (
              <div className="mt-6 text-center">
                <div className="inline-block border-t-2 border-gray-300 pt-2">
                  <p className="font-semibold text-gray-800">{certificate.instructorName}</p>
                  <p className="text-sm text-gray-600">Course Instructor</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-4">
              This certificate has been verified and is authentic.
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Explore More Courses
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
