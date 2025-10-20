import { FaLinkedin, FaWhatsapp, FaFacebook, FaXTwitter } from "react-icons/fa6";

interface ShareButtonProps {
  platform: 'linkedin' | 'x' | 'whatsapp' | 'facebook';
  courseTitle: string;
  progress: number;
  passed: boolean;
  validationCode?: string;
}

export const ShareButton = ({ 
  platform, 
  courseTitle, 
  progress,
  passed,
  validationCode
}: ShareButtonProps) => {
  const certificateUrl = passed && validationCode 
    ? `${window.location.origin}/validate/${validationCode}`
    : window.location.href; // Use current URL if no certificate

  const shareMessage = passed 
    ? `I successfully completed "${courseTitle}" with ${progress}% mastery! Check out my certificate`
    : `I'm making great progress in "${courseTitle}" - currently at ${progress}% completion!`;

  const shareUrls = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(certificateUrl)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage + ' ' + certificateUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(certificateUrl)}`
  };

  const platformIcons = {
    linkedin: <FaLinkedin className="text-xl" />,
    x: <FaXTwitter className="text-xl" />,
    whatsapp: <FaWhatsapp className="text-xl" />,
    facebook: <FaFacebook className="text-xl" />
  };

  const platformColors = {
    linkedin: 'bg-[#0077B5] hover:bg-[#00669c]',
    x: 'bg-black hover:bg-gray-800',
    whatsapp: 'bg-[#25D366] hover:bg-[#20bd5c]',
    facebook: 'bg-[#1877F2] hover:bg-[#1666d9]'
  };

  const platformNames = {
    linkedin: 'LinkedIn',
    x: 'X (Twitter)',
    whatsapp: 'WhatsApp',
    facebook: 'Facebook'
  };

  const handleShare = () => {
    const url = shareUrls[platform];
    
    // Better window positioning
    const width = 600;
    const height = platform === 'whatsapp' ? 700 : 500;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    window.open(
      url, 
      `share-${platform}`, 
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
  };

  return (
    <button
      onClick={handleShare}
      className={`p-3 rounded-full text-white ${platformColors[platform]} transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-md hover:shadow-lg`}
      title={`Share on ${platformNames[platform]}`}
      aria-label={`Share on ${platformNames[platform]}`}
    >
      {platformIcons[platform]}
    </button>
  );
};