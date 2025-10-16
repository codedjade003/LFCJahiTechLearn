import { FaLinkedin, FaWhatsapp, FaFacebook, FaXTwitter } from "react-icons/fa6";

interface ShareButtonProps {
  platform: 'linkedin' | 'x' | 'whatsapp' | 'facebook';
  courseTitle: string;
  progress: number;
  passed: boolean;
  enrollmentId?: string;
}

export const ShareButton = ({ 
  platform, 
  courseTitle, 
  progress,
  passed,
  enrollmentId
}: ShareButtonProps) => {
  const certificateUrl = passed && enrollmentId 
    ? `${window.location.origin}/certificate/${enrollmentId}`
    : window.location.origin;

  const shareMessage = passed 
    ? `🎓 I successfully completed "${courseTitle}" with ${progress}% mastery! Check out my certificate: ${certificateUrl}`
    : `📚 I'm making great progress in "${courseTitle}" - currently at ${progress}% completion!`;

  const shareUrls = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}&summary=${encodeURIComponent(shareMessage)}`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareMessage)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(certificateUrl)}&quote=${encodeURIComponent(shareMessage)}`
  };

  const platformIcons = {
    linkedin: <FaLinkedin className="text-xl" />,
    x: <FaXTwitter className="text-xl" />,
    whatsapp: <FaWhatsapp className="text-xl" />,
    facebook: <FaFacebook className="text-xl" />
  };

  const platformColors = {
    linkedin: 'bg-blue-600 hover:bg-blue-700',
    x: 'bg-black hover:bg-gray-800',
    whatsapp: 'bg-green-500 hover:bg-green-600',
    facebook: 'bg-blue-800 hover:bg-blue-900'
  };

  const platformNames = {
    linkedin: 'LinkedIn',
    x: 'X',
    whatsapp: 'WhatsApp',
    facebook: 'Facebook'
  };

  const handleShare = () => {
    const url = shareUrls[platform];
    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <button
      onClick={handleShare}
      className={`p-3 rounded-full text-white ${platformColors[platform]} transition-colors transform hover:scale-110`}
      title={`Share on ${platformNames[platform]}`}
    >
      <span className="text-xl font-bold">{platformIcons[platform]}</span>
    </button>
  );
};
