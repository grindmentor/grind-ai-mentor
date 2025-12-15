import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Central hook for module navigation with automatic returnTo state.
 * Ensures back navigation always returns to the correct source page.
 */
export const useModuleNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Navigate to a module with automatic returnTo state based on current location.
   * The returnTo value is set to the current pathname.
   */
  const navigateToModule = useCallback((modulePath: string) => {
    const currentPath = location.pathname;
    navigate(modulePath, { state: { returnTo: currentPath } });
  }, [navigate, location.pathname]);

  /**
   * Navigate to any path with returnTo state.
   */
  const navigateWithReturn = useCallback((path: string, returnTo?: string) => {
    const returnPath = returnTo || location.pathname;
    navigate(path, { state: { returnTo: returnPath } });
  }, [navigate, location.pathname]);

  /**
   * Get the returnTo path from current location state, or fallback.
   */
  const getReturnPath = useCallback((fallback: string = '/modules'): string => {
    const state = location.state as { returnTo?: string } | null;
    return state?.returnTo || fallback;
  }, [location.state]);

  /**
   * Navigate back using returnTo state if available, otherwise use history.
   */
  const navigateBack = useCallback((fallback: string = '/modules') => {
    const returnPath = getReturnPath(fallback);
    navigate(returnPath);
  }, [navigate, getReturnPath]);

  return {
    navigateToModule,
    navigateWithReturn,
    navigateBack,
    getReturnPath
  };
};

export default useModuleNavigation;
