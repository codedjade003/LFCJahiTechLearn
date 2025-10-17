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
  const { validationCode } = useParams<{ validationCode?: string; enrollmentId?: string }>();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateCertificate = async () => {
      // Only use validationCode, not enrollmentId for validation
      const code = validationCode;
      
      if (!code) {
        setError("No validation code provided");
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Validating certificate with code:', code);
        
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/certificates/validate/${code}`
        );

        const data = await response.json();

        if (!response.ok) {
          console.log('❌ Validation failed:', data.message);
          setError(data.message || "Certificate not found");
          setLoading(false);
          return;
        }

        console.log('✅ Validation successful:', data);
        console.log('Student Name:', data.studentName);
        console.log('Course Title:', data.courseTitle);
        
        setCertificate(data);
        setLoading(false);

        // Set Open Graph meta tags for social media sharing
        updateMetaTags(data);
      } catch (err: any) {
        console.error("Validation error:", err);
        setError("Failed to validate certificate. Please check your connection.");
        setLoading(false);
        toast.error("Failed to validate certificate");
      }
    };

    validateCertificate();
  }, [validationCode]);

  const updateMetaTags = (cert: CertificateData) => {
    const title = `${cert.studentName} - ${cert.courseTitle} Certificate`;
    const description = `${cert.studentName} successfully completed ${cert.courseTitle} at LFC Jahi Tech Learn`;
    const url = window.location.href;
    // Use logo-social.png if available (with white background), otherwise use regular logo
    const logoUrl = `${window.location.origin}/logo-social.png`;
    const faviconUrl = `${window.location.origin}/logo.png`;
    
    // Update document title
    document.title = title;
    
    // Update favicon
    let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = faviconUrl;
    
    // Update or create meta tags
    const updateMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    updateMeta('og:title', title);
    updateMeta('og:description', description);
    updateMeta('og:url', url);
    updateMeta('og:type', 'website');
    updateMeta('og:image', logoUrl);
    updateMeta('twitter:card', 'summary');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', logoUrl);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <FaSpinner className="text-5xl text-lfc-red animate-spin mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-800">Validating certificate...</p>
          <p className="text-sm text-gray-600 mt-2">Please wait while we verify the authenticity</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center border border-gray-200">
          <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Certificate</h1>
          <div className="bg-red-50 border border-red-200 p-4 mb-6 rounded">
            <p className="text-red-800 font-medium">{error || "Certificate not found"}</p>
          </div>
          <p className="text-gray-700 mb-6 text-sm">
            This certificate could not be verified. It may have been revoked, expired, or the validation code is incorrect.
          </p>
          <div className="space-y-3">
            <Link
              to="/"
              className="block w-full px-6 py-3 bg-lfc-red text-white rounded-lg hover:bg-lfc-gold-dark transition-colors font-medium"
            >
              Go to Homepage
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="block w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
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
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6 text-center border border-gray-200 no-print">
          <FaCheckCircle className="text-6xl text-green-600 mx-auto mb-4" />
          <div className="inline-block px-4 py-2 bg-green-100 text-green-900 rounded-full text-sm font-semibold mb-4">
            ✓ VERIFIED AUTHENTIC
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificate Verified!</h1>
          <p className="text-lg text-gray-700">This certificate is valid and authentic</p>
          <p className="text-sm text-gray-600 mt-2">Issued by LFC Jahi Tech Learn</p>
        </div>

        {/* Certificate Details */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 print-area">
          <div className="border-2 border-gray-300 rounded-lg p-8 bg-gray-50">
            {/* Certificate Header */}
            <div className="text-center mb-8">
              <FaCertificate className="text-5xl text-lfc-red mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Certificate of Completion</h2>
              <p className="text-gray-700 font-medium">LFC Jahi Tech Learn</p>
            </div>

            {/* Student Info */}
            <div className="mb-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FaUser className="text-gray-700" />
                <p className="text-gray-700">This certifies that</p>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-4">{certificate.studentName}</h3>
              <p className="text-gray-700 mb-2">has successfully completed</p>
              <h4 className="text-2xl font-semibold text-lfc-red">{certificate.courseTitle}</h4>
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <FaCalendar className="text-gray-700" />
                  <p className="font-semibold text-gray-900">Completion Date</p>
                </div>
                <p className="text-gray-700">
                  {completionDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {certificate.finalScore && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FaTrophy className="text-lfc-gold" />
                    <p className="font-semibold text-gray-900">Final Score</p>
                  </div>
                  <p className="text-2xl font-bold text-green-700">{certificate.finalScore}%</p>
                </div>
              )}

              {certificate.metadata?.courseLevel && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FaBook className="text-gray-700" />
                    <p className="font-semibold text-gray-900">Course Level</p>
                  </div>
                  <p className="text-gray-700">{certificate.metadata.courseLevel}</p>
                </div>
              )}

              {certificate.metadata?.courseDuration && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FaCalendar className="text-gray-700" />
                    <p className="font-semibold text-gray-900">Duration</p>
                  </div>
                  <p className="text-gray-700">{certificate.metadata.courseDuration}</p>
                </div>
              )}
            </div>

            {/* Certificate ID */}
            <div className="border-t border-gray-300 pt-6 text-center">
              <p className="text-sm text-gray-700 mb-1 font-medium">Certificate ID</p>
              <p className="font-mono text-lg font-semibold text-gray-900">{certificate.certificateId}</p>
              <p className="text-xs text-gray-600 mt-2">
                Issued on {issuedDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {certificate.instructorName && (
              <div className="mt-6 text-center">
                <div className="inline-block border-t-2 border-gray-400 pt-2">
                  <p className="font-semibold text-gray-900">{certificate.instructorName}</p>
                  <p className="text-sm text-gray-700">Course Instructor</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center space-y-4">
            <div className="bg-green-50 border border-green-300 rounded-lg p-4">
              <p className="text-sm text-gray-900 font-medium mb-2">
                ✓ This certificate has been verified and is authentic.
              </p>
              <p className="text-xs text-gray-700">
                Verified on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="inline-block px-6 py-3 bg-lfc-red text-white rounded-lg hover:bg-lfc-gold-dark transition-colors font-medium"
              >
                Explore More Courses
              </Link>
              <button
                onClick={() => window.print()}
                className="inline-block px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
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
