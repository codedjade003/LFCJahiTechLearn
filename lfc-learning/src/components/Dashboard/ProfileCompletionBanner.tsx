import React, { memo } from 'react';

interface ProfileCompletionBannerProps {
  completionPercent: number;
  onClick: () => void;
}

const ProfileCompletionBanner: React.FC<ProfileCompletionBannerProps> = memo(({
  completionPercent,
  onClick
}) => {
  return (
    <div
      className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 cursor-pointer hover:bg-yellow-200 transition"
      onClick={onClick}
    >
      <p className="font-semibold">
        Your profile is {completionPercent}% complete. Click here to update your profile.
      </p>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div
          className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${completionPercent}%` }}
        />
      </div>
    </div>
  );
});

ProfileCompletionBanner.displayName = 'ProfileCompletionBanner';

export default ProfileCompletionBanner;