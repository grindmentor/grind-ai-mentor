
import { useState, useEffect, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessed: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  memoryUsage: number;
}

class AdvancedCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private defaultTTL: number;
  private stats: CacheStats = { hits: 0, misses: 0, size: 0, memoryUsage: 0 };

  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) { // 5 minutes default
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    
    // Remove expired entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      ttl: ttl || this.defaultTTL,
      accessed: now
    });

    this.updateStats();
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    const now = Date.now();

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    // Update access time for LRU
    entry.accessed = now;
    this.stats.hits++;
    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) this.updateStats();
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.updateStats();
  }

  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessed < oldestTime) {
        oldestTime = entry.accessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private updateStats(): void {
    this.stats.size = this.cache.size;
    this.stats.memoryUsage = this.estimateMemoryUsage();
  }

  private estimateMemoryUsage(): number {
    let size = 0;
    for (const [key, entry] of this.cache.entries()) {
      size += key.length * 2; // String characters are 2 bytes
      size += JSON.stringify(entry.data).length * 2;
      size += 32; // Overhead for entry object
    }
    return size;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    return total > 0 ? this.stats.hits / total : 0;
  }
}

export const useAdvancedCaching = <T>() => {
  const cacheRef = useRef(new AdvancedCache<T>());
  const [stats, setStats] = useState<CacheStats>({ hits: 0, misses: 0, size: 0, memoryUsage: 0 });
  const [preloadQueue, setPreloadQueue] = useState<string[]>([]);
  const [isPreloading, setIsPreloading] = useState(false);

  // Update stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(cacheRef.current.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Preload common routes and data
  const preloadData = async (key: string, fetcher: () => Promise<T>, priority = 1) => {
    if (cacheRef.current.has(key)) return;

    setPreloadQueue(prev => [...prev, key].sort((a, b) => priority - priority));
  };

  // Process preload queue
  useEffect(() => {
    if (isPreloading || preloadQueue.length === 0) return;

    const processQueue = async () => {
      setIsPreloading(true);
      
      try {
        // Process one item at a time to avoid overwhelming the system
        const key = preloadQueue[0];
        setPreloadQueue(prev => prev.slice(1));
        
        // Simulate fetching (would be replaced with actual fetch logic)
        // This is where you'd call your actual data fetcher
        console.log(`Preloading data for key: ${key}`);
        
      } catch (error) {
        console.error('Preload error:', error);
      } finally {
        setIsPreloading(false);
      }
    };

    const timer = setTimeout(processQueue, 100); // Small delay to batch operations
    return () => clearTimeout(timer);
  }, [preloadQueue, isPreloading]);

  // Intelligent prefetching based on user behavior
  const prefetchBasedOnBehavior = (userPath: string) => {
    const commonTransitions: Record<string, string[]> = {
      '/': ['/app', '/signin', '/pricing'],
      '/signin': ['/app'],
      '/app': ['/settings', '/support'],
      '/settings': ['/account', '/app'],
    };

    const nextLikelyPaths = commonTransitions[userPath] || [];
    nextLikelyPaths.forEach(path => {
      preloadData(path, async () => ({} as T), 2); // Lower priority
    });
  };

  // Cache with automatic cleanup
  const setWithCleanup = (key: string, data: T, ttl?: number) => {
    cacheRef.current.set(key, data, ttl);
    
    // Cleanup expired entries every 100 operations
    if (stats.size % 100 === 0) {
      cleanupExpired();
    }
  };

  const cleanupExpired = () => {
    const keys = Array.from((cacheRef.current as any).cache.keys());
    keys.forEach(key => {
      if (!cacheRef.current.has(key)) {
        // This will remove expired entries
      }
    });
  };

  return {
    cache: cacheRef.current,
    stats,
    preloadData,
    prefetchBasedOnBehavior,
    setWithCleanup,
    isPreloading,
    hitRate: cacheRef.current.getHitRate()
  };
};
