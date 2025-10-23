// Utility to check if user profile is complete
export interface ProfileCompletionCheck {
  isComplete: boolean;
  completionPercent: number;
  missingFields: string[];
}

export const checkProfileCompletion = (user: any): ProfileCompletionCheck => {
  if (!user) {
    return {
      isComplete: false,
      completionPercent: 0,
      missingFields: ['All fields'],
    };
  }

  // Profile completion criteria: 5 fields total
  // name (already there), email (already there), dateOfBirth, phoneNumber, maritalStatus
  // So initially it's 2/5 = 40%
  const totalFields = 5;
  const alreadyFilledFields = 2; // name and email are always there from signup
  
  const additionalFields = ['dateOfBirth', 'phoneNumber', 'maritalStatus'];
  const missingFields: string[] = [];

  additionalFields.forEach(field => {
    if (!user[field] || user[field] === '') {
      missingFields.push(field);
    }
  });

  const filledAdditionalFields = additionalFields.length - missingFields.length;
  const totalFilledFields = alreadyFilledFields + filledAdditionalFields;
  const completionPercent = Math.round((totalFilledFields / totalFields) * 100);

  return {
    isComplete: completionPercent === 100,
    completionPercent,
    missingFields,
  };
};
