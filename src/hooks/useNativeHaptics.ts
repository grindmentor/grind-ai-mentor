import { useCallback } from 'react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

export const useNativeHaptics = () => {
  const trigger = useCallback(async (type: HapticType = 'light') => {
    try {
      switch (type) {
        case 'light':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'medium':
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case 'heavy':
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case 'success':
          await Haptics.notification({ type: NotificationType.Success });
          break;
        case 'warning':
          await Haptics.notification({ type: NotificationType.Warning });
          break;
        case 'error':
          await Haptics.notification({ type: NotificationType.Error });
          break;
        case 'selection':
          await Haptics.selectionStart();
          await Haptics.selectionChanged();
          await Haptics.selectionEnd();
          break;
        default:
          await Haptics.impact({ style: ImpactStyle.Light });
      }
    } catch {
      // Fallback to web vibration API
      if ('vibrate' in navigator) {
        const patterns: Record<HapticType, number | number[]> = {
          light: 10,
          medium: 25,
          heavy: 40,
          success: [10, 30, 10],
          warning: [20, 20, 20],
          error: [40, 20, 40],
          selection: 5
        };
        navigator.vibrate(patterns[type]);
      }
    }
  }, []);

  const selectionChanged = useCallback(async () => {
    try {
      await Haptics.selectionChanged();
    } catch {
      if ('vibrate' in navigator) navigator.vibrate(5);
    }
  }, []);

  return { trigger, selectionChanged };
};

export default useNativeHaptics;
