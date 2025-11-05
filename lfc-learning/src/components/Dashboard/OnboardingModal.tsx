import React, { memo, useState, useEffect } from 'react';
import { useModalState } from '../../context/ModalContext';

interface UserProfile {
  profilePicture: string;
  name: string;
  dateOfBirth: string;
  phoneNumber: string;
  maritalStatus: string;
  technicalUnit: string;
  profilePicturePreview?: string;
  profilePicturePosition?: { x: number; y: number };
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
  onProfilePicturePositionChange?: (position: { x: number; y: number }) => void;
  showWarning?: boolean;
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
  onCategoryChange,
  onProfilePicturePositionChange,
  showWarning = false
}) => {
  useModalState(true); // This modal is always open when rendered
  const [showPositionEditor, setShowPositionEditor] = useState(false);
  const [tempPosition, setTempPosition] = useState(profile.profilePicturePosition || { x: 50, y: 50 });
  
  // Sync position when profile changes (e.g., when existing profile picture is loaded)
  useEffect(() => {
    if (profile.profilePicturePosition) {
      setTempPosition(profile.profilePicturePosition);
    }
  }, [profile.profilePicturePosition]);
  
  const getMaxBirthDate = () => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return maxDate.toISOString().split("T")[0];
  };
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[var(--bg-elevated)] dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-11/12 max-w-2xl h-auto max-h-[85vh] overflow-auto relative border border-gray-200 dark:border-gray-700 scrollbar-hide">
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
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Step {currentStep + 1} of {onboardingSteps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-lfc-red h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Warning Banner - Shows for 5 seconds when triggered by enrollment attempt */}
        {showWarning && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 rounded-r-lg animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                  Profile Completion Required
                </p>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  You must complete your profile before enrolling in courses. Please fill in all required fields below.
                </p>
              </div>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold mb-2 dark:text-white text-gray-900 dark:text-white">
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
              {(profile.profilePicturePreview || profile.profilePicture) && (
                <div className="relative mb-3">
                  <div 
                    className="h-24 w-24 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-600"
                    style={{
                      backgroundImage: `url(${profile.profilePicturePreview || profile.profilePicture})`,
                      backgroundSize: 'cover',
                      backgroundPosition: `${tempPosition.x}% ${tempPosition.y}%`
                    }}
                  />
                  {(profile.profilePicturePreview || profile.profilePicture) && (
                    <button
                      type="button"
                      onClick={() => setShowPositionEditor(!showPositionEditor)}
                      className="absolute -bottom-2 -right-2 bg-lfc-gold text-white p-2 rounded-full hover:bg-lfc-gold-hover transition-colors shadow-lg"
                      title="Adjust position"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </button>
                  )}
                </div>
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
                max={getMaxBirthDate()}
                onChange={(e) => onInputChange("dateOfBirth", e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-lfc-red focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Technical Unit members must be 18 years or older
              </p>
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
                {fixedCategories.filter(cat => cat !== "All Courses" && cat !== "Required").map((cat) => (
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

      {/* Profile Picture Position Editor Modal */}
      {showPositionEditor && (profile.profilePicturePreview || profile.profilePicture) && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[70]">
          <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Adjust Profile Picture</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Click on the image to set the visible area</p>
            
            <div 
              className="relative w-64 h-64 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden cursor-crosshair"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                const newPos = { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
                setTempPosition(newPos);
                onProfilePicturePositionChange?.(newPos);
              }}
            >
              <img 
                src={profile.profilePicturePreview || profile.profilePicture} 
                alt="Profile preview" 
                className="w-full h-full object-cover"
                style={{
                  objectPosition: `${tempPosition.x}% ${tempPosition.y}%`
                }}
              />
              <div 
                className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg"
                style={{
                  left: `${tempPosition.x}%`,
                  top: `${tempPosition.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowPositionEditor(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowPositionEditor(false)}
                className="px-4 py-2 bg-lfc-red text-white rounded-lg hover:bg-red-700"
              >
                Save Position
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

OnboardingModal.displayName = 'OnboardingModal';

export default OnboardingModal;
