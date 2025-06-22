
// Unit conversion utilities for the fitness app

export const convertWeight = (value: number, from: 'kg' | 'lbs', to: 'kg' | 'lbs'): number => {
  if (from === to) return value;
  
  if (from === 'kg' && to === 'lbs') {
    return value * 2.20462;
  } else if (from === 'lbs' && to === 'kg') {
    return value / 2.20462;
  }
  
  return value;
};

export const convertHeight = (value: number, from: 'cm' | 'in' | 'ft-in', to: 'cm' | 'in' | 'ft-in'): number => {
  if (from === to) return value;
  
  // Convert everything to cm first
  let cmValue = value;
  if (from === 'in') {
    cmValue = value * 2.54;
  } else if (from === 'ft-in') {
    // Assuming value is in format like 5.5 (5 feet 6 inches = 5.5)
    const feet = Math.floor(value);
    const inches = (value - feet) * 12;
    cmValue = (feet * 12 + inches) * 2.54;
  }
  
  // Convert from cm to target
  if (to === 'cm') {
    return cmValue;
  } else if (to === 'in') {
    return cmValue / 2.54;
  } else if (to === 'ft-in') {
    const totalInches = cmValue / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return feet + (inches / 12); // Return as decimal
  }
  
  return value;
};

export const formatWeight = (value: number, unit: 'kg' | 'lbs'): string => {
  return `${value.toFixed(1)} ${unit}`;
};

export const formatHeight = (value: number, unit: 'cm' | 'in' | 'ft-in'): string => {
  if (unit === 'ft-in') {
    const feet = Math.floor(value);
    const inches = Math.round((value - feet) * 12);
    return `${feet}'${inches}"`;
  }
  return `${Math.round(value)} ${unit}`;
};
