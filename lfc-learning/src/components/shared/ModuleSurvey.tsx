import { useState } from 'react';
import { FaTimes, FaStar } from 'react-icons/fa';

interface ModuleSurveyProps {
  moduleTitle: string;
  courseId: string;
  moduleId: string;
  questions?: SurveyQuestion[];
  onClose: () => void;
  onSubmit: (surveyData: Record<string, any>) => void;
}

export interface SurveyQuestion {
  question: string;
  type: "text" | "rating" | "multiple-choice";
  options?: string[];
}

export default function ModuleSurvey({ moduleTitle, questions, onClose, onSubmit }: ModuleSurveyProps) {
  const [surveyData, setSurveyData] = useState<Record<string, any>>({
    difficulty: 3,
    clarity: 3,
    usefulness: 3,
    feedback: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const useCustomQuestions = (questions?.length || 0) > 0;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(surveyData);
      onClose();
    } catch (error) {
      console.error('Error submitting survey:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const RatingScale = ({ 
    label, 
    value, 
    onChange, 
    lowLabel, 
    highLabel 
  }: { 
    label: string; 
    value: number; 
    onChange: (val: number) => void;
    lowLabel: string;
    highLabel: string;
  }) => (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">{lowLabel}</span>
        <span className="text-xs text-gray-500">{highLabel}</span>
      </div>
      <div className="flex justify-between">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`w-12 h-12 rounded-full border-2 transition-all ${
              value === rating
                ? 'border-lfc-red bg-lfc-red text-white scale-110'
                : 'border-gray-300 hover:border-lfc-red hover:scale-105'
            }`}
          >
            {rating}
          </button>
        ))}
      </div>
    </div>
  );

  const renderCustomQuestions = () => (
    <div className="space-y-6">
      {questions?.map((question, index) => (
        <div key={index} className="space-y-3">
          <label className="block text-sm font-medium text-gray-900">
            {question.question}
          </label>
          {question.type === "text" && (
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-900 focus:ring-2 focus:ring-lfc-gold focus:border-lfc-gold"
              rows={4}
              placeholder="Your answer..."
              value={surveyData[index] || ""}
              onChange={(e) => setSurveyData(prev => ({ ...prev, [index]: e.target.value }))}
            />
          )}
          {question.type === "rating" && (
            <div className="py-2">
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setSurveyData(prev => ({ ...prev, [index]: rating }))}
                    className={`p-2 transition-colors ${
                      surveyData[index] === rating
                        ? "text-lfc-gold"
                        : "text-gray-300 hover:text-lfc-gold"
                    }`}
                  >
                    <FaStar size={28} />
                  </button>
                ))}
              </div>
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
                    checked={surveyData[index] === option}
                    onChange={(e) => setSurveyData(prev => ({ ...prev, [index]: e.target.value }))}
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
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-55 p-4">
      <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Module Feedback</h2>
            <p className="text-sm text-gray-600 mt-1">{moduleTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6">
            Help us improve! Your feedback helps us create better learning experiences.
          </p>

          {useCustomQuestions ? (
            renderCustomQuestions()
          ) : (
            <>
              <RatingScale
                label="How difficult was this module?"
                value={surveyData.difficulty}
                onChange={(val) => setSurveyData(prev => ({ ...prev, difficulty: val }))}
                lowLabel="Too Easy"
                highLabel="Too Hard"
              />

              <RatingScale
                label="How clear was the content?"
                value={surveyData.clarity}
                onChange={(val) => setSurveyData(prev => ({ ...prev, clarity: val }))}
                lowLabel="Confusing"
                highLabel="Very Clear"
              />

              <RatingScale
                label="How useful was this module?"
                value={surveyData.usefulness}
                onChange={(val) => setSurveyData(prev => ({ ...prev, usefulness: val }))}
                lowLabel="Not Useful"
                highLabel="Very Useful"
              />

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Additional Comments (Optional)
                </label>
                <textarea
                  value={surveyData.feedback}
                  onChange={(e) => setSurveyData(prev => ({ ...prev, feedback: e.target.value }))}
                  placeholder="Share your thoughts about this module..."
                  className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-lfc-red"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 bg-lfc-red text-white rounded-lg hover:bg-lfc-gold-dark disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </div>
    </div>
  );
}
