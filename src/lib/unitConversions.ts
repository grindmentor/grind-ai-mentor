
// Unit conversion utilities
export const convertCmToInches = (cm: number): number => {
  return cm / 2.54;
};

export const convertInchesToCm = (inches: number): number => {
  return inches * 2.54;
};

export const convertKgToLbs = (kg: number): number => {
  return kg * 2.20462;
};

export const convertLbsToKg = (lbs: number): number => {
  return lbs / 2.20462;
};

export const convertInchesToFeetAndInches = (totalInches: number): { feet: number; inches: number } => {
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
};

export const convertFeetAndInchesToInches = (feet: number, inches: number): number => {
  return feet * 12 + inches;
};

export const formatHeight = (heightInInches: number, unit: 'cm' | 'ft-in' | 'in'): string => {
  switch (unit) {
    case 'cm':
      return `${Math.round(convertInchesToCm(heightInInches))} cm`;
    case 'ft-in':
      const { feet, inches } = convertInchesToFeetAndInches(heightInInches);
      return `${feet}'${inches}"`;
    case 'in':
      return `${Math.round(heightInInches)} in`;
    default:
      return `${Math.round(heightInInches)} in`;
  }
};

export const formatWeight = (weightInLbs: number, unit: 'kg' | 'lbs'): string => {
  switch (unit) {
    case 'kg':
      return `${Math.round(convertLbsToKg(weightInLbs))} kg`;
    case 'lbs':
      return `${Math.round(weightInLbs)} lbs`;
    default:
      return `${Math.round(weightInLbs)} lbs`;
  }
};
