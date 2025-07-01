
import { useState, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expires: number;
}

export const useSessionCache = <T>(cacheKey: string, ttl: number = 300000) => { // 5 minutes default
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());

  const get = useCallback((key: string): T | null => {
    const fullKey = `${cacheKey}_${key}`;
    const entry = cacheRef.current.get(fullKey);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      cacheRef.current.delete(fullKey);
      return null;
    }
    
    return entry.data;
  }, [cacheKey]);

  const set = useCallback((key: string, data: T) => {
    const fullKey = `${cacheKey}_${key}`;
    cacheRef.current.set(fullKey, {
      data,
      timestamp: Date.now(),
      expires: Date.now() + ttl
    });
  }, [cacheKey, ttl]);

  const clear = useCallback((key?: string) => {
    if (key) {
      const fullKey = `${cacheKey}_${key}`;
      cacheRef.current.delete(fullKey);
    } else {
      cacheRef.current.clear();
    }
  }, [cacheKey]);

  const has = useCallback((key: string): boolean => {
    const fullKey = `${cacheKey}_${key}`;
    const entry = cacheRef.current.get(fullKey);
    return entry ? Date.now() <= entry.expires : false;
  }, [cacheKey]);

  return { get, set, clear, has };
};
