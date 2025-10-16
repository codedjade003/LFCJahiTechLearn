import React, { memo } from 'react';

interface UserProfile {
  profilePicture: string;
  name: string;
  dateOfBirth: string;
  phoneNumber: string;
  maritalStatus: string;
  technicalUnit: string;
  profilePicturePreview?: string;
}

interface OnboardingModalProps {
  profile: UserProfile;
  currentStep: number;
  onboardingSteps: string[];
  fixedCategories: string[];
  onSkip: () => void;
  onNextStep: () => void;
  onInputChange: (field: keyof UserProfile, value: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCategoryChange: (value: string) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = memo(({
  profile,
  currentStep,
  onboardingSteps,
  fixedCategories,
  onSkip,
  onNextStep,
  onInputChange,
  onFileChange,
  onCategoryChange
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-11/12 max-w-3xl h-auto max-h-[80vh] overflow-auto relative">
        <button
          onClick={onSkip}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-2 dark:text-white">
          {onboardingSteps[currentStep]}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Please update your profile before accessing courses. You can
          complete later by skipping.
        </p>

        {currentStep === 0 && (
          <div className="space-y-4">
            <label className="block dark:text-gray-200">Profile Picture</label>
            <input type="file" onChange={onFileChange} />
            {profile.profilePicture && (
              <img
                src={profile.profilePicturePreview || profile.profilePicture}
                alt="Preview"
                className="h-20 w-20 rounded-full object-cover mt-2"
              />
            )}
            <input
              type="text"
              placeholder="Full Name"
              value={profile.name}
              onChange={(e) => onInputChange("name", e.target.value)}
              className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <input
              type="date"
              value={profile.dateOfBirth}
              onChange={(e) => onInputChange("dateOfBirth", e.target.value)}
              className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={profile.phoneNumber}
              onChange={(e) => onInputChange("phoneNumber", e.target.value)}
              className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <select
              value={profile.maritalStatus}
              onChange={(e) => onInputChange("maritalStatus", e.target.value)}
              className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select Marital Status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <label className="block font-medium dark:text-gray-200">
              Select Technical Unit
            </label>
            <select
              value={profile.technicalUnit}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select a category</option>
              {fixedCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-between mt-4">
          <button
            onClick={onSkip}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
          >
            Skip
          </button>
          <button
            onClick={onNextStep}
            className="bg-lfc-red text-white px-4 py-2 rounded hover:bg-lfc-gold"
          >
            {currentStep === onboardingSteps.length - 1
              ? "Finish"
              : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
});

OnboardingModal.displayName = 'OnboardingModal';

export default OnboardingModal;