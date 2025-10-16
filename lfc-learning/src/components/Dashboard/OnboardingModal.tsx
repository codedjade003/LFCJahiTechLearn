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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-11/12 max-w-2xl h-auto max-h-[85vh] overflow-auto relative border border-gray-200 dark:border-gray-700">
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Step {currentStep + 1} of {onboardingSteps.length}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-500">
              {Math.round(((currentStep + 1) / onboardingSteps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-lfc-red h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2 dark:text-white text-gray-900">
          {onboardingSteps[currentStep]}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {currentStep === 0 
            ? "Let's set up your profile to personalize your learning experience."
            : "Choose your technical unit to get relevant course recommendations."}
        </p>

        {currentStep === 0 && (
          <div className="space-y-5">
            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Profile Picture
              </label>
              {profile.profilePicture && (
                <img
                  src={profile.profilePicturePreview || profile.profilePicture}
                  alt="Preview"
                  className="h-24 w-24 rounded-full object-cover mb-3 border-4 border-gray-200 dark:border-gray-600"
                />
              )}
              <label className="cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Choose Photo
                <input type="file" onChange={onFileChange} className="hidden" accept="image/*" />
              </label>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={profile.name}
                onChange={(e) => onInputChange("name", e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-lfc-red focus:border-transparent transition-all"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={profile.dateOfBirth}
                onChange={(e) => onInputChange("dateOfBirth", e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-lfc-red focus:border-transparent transition-all"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+234 XXX XXX XXXX"
                value={profile.phoneNumber}
                onChange={(e) => onInputChange("phoneNumber", e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-lfc-red focus:border-transparent transition-all"
              />
            </div>

            {/* Marital Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Marital Status
              </label>
              <select
                value={profile.maritalStatus}
                onChange={(e) => onInputChange("maritalStatus", e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-lfc-red focus:border-transparent transition-all"
              >
                <option value="">Select Marital Status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your technical unit helps us recommend courses that match your interests and career goals.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Technical Unit *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {fixedCategories.filter(cat => cat !== "All Courses").map((cat) => (
                  <button
                    key={cat}
                    onClick={() => onCategoryChange(cat)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      profile.technicalUnit === cat
                        ? 'border-lfc-red bg-lfc-red/10 dark:bg-lfc-red/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-lfc-red/50'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{cat}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onSkip}
            className="px-6 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Skip for now
          </button>
          <button
            onClick={onNextStep}
            className="px-6 py-2.5 rounded-lg bg-lfc-red text-white hover:bg-lfc-red/90 transition-colors font-medium shadow-lg shadow-lfc-red/30"
          >
            {currentStep === onboardingSteps.length - 1
              ? "Finish Setup"
              : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
});

OnboardingModal.displayName = 'OnboardingModal';

export default OnboardingModal;
