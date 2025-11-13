import { useState, useCallback, useRef } from 'react';
import { debounce } from '@/utils/performance';

// Performance-optimized utilities - now using unified performance utils
export const useOptimizedCallbacks = () => {
  // Memoized handlers factory
  const createStableHandler = useCallback((handler: Function) => {
    return handler;
  }, []);

  // Return utilities
  return {
    createStableHandler,
    debounce
  };
};