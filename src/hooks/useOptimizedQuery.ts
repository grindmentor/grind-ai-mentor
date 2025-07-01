
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Query cache for session-based caching
const queryCache = new Map<string, any>();
const CACHE_TTL = 180000; // 3 minutes

interface OptimizedQueryOptions {
  fields?: string[];
  limit?: number;
  offset?: number;
  orderBy?: { field: string; ascending?: boolean };
  filters?: Record<string, any>;
  cacheKey?: string;
  enabled?: boolean;
}

export const useOptimizedQuery = <T>(
  table: string,
  options: OptimizedQueryOptions = {}
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    fields = ['*'],
    limit = 10,
    offset = 0,
    orderBy,
    filters = {},
    cacheKey,
    enabled = true
  } = options;

  const generateCacheKey = useCallback(() => {
    if (cacheKey) return cacheKey;
    return `${table}_${JSON.stringify({ fields, limit, offset, orderBy, filters })}`;
  }, [table, fields, limit, offset, orderBy, filters, cacheKey]);

  const executeQuery = useCallback(async (loadMore: boolean = false) => {
    if (!enabled) return;

    const currentOffset = loadMore ? data.length : offset;
    const key = `${generateCacheKey()}_${currentOffset}`;
    
    // Check cache first
    const cached = queryCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      if (loadMore) {
        setData(prev => [...prev, ...cached.data]);
      } else {
        setData(cached.data);
      }
      setHasMore(cached.data.length === limit);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setLoading(true);
    setError(null);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Build optimized query - only select needed fields
      let query = supabase
        .from(table)
        .select(fields.join(', '))
        .range(currentOffset, currentOffset + limit - 1);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.field, { ascending: orderBy.ascending ?? true });
      }

      const { data: results, error: queryError } = await query;

      if (abortController.signal.aborted) return;

      if (queryError) throw queryError;

      const resultData = (results || []) as T[];
      
      // Cache the results
      queryCache.set(key, {
        data: resultData,
        timestamp: Date.now()
      });

      if (loadMore) {
        setData(prev => [...prev, ...resultData]);
      } else {
        setData(resultData);
      }
      
      setHasMore(resultData.length === limit);
    } catch (err) {
      if (abortController.signal.aborted) return;
      
      console.error('Query error:', err);
      setError(err instanceof Error ? err.message : 'Query failed');
      if (!loadMore) {
        setData([]);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, [enabled, table, fields, limit, offset, orderBy, filters, generateCacheKey, data.length]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      executeQuery(true);
    }
  }, [executeQuery, loading, hasMore]);

  const refresh = useCallback(() => {
    // Clear cache for this query
    const key = generateCacheKey();
    for (const cacheKey of queryCache.keys()) {
      if (cacheKey.startsWith(key)) {
        queryCache.delete(cacheKey);
      }
    }
    executeQuery(false);
  }, [executeQuery, generateCacheKey]);

  useEffect(() => {
    executeQuery(false);
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [executeQuery]);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
};
