// src/components/Student/ModuleCompletionModal.tsx
import { useState } from "react";
import { FaTimes, FaCheckCircle, FaStar } from "react-icons/fa";

interface SurveyQuestion {
  question: string;
  type: "text" | "rating" | "multiple-choice";
  options?: string[];
}

interface ModuleCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (surveyResponses?: Record<string, any>) => void;
  module: {
    title: string;
    survey?: {
      questions: SurveyQuestion[];
    };
  };
}

export default function ModuleCompletionModal({
  isOpen,
  onClose,
  onComplete,
  module,
}: ModuleCompletionModalProps) {
  const [surveyResponses, setSurveyResponses] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState<"completion" | "survey">("completion");

  if (!isOpen) return null;

  const hasSurvey = module.survey && module.survey.questions.length > 0;

  const handleContinue = () => {
    if (hasSurvey && currentStep === "completion") {
      setCurrentStep("survey");
    } else {
      onComplete(hasSurvey ? surveyResponses : undefined);
    }
  };

  const handleSkipSurvey = () => {
    onComplete(undefined);
  };

  const updateResponse = (questionIndex: number, value: any) => {
    setSurveyResponses({
      ...surveyResponses,
      [questionIndex]: value,
    });
  };

  const renderRatingInput = (questionIndex: number, currentValue?: number) => {
    return (
      <div className="flex gap-2 justify-center">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => updateResponse(questionIndex, rating)}
            className={`p-2 transition-colors ${
              currentValue === rating
                ? "text-lfc-gold"
                : "text-gray-300 hover:text-lfc-gold"
            }`}
          >
            <FaStar size={32} />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-[var(--bg-elevated)] border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {currentStep === "completion" ? "Module Complete!" : "Quick Feedback"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {currentStep === "completion" ? (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="text-green-500 text-5xl" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Congratulations!
                </h3>
                <p className="text-gray-600">
                  You've successfully completed <strong>{module.title}</strong>
                </p>
              </div>
              {hasSurvey && (
                <p className="text-sm text-gray-500">
                  Help us improve by answering a few quick questions
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-gray-600 text-center mb-6">
                Your feedback helps us improve the learning experience
              </p>
              {module.survey?.questions.map((question, index) => (
                <div key={index} className="space-y-3">
                  <label className="block text-sm font-medium text-gray-900">
                    {question.question}
                  </label>
                  {question.type === "text" && (
                    <textarea
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold"
                      rows={4}
                      placeholder="Your answer..."
                      value={surveyResponses[index] || ""}
                      onChange={(e) => updateResponse(index, e.target.value)}
                    />
                  )}
                  {question.type === "rating" && (
                    <div className="py-4">
                      {renderRatingInput(index, surveyResponses[index])}
                      <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
                        <span>Poor</span>
                        <span>Excellent</span>
                      </div>
                    </div>
                  )}
                  {question.type === "multiple-choice" && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <label
                          key={optIndex}
                          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={option}
                            checked={surveyResponses[index] === option}
                            onChange={(e) => updateResponse(index, e.target.value)}
                            className="w-4 h-4 text-lfc-red focus:ring-lfc-gold"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          {currentStep === "survey" && (
            <button
              onClick={handleSkipSurvey}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Skip
            </button>
          )}
          <button
            onClick={handleContinue}
            className="px-6 py-2 bg-lfc-red text-white rounded-lg hover:bg-lfc-red/90 transition-colors font-medium"
          >
            {currentStep === "completion"
              ? hasSurvey
                ? "Continue"
                : "Next Module"
              : "Submit & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
