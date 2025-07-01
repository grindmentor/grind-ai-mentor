
import { useState, useCallback, useRef, useEffect } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  lastAccessed: number;
}

interface TabCacheOptions {
  maxAge?: number; // milliseconds
  maxEntries?: number;
}

export const useTabCache = <T>(options: TabCacheOptions = {}) => {
  const { maxAge = 300000, maxEntries = 10 } = options; // 5 minutes default
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());
  const [cacheStats, setCacheStats] = useState({ hits: 0, misses: 0 });

  // Clean up expired entries
  const cleanupExpired = useCallback(() => {
    const now = Date.now();
    const cache = cacheRef.current;
    const toDelete: string[] = [];

    cache.forEach((entry, key) => {
      if (now - entry.timestamp > maxAge) {
        toDelete.push(key);
      }
    });

    toDelete.forEach(key => cache.delete(key));

    // Limit cache size
    if (cache.size > maxEntries) {
      const entries = Array.from(cache.entries())
        .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
      
      const toRemove = entries.slice(0, cache.size - maxEntries);
      toRemove.forEach(([key]) => cache.delete(key));
    }
  }, [maxAge, maxEntries]);

  const get = useCallback((key: string): T | null => {
    cleanupExpired();
    const entry = cacheRef.current.get(key);
    
    if (entry) {
      entry.lastAccessed = Date.now();
      setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
      return entry.data;
    }
    
    setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
    return null;
  }, [cleanupExpired]);

  const set = useCallback((key: string, data: T) => {
    cleanupExpired();
    const now = Date.now();
    cacheRef.current.set(key, {
      data,
      timestamp: now,
      lastAccessed: now
    });
  }, [cleanupExpired]);

  const clear = useCallback(() => {
    cacheRef.current.clear();
    setCacheStats({ hits: 0, misses: 0 });
  }, []);

  const has = useCallback((key: string): boolean => {
    cleanupExpired();
    return cacheRef.current.has(key);
  }, [cleanupExpired]);

  // Cleanup on unmount
  useEffect(() => {
    const interval = setInterval(cleanupExpired, 60000); // Clean every minute
    return () => clearInterval(interval);
  }, [cleanupExpired]);

  return {
    get,
    set,
    clear,
    has,
    cacheStats,
    size: cacheRef.current.size
  };
};
