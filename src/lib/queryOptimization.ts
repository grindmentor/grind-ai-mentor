/**
 * Optimized Query Configuration
 * Provides stale-while-revalidate caching, request deduplication, and performance optimization
 */

import { QueryClient } from '@tanstack/react-query';

// Request deduplication map
const pendingRequests = new Map<string, Promise<any>>();

/**
 * Deduplicate concurrent requests with the same key
 */
export async function deduplicateRequest<T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> {
  // If request already in flight, return the same promise
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>;
  }

  const promise = requestFn().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}

/**
 * Create optimized QueryClient with aggressive caching
 */
export function createOptimizedQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale-while-revalidate: serve stale data immediately, refetch in background
        staleTime: 5 * 60 * 1000, // 5 min - data considered fresh
        gcTime: 30 * 60 * 1000, // 30 min - keep in cache
        
        // Reduce unnecessary refetches
        refetchOnWindowFocus: false,
        refetchOnMount: false, // Don't refetch if data exists
        refetchOnReconnect: 'always',
        
        // Retry configuration
        retry: 1,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        
        // Network mode
        networkMode: 'offlineFirst', // Use cache when offline
        
        // Don't throw on error - handle gracefully
        throwOnError: false,
      },
      mutations: {
        throwOnError: false,
        retry: 1,
      },
    },
  });
}

/**
 * Query key generators for consistent caching
 */
export const queryKeys = {
  // User data
  profile: (userId: string) => ['profile', userId] as const,
  preferences: (userId: string) => ['preferences', userId] as const,
  
  // Workout data
  workoutSessions: (userId: string) => ['workout-sessions', userId] as const,
  recentWorkouts: (userId: string, limit: number) => ['recent-workouts', userId, limit] as const,
  
  // Food data
  foodEntries: (userId: string, date?: string) => ['food-entries', userId, date] as const,
  recentMeals: (userId: string) => ['recent-meals', userId] as const,
  
  // Goals & achievements
  goals: (userId: string) => ['goals', userId] as const,
  achievements: (userId: string) => ['achievements', userId] as const,
  
  // Recovery
  recoveryData: (userId: string) => ['recovery-data', userId] as const,
  
  // Progress
  progressStats: (userId: string) => ['progress-stats', userId] as const,
  progressPhotos: (userId: string) => ['progress-photos', userId] as const,
  
  // Subscription
  subscription: (userId: string) => ['subscription', userId] as const,
};

/**
 * Prefetch configuration for routes
 */
export const prefetchConfig: Record<string, string[]> = {
  '/app': ['profile', 'preferences', 'goals', 'recentWorkouts', 'subscription'],
  '/progress-hub-dashboard': ['progressStats', 'workoutSessions', 'foodEntries', 'recoveryData'],
  '/smart-food-log': ['recentMeals', 'preferences'],
  '/workout-logger': ['workoutSessions', 'recentWorkouts'],
};

/**
 * Optimized fetch wrapper with caching headers
 */
export async function optimizedFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const cacheKey = `fetch:${url}`;
  
  return deduplicateRequest(cacheKey, async () => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        'Cache-Control': 'max-age=300, stale-while-revalidate=600',
      },
    });
    return response;
  });
}

/**
 * Session storage cache for instant hydration
 */
export const sessionCache = {
  get<T>(key: string): T | null {
    try {
      const cached = sessionStorage.getItem(key);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Check if cache is still valid (5 min)
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          return data as T;
        }
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  },
  
  set<T>(key: string, data: T): void {
    try {
      sessionStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch {
      // Storage full - clear old items
      try {
        sessionStorage.clear();
        sessionStorage.setItem(key, JSON.stringify({
          data,
          timestamp: Date.now(),
        }));
      } catch {
        // Ignore storage errors
      }
    }
  },
  
  invalidate(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // Ignore errors
    }
  },
};
