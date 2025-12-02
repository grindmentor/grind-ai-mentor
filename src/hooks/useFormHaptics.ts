import { useCallback } from 'react';
import { triggerHapticFeedback } from './useOptimisticUpdate';

/**
 * Lightweight hook for form-related haptic feedback
 * Does not slow down the app - uses requestIdleCallback when available
 */
export const useFormHaptics = () => {
  // Trigger on form submission start
  const onSubmitStart = useCallback(() => {
    triggerHapticFeedback('light');
  }, []);

  // Trigger on successful submission
  const onSubmitSuccess = useCallback(() => {
    triggerHapticFeedback('success');
  }, []);

  // Trigger on failed submission
  const onSubmitError = useCallback(() => {
    triggerHapticFeedback('error');
  }, []);

  // Trigger on input focus (very subtle)
  const onInputFocus = useCallback(() => {
    // Only trigger on mobile and with minimal vibration
    if ('vibrate' in navigator && window.matchMedia('(pointer: coarse)').matches) {
      try { navigator.vibrate(5); } catch {}
    }
  }, []);

  // Trigger on selection change
  const onSelectionChange = useCallback(() => {
    triggerHapticFeedback('light');
  }, []);

  // Trigger on toggle/switch
  const onToggle = useCallback(() => {
    triggerHapticFeedback('light');
  }, []);

  return {
    onSubmitStart,
    onSubmitSuccess,
    onSubmitError,
    onInputFocus,
    onSelectionChange,
    onToggle,
  };
};

export default useFormHaptics;
