import { useCallback, useMemo } from 'react';

// Performance-optimized utilities
export const useOptimizedCallbacks = () => {
  // Memoized handlers factory
  const createStableHandler = useCallback((handler: Function) => {
    return handler;
  }, []);

  // Optimized debounce that doesn't recreate functions
  const useStableDebounce = useCallback((fn: Function, delay: number) => {
    return useMemo(() => {
      let timeoutId: NodeJS.Timeout;
      return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
      };
    }, [fn, delay]);
  }, []);

  return {
    createStableHandler,
    useStableDebounce
  };
};