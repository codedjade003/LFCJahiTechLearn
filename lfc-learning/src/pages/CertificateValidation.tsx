import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaCertificate, FaCalendar, FaTrophy, FaUser, FaBook } from "react-icons/fa";
import { toast } from "react-toastify";

// Add print styles
const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    .print-area, .print-area * {
      visibility: visible;
    }
    .print-area {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    .no-print {
      display: none !important;
    }
  }
`;

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
  const { validationCode, enrollmentId } = useParams<{ validationCode?: string; enrollmentId?: string }>();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateCertificate = async () => {
      const code = validationCode || enrollmentId;
      
      if (!code) {
        setError("No validation code provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/certificates/validate/${code}`
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
  }, [validationCode, enrollmentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <FaSpinner className="text-6xl text-blue-600 animate-spin mx-auto mb-4" />
            <div className="absolute inset-0 blur-xl bg-blue-400 opacity-20 animate-pulse"></div>
          </div>
          <p className="text-xl font-semibold text-gray-700 animate-pulse">Validating certificate...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we verify the authenticity</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center transform hover:scale-105 transition-transform">
          <div className="relative mb-6">
            <FaTimesCircle className="text-7xl text-red-500 mx-auto animate-bounce" />
            <div className="absolute inset-0 blur-2xl bg-red-400 opacity-20"></div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Invalid Certificate</h1>
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-red-700 font-medium">{error || "Certificate not found"}</p>
          </div>
          <p className="text-gray-600 mb-6 text-sm">
            This certificate could not be verified. It may have been revoked, expired, or the validation code is incorrect.
          </p>
          <div className="space-y-3">
            <Link
              to="/"
              className="block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
            >
              Go to Homepage
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const completionDate = new Date(certificate.completionDate);
  const issuedDate = new Date(certificate.issuedAt);

  return (
    <>
      <style>{printStyles}</style>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6 text-center transform hover:scale-105 transition-transform no-print">
          <div className="relative mb-6">
            <FaCheckCircle className="text-7xl text-green-500 mx-auto animate-bounce" />
            <div className="absolute inset-0 blur-2xl bg-green-400 opacity-20"></div>
          </div>
          <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-4">
            ✓ VERIFIED AUTHENTIC
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Certificate Verified!</h1>
          <p className="text-xl text-gray-600">This certificate is valid and authentic</p>
          <p className="text-sm text-gray-500 mt-2">Issued by LFC Jahi Tech Learn</p>
        </div>

        {/* Certificate Details */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-shadow print-area">
          <div className="border-4 border-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
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
          <div className="mt-8 text-center space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 font-medium mb-2">
                ✓ This certificate has been verified and is authentic.
              </p>
              <p className="text-xs text-gray-500">
                Verified on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
              >
                Explore More Courses
              </Link>
              <button
                onClick={() => window.print()}
                className="inline-block px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Print Certificate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
