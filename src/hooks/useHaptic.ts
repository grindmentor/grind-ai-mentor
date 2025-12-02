import { useCallback } from 'react';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export const useHaptic = () => {
  const trigger = useCallback((type: HapticType = 'light') => {
    if (!('vibrate' in navigator)) return;
    
    const patterns: Record<HapticType, number | number[]> = {
      light: 10,
      medium: 30,
      heavy: 50,
      success: [10, 50, 10],
      warning: [30, 30, 30],
      error: [50, 30, 50]
    };
    
    try {
      navigator.vibrate(patterns[type]);
    } catch {
      // Silently fail if vibration not supported
    }
  }, []);

  return { trigger };
};
