import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdvancedCaching } from './useAdvancedCaching';

interface DataLoaderState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// Singleton to prevent duplicate API calls across components
class RequestDeduplicator {
  private static instance: RequestDeduplicator;
  private pendingRequests = new Map<string, Promise<any>>();

  static getInstance(): RequestDeduplicator {
    if (!RequestDeduplicator.instance) {
      RequestDeduplicator.instance = new RequestDeduplicator();
    }
    return RequestDeduplicator.instance;
  }

  async request<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // If request is already pending, return the existing promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Create new request and cache the promise
    const promise = fetcher().finally(() => {
      // Remove from pending requests when complete
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }
}

export const useOptimizedDataLoader = <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    enabled?: boolean;
    cacheTime?: number;
    staleTime?: number;
  } = {}
): DataLoaderState<T> => {
  const { enabled = true, cacheTime = 5 * 60 * 1000, staleTime = 1 * 60 * 1000 } = options;
  const { cache, setWithCleanup } = useAdvancedCaching<T>();
  const deduplicator = RequestDeduplicator.getInstance();
  const [state, setState] = useState<DataLoaderState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const lastFetchRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const loadData = async () => {
      // Check cache first
      const cachedData = cache.get(key);
      const now = Date.now();

      // If we have fresh cached data, use it
      if (cachedData && (now - lastFetchRef.current) < staleTime) {
        setState({ data: cachedData, loading: false, error: null });
        return;
      }

      // If we have stale cached data, show it while fetching fresh data
      if (cachedData) {
        setState(prev => ({ ...prev, data: cachedData, loading: true }));
      } else {
        setState(prev => ({ ...prev, loading: true, error: null }));
      }

      try {
        // Use deduplicator to prevent duplicate requests
        const data = await deduplicator.request(key, fetcher);
        
        // Cache the result
        setWithCleanup(key, data, cacheTime);
        lastFetchRef.current = now;
        
        setState({ data, loading: false, error: null });
      } catch (error) {
        console.error(`Failed to fetch data for ${key}:`, error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: error as Error
        }));
      }
    };

    loadData();
  }, [key, enabled, fetcher, cache, setWithCleanup, cacheTime, staleTime, deduplicator]);

  return state;
};

// Specialized hooks for common data patterns
export const useUserPreferences = (userId: string | undefined) => {
  return useOptimizedDataLoader(
    `user_preferences_${userId}`,
    async () => {
      if (!userId) throw new Error('User ID required');
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('favorite_modules')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data?.favorite_modules || [];
    },
    { 
      enabled: !!userId,
      cacheTime: 10 * 60 * 1000, // 10 minutes
      staleTime: 2 * 60 * 1000   // 2 minutes
    }
  );
};

export const useUserGoals = (userId: string | undefined) => {
  return useOptimizedDataLoader(
    `user_goals_${userId}`,
    async () => {
      if (!userId) throw new Error('User ID required');
      
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    { 
      enabled: !!userId,
      cacheTime: 15 * 60 * 1000, // 15 minutes
      staleTime: 5 * 60 * 1000   // 5 minutes
    }
  );
};

export const useUserAchievements = (userId: string | undefined) => {
  return useOptimizedDataLoader(
    `user_achievements_${userId}`,
    async () => {
      if (!userId) throw new Error('User ID required');
      
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    { 
      enabled: !!userId,
      cacheTime: 20 * 60 * 1000, // 20 minutes
      staleTime: 10 * 60 * 1000  // 10 minutes
    }
  );
};