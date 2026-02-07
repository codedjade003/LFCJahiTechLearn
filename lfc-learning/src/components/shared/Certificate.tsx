import { useRef } from 'react';
import { FaDownload, FaShareAlt } from 'react-icons/fa';
import CertificateCard from './CertificateCard';

interface CertificateProps {
  studentName: string;
  courseName: string;
  completionDate: string;
  score: number;
  certificateId?: string;
}

export default function Certificate({ studentName, courseName, completionDate, score, certificateId }: CertificateProps) {
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
      <div ref={certificateRef} className="p-4 sm:p-6 bg-white dark:bg-[var(--bg-elevated)] rounded-2xl shadow-2xl">
        <CertificateCard
          studentName={studentName}
          courseTitle={courseName}
          completionDate={completionDate}
          issuedAt={completionDate}
          finalScore={score}
          certificateId={certificateId || "—"}
          showIssuer={false}
        />
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
