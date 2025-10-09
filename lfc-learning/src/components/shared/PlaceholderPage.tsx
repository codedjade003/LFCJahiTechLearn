// src/components/PlaceholderPage.tsx
import { FaTools, FaHome, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
  title?: string;
  message?: string;
  showHomeButton?: boolean;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title = "Coming Soon",
  message = "This page is currently under development. We're working hard to bring you this feature!",
  showHomeButton = true
}) => {
  return (
    <div className="min-h-screen bg-yt-light-gray flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-yt-light-border p-8 text-center shadow-sm">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-lfc-gold bg-opacity-10 flex items-center justify-center">
          <FaTools className="w-10 h-10 text-lfc-gold" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-yt-text-dark mb-4">
          {title}
        </h1>

        {/* Message */}
        <p className="text-yt-text-gray mb-8 leading-relaxed">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-yt-light-border rounded-lg text-yt-text-dark hover:bg-yt-light-hover transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          
          {showHomeButton && (
            <Link
              to="/"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-lfc-gold text-white rounded-lg hover:bg-lfc-gold-dark transition-colors"
            >
              <FaHome className="w-4 h-4" />
              Go Home
            </Link>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="mt-8">
          <div className="w-full bg-yt-light-border rounded-full h-2">
            <div className="bg-lfc-gold h-2 rounded-full w-3/4 animate-pulse"></div>
          </div>
          <p className="text-xs text-yt-text-light mt-2">
            Feature in development
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;