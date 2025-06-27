
import { useState, useEffect, useCallback } from 'react';

interface UseInstantModuleProps {
  moduleId: string;
  preloadData?: () => Promise<any>;
  minLoadTime?: number;
}

export const useInstantModule = ({ 
  moduleId, 
  preloadData, 
  minLoadTime = 100 // Reduced from 300ms for faster loading
}: UseInstantModuleProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState<string | null>(null);

  // Enhanced cache with memory storage
  const cacheKey = `module_${moduleId}`;
  const memoryCacheKey = `memory_${cacheKey}`;
  
  const loadModule = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check memory cache first (fastest)
      const memoryCache = (window as any)[memoryCacheKey];
      if (memoryCache) {
        setData(memoryCache);
        setIsLoading(false);
        return;
      }

      // Check sessionStorage cache
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const cachedData = JSON.parse(cached);
        setData(cachedData);
        // Store in memory for next time
        (window as any)[memoryCacheKey] = cachedData;
        
        // Load fresh data in background without showing loading state
        if (preloadData) {
          preloadData().then(freshData => {
            if (JSON.stringify(freshData) !== JSON.stringify(cachedData)) {
              setData(freshData);
              sessionStorage.setItem(cacheKey, JSON.stringify(freshData));
              (window as any)[memoryCacheKey] = freshData;
            }
          }).catch(() => {}); // Fail silently for background updates
        }
        
        // Minimal delay for smooth UX
        setTimeout(() => setIsLoading(false), 50);
        return;
      }

      // Load fresh data
      const startTime = Date.now();
      const result = preloadData ? await preloadData() : null;
      
      // Ensure minimum load time for smooth UX (reduced)
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadTime - elapsed);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      setData(result);
      if (result) {
        sessionStorage.setItem(cacheKey, JSON.stringify(result));
        (window as any)[memoryCacheKey] = result;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load module');
    } finally {
      setIsLoading(false);
    }
  }, [moduleId, preloadData, minLoadTime, cacheKey, memoryCacheKey]);

  useEffect(() => {
    loadModule();
  }, [loadModule]);

  const refresh = useCallback(() => {
    sessionStorage.removeItem(cacheKey);
    delete (window as any)[memoryCacheKey];
    loadModule();
  }, [cacheKey, memoryCacheKey, loadModule]);

  const clearCache = useCallback(() => {
    sessionStorage.removeItem(cacheKey);
    delete (window as any)[memoryCacheKey];
  }, [cacheKey, memoryCacheKey]);

  return { isLoading, data, error, refresh, clearCache };
};
