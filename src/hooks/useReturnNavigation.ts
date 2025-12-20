import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface ReturnNavigationOptions {
  fallbackPath?: string;
  onBack?: () => void;
}

/**
 * Centralized return navigation hook that respects returnTo state.
 * 
 * Priority (matches MobileHeader contract):
 * 1. onBack callback (if provided) - allows component override
 * 2. location.state.returnTo (if set) - explicit return destination
 * 3. Browser history (if available, length > 2)
 * 4. fallbackPath (default: '/modules')
 */
export const useReturnNavigation = (options: ReturnNavigationOptions = {}) => {
  const { fallbackPath = '/modules', onBack } = options;
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = useCallback(() => {
    // Priority 1: Use provided onBack callback
    if (onBack) {
      onBack();
      return;
    }

    // Priority 2: Check for returnTo in location state
    const state = location.state as { returnTo?: string } | null;
    if (state?.returnTo) {
      navigate(state.returnTo);
      return;
    }

    // Priority 3: Use browser history if available
    if (window.history.length > 2) {
      navigate(-1);
      return;
    }

    // Priority 4: Fall back to default path
    navigate(fallbackPath);
  }, [navigate, location.state, onBack, fallbackPath]);

  return { goBack };
};

export default useReturnNavigation;
