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
  minLoadTime = 100 // Reduced for instant feel
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
        
        // Background refresh for fresh data
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

      // Load fresh data with minimal delay
      setIsLoading(true);
      loadingStates.set(moduleId, true);
      
      const startTime = Date.now();
      const result = preloadData ? await preloadData() : { loaded: true };
      
      // Minimal load time for smooth UX
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadTime - elapsed);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      // Cache in memory for instant future access
      moduleCache.set(moduleId, result);
      setData(result);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load module');
    } finally {
      setIsLoading(false);
      loadingStates.delete(moduleId);
    }
  }, [moduleId, preloadData, minLoadTime]);

  useEffect(() => {
    loadModule();
  }, [loadModule]);

  const refresh = useCallback(() => {
    moduleCache.delete(moduleId);
    loadModule();
  }, [moduleId, loadModule]);

  // Clear cache on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      // Keep cache for a short time for potential re-access
      setTimeout(() => {
        if (!loadingStates.get(moduleId)) {
          moduleCache.delete(moduleId);
        }
      }, 30000); // 30 seconds
    };
  }, [moduleId]);

  return { isLoading, data, error, refresh };
};
