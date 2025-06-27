
import { useState, useEffect, useCallback } from 'react';

interface UseInstantModuleProps {
  moduleId: string;
  preloadData?: () => Promise<any>;
  minLoadTime?: number;
}

export const useInstantModule = ({ 
  moduleId, 
  preloadData, 
  minLoadTime = 300 
}: UseInstantModuleProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState<string | null>(null);

  // Cache for module data
  const cacheKey = `module_${moduleId}`;
  
  const loadModule = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check cache first
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setData(JSON.parse(cached));
        // Still load fresh data in background
        if (preloadData) {
          preloadData().then(freshData => {
            setData(freshData);
            sessionStorage.setItem(cacheKey, JSON.stringify(freshData));
          });
        }
        setTimeout(() => setIsLoading(false), 100);
        return;
      }

      // Load fresh data
      const startTime = Date.now();
      const result = preloadData ? await preloadData() : null;
      
      // Ensure minimum load time for smooth UX
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadTime - elapsed);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      setData(result);
      if (result) {
        sessionStorage.setItem(cacheKey, JSON.stringify(result));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load module');
    } finally {
      setIsLoading(false);
    }
  }, [moduleId, preloadData, minLoadTime, cacheKey]);

  useEffect(() => {
    loadModule();
  }, [loadModule]);

  const refresh = useCallback(() => {
    sessionStorage.removeItem(cacheKey);
    loadModule();
  }, [cacheKey, loadModule]);

  return { isLoading, data, error, refresh };
};
