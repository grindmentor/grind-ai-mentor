import { useState, useEffect, useCallback } from 'react';

interface UseInstantModuleProps {
  moduleId: string;
  preloadData?: () => Promise<any>;
  minLoadTime?: number;
}

// Global memory cache for instant access
const moduleCache = new Map<string, any>();
const loadingStates = new Map<string, boolean>();

export const useInstantModule = ({ 
  moduleId, 
  preloadData, 
  minLoadTime = 0 // Removed artificial delay for instant performance
}: UseInstantModuleProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(() => moduleCache.get(moduleId) || null);
  const [error, setError] = useState<string | null>(null);

  const loadModule = useCallback(async () => {
    try {
      // Prevent duplicate loading
      if (loadingStates.get(moduleId)) return;
      
      setError(null);

      // Check memory cache first for instant access
      const cachedData = moduleCache.get(moduleId);
      if (cachedData) {
        setData(cachedData);
        setIsLoading(false);
        
        // Background refresh for fresh data - no artificial delay
        if (preloadData) {
          loadingStates.set(moduleId, true);
          preloadData().then(freshData => {
            moduleCache.set(moduleId, freshData);
            setData(freshData);
          }).finally(() => {
            loadingStates.delete(moduleId);
          });
        }
        return;
      }

      // Load fresh data instantly
      setIsLoading(true);
      loadingStates.set(moduleId, true);
      
      const result = preloadData ? await preloadData() : { loaded: true };

      // Cache in memory for instant future access
      moduleCache.set(moduleId, result);
      setData(result);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load module');
    } finally {
      setIsLoading(false);
      loadingStates.delete(moduleId);
    }
  }, [moduleId, preloadData]);

  useEffect(() => {
    loadModule();
  }, [loadModule]);

  const refresh = useCallback(() => {
    moduleCache.delete(moduleId);
    loadModule();
  }, [moduleId, loadModule]);

  // Clear cache on unmount to prevent memory leaks - reduced timeout
  useEffect(() => {
    return () => {
      // Keep cache for a short time for potential re-access
      setTimeout(() => {
        if (!loadingStates.get(moduleId)) {
          moduleCache.delete(moduleId);
        }
      }, 5000); // Reduced from 30 seconds to 5 seconds
    };
  }, [moduleId]);

  return { isLoading, data, error, refresh };
};
