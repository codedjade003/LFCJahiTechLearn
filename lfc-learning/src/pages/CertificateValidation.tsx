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
    .dark-mode-print {
      background: white !important;
      color: black !important;
    }
    .dark-mode-print * {
      background: white !important;
      color: black !important;
      border-color: #333 !important;
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
    const description = `${cert.studentName} successfully completed ${cert.courseTitle} at LFC Tech Learn`;
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <FaSpinner className="text-5xl text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">Validating certificate...</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Please wait while we verify the authenticity</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center border border-gray-200 dark:border-slate-700">
          <FaTimesCircle className="text-6xl text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Invalid Certificate</h1>
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 mb-6 rounded-lg">
            <p className="text-red-700 dark:text-red-300 font-medium">{error || "Certificate not found"}</p>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
            This certificate could not be verified. It may have been revoked, expired, or the validation code is incorrect.
          </p>
          <div className="space-y-3">
            <Link
              to="/"
              className="block w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/25 dark:shadow-blue-600/25"
            >
              Go to Homepage
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="block w-full px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 mb-6 text-center border border-gray-200 dark:border-slate-700 no-print">
            <div className="flex items-center justify-center gap-4 mb-4">
              <img 
                src="/logo.png" 
                alt="LFC Tech Learn Logo" 
                className="h-12 w-auto"
              />
              <FaCheckCircle className="text-5xl text-green-500 dark:text-green-400" />
            </div>
            <div className="inline-block px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold mb-4 border border-green-200 dark:border-green-800">
              ✓ VERIFIED AUTHENTIC
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Certificate Verified!</h1>
            <p className="text-lg text-gray-700 dark:text-gray-300">This certificate is valid and authentic</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Issued by LFC Tech Learn</p>
          </div>

          {/* Certificate Details */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-slate-700 print-area dark-mode-print">
            <div className="border-2 border-slate-200 dark:border-slate-600 rounded-2xl p-8 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-400/10 rounded-full -translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-green-500/5 dark:bg-green-400/10 rounded-full translate-x-20 translate-y-20"></div>
              
              {/* Certificate Header with Logo */}
              <div className="text-center mb-8 relative z-10">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
                  <img 
                    src="/logo.png" 
                    alt="LFC Tech Learn Logo" 
                    className="h-20 w-auto"
                  />
                  <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
                </div>
                <FaCertificate className="text-6xl text-blue-500 dark:text-blue-400 mx-auto mb-4" />
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400 bg-clip-text text-transparent mb-2">
                  Certificate of Completion
                </h2>
                <p className="text-slate-600 dark:text-slate-400 font-semibold text-lg">LFC Tech Learn</p>
              </div>

              {/* Student Info */}
              <div className="mb-8 text-center relative z-10">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <FaUser className="text-slate-500 dark:text-slate-400" />
                  <p className="text-slate-600 dark:text-slate-400 font-medium">This certifies that</p>
                </div>
                <h3 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-6 py-2 border-y border-slate-200 dark:border-slate-600">
                  {certificate.studentName}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-3 text-lg">has successfully completed the course</p>
                <h4 className="text-3xl font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-6 py-3 rounded-xl border border-blue-100 dark:border-blue-800">
                  {certificate.courseTitle}
                </h4>
              </div>

              {/* Details Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-8 relative z-10">
                <div className="bg-white dark:bg-slate-700/50 rounded-xl p-6 border border-slate-100 dark:border-slate-600 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <FaCalendar className="text-blue-500 dark:text-blue-400 text-lg" />
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Completion Date</p>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-lg font-medium">
                    {completionDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {certificate.finalScore && (
                  <div className="bg-white dark:bg-slate-700/50 rounded-xl p-6 border border-slate-100 dark:border-slate-600 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <FaTrophy className="text-amber-500 text-lg" />
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Final Score</p>
                    </div>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{certificate.finalScore}%</p>
                  </div>
                )}

                {certificate.metadata?.courseLevel && (
                  <div className="bg-white dark:bg-slate-700/50 rounded-xl p-6 border border-slate-100 dark:border-slate-600 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <FaBook className="text-purple-500 dark:text-purple-400 text-lg" />
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Course Level</p>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-lg font-medium">{certificate.metadata.courseLevel}</p>
                  </div>
                )}

                {certificate.metadata?.courseDuration && (
                  <div className="bg-white dark:bg-slate-700/50 rounded-xl p-6 border border-slate-100 dark:border-slate-600 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <FaCalendar className="text-cyan-500 dark:text-cyan-400 text-lg" />
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Duration</p>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-lg font-medium">{certificate.metadata.courseDuration}</p>
                  </div>
                )}
              </div>

              {/* Certificate ID */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-8 text-center relative z-10">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-semibold uppercase tracking-wide">Certificate ID</p>
                <p className="font-mono text-xl font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-lg inline-block">
                  {certificate.certificateId}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                  Issued on {issuedDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {certificate.instructorName && (
                <div className="mt-8 text-center relative z-10">
                  <div className="inline-block border-t-2 border-slate-300 dark:border-slate-600 pt-6">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">{certificate.instructorName}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Course Instructor</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-8 text-center space-y-4 no-print">
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-6">
                <p className="text-lg text-slate-900 dark:text-green-300 font-semibold mb-2">
                  ✓ This certificate has been verified and is authentic.
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Verified on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-blue-500/25 dark:shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-500/30"
                >
                  Explore More Courses
                </Link>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all font-semibold"
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