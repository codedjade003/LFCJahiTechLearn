import { useRef } from 'react';
import { FaDownload, FaShareAlt } from 'react-icons/fa';

interface CertificateProps {
  studentName: string;
  courseName: string;
  completionDate: string;
  score: number;
}

export default function Certificate({ studentName, courseName, completionDate, score }: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    try {
      // Use html2canvas to convert the certificate to an image
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${courseName.replace(/[^a-z0-9]/gi, '_')}_Certificate.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Failed to download certificate. Please try again.');
    }
  };

  const shareCertificate = async () => {
    if (!certificateRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (blob && navigator.share) {
          const file = new File([blob], 'certificate.png', { type: 'image/png' });
          try {
            await navigator.share({
              title: 'Course Completion Certificate',
              text: `I completed ${courseName}!`,
              files: [file],
            });
          } catch (err) {
            console.log('Share cancelled or failed:', err);
          }
        } else {
          // Fallback: just download
          downloadCertificate();
        }
      });
    } catch (error) {
      console.error('Error sharing certificate:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Certificate Preview */}
      <div 
        ref={certificateRef}
        className="bg-white dark:bg-[var(--bg-elevated)] border-8 border-double border-lfc-gold p-12 rounded-lg shadow-2xl"
        style={{ 
          background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
          minHeight: '500px'
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-4xl font-bold text-lfc-red mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Certificate of Completion
          </h1>
          <div className="w-32 h-1 bg-lfc-gold mx-auto"></div>
        </div>

        {/* Body */}
        <div className="text-center space-y-6">
          <p className="text-lg text-gray-600">This is to certify that</p>
          
          <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
            {studentName}
          </h2>
          
          <p className="text-lg text-gray-600">has successfully completed the course</p>
          
          <h3 className="text-2xl font-semibold text-lfc-red px-8">
            {courseName}
          </h3>
          
          <div className="flex justify-center items-center space-x-8 pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Completion Date</p>
              <p className="text-lg font-semibold text-gray-800">
                {new Date(completionDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            
            <div className="w-px h-12 bg-gray-300"></div>
            
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Final Score</p>
              <p className="text-lg font-semibold text-green-600">{score}%</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-between items-end">
            <div className="text-center flex-1">
              <div className="w-48 h-px bg-gray-400 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">LFC Jahi Tech Learn</p>
              <p className="text-xs text-gray-500">Learning Platform</p>
            </div>
            
            <div className="text-center flex-1">
              <div className="w-48 h-px bg-gray-400 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Course Instructor</p>
              <p className="text-xs text-gray-500">Authorized Signature</p>
            </div>
          </div>
        </div>

        {/* Watermark */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400">
            Certificate ID: {`LFC-${Date.now().toString(36).toUpperCase()}`}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={downloadCertificate}
          className="flex items-center space-x-2 px-6 py-3 bg-lfc-red text-white rounded-lg hover:bg-lfc-gold-dark transition-colors shadow-md"
        >
          <FaDownload />
          <span>Download Certificate</span>
        </button>
        
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={shareCertificate}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <FaShareAlt />
            <span>Share Certificate</span>
          </button>
        )}
      </div>
    </div>
  );
}
