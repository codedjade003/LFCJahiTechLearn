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
      className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300 p-4 mb-4 cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-900/40 transition group"
      onClick={onClick}
    >
      <p className="font-semibold">
        Your profile is {completionPercent}% complete. <span className="underline group-hover:font-bold transition-all">Click here</span> to update your profile.
      </p>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
        <div
          className="bg-yellow-500 dark:bg-yellow-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${completionPercent}%` }}
        />
      </div>
    </div>
  );
});

ProfileCompletionBanner.displayName = 'ProfileCompletionBanner';

export default ProfileCompletionBanner;