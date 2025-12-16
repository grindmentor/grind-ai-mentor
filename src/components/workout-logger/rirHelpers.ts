// RIR conversion helper - converts RPE to RIR equivalent
export const convertRPEtoRIR = (rpe: number): number => {
  // RPE 6-10 scale to RIR 4-0 scale
  // RPE 6 = RIR 4, RPE 7 = RIR 3, RPE 8 = RIR 2, RPE 9 = RIR 1, RPE 10 = RIR 0
  if (rpe >= 10) return 0;
  if (rpe >= 9) return 1;
  if (rpe >= 8) return 2;
  if (rpe >= 7) return 3;
  if (rpe >= 6) return 4;
  return 5; // For RPE < 6, assume 5+ RIR
};

export const getRIRFromRPE = (rpe: number | null): number => {
  if (!rpe) return 3; // Default to RIR 3
  return convertRPEtoRIR(rpe);
};

export const getRIRLabel = (rir: number): string => {
  switch (rir) {
    case 0: return 'Failure (0 RIR)';
    case 1: return 'Very Hard (1 RIR)';
    case 2: return 'Hard (2 RIR)';
    case 3: return 'Moderate (3 RIR)';
    case 4: return 'Easy (4 RIR)';
    default: return 'Very Easy (5+ RIR)';
  }
};

export const getRIRColor = (rir: number): string => {
  switch (rir) {
    case 0: return 'text-red-400 bg-red-500/20';
    case 1: return 'text-orange-400 bg-orange-500/20';
    case 2: return 'text-yellow-400 bg-yellow-500/20';
    case 3: return 'text-blue-400 bg-blue-500/20';
    case 4: return 'text-green-400 bg-green-500/20';
    default: return 'text-gray-400 bg-gray-500/20';
  }
};

// Convert RIR back to RPE for storage
export const convertRIRtoRPE = (rir: number): number => {
  if (rir === 0) return 10;
  if (rir === 1) return 9;
  if (rir === 2) return 8;
  if (rir === 3) return 7;
  if (rir === 4) return 6;
  return 5;
};
