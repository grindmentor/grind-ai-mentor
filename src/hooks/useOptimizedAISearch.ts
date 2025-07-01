
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Lightweight response cache for session-based caching
const searchCache = new Map<string, any>();
const CACHE_TTL = 300000; // 5 minutes

export const useOptimizedAISearch = <T>(
  searchFunction: (query: string, options?: any) => Promise<T[]>,
  delay: number = 300,
  maxResults: number = 10
) => {
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getCacheKey = (query: string, currentPage: number) => 
    `${query.toLowerCase().trim()}_${currentPage}_${maxResults}`;

  const search = useCallback(async (query: string, loadMore: boolean = false) => {
    if (!query.trim()) {
      setResults([]);
      setPage(0);
      setHasMore(true);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const currentPage = loadMore ? page + 1 : 0;
    const cacheKey = getCacheKey(query, currentPage);

    // Check cache first
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      if (loadMore) {
        setResults(prev => [...prev, ...cached.data]);
        setPage(currentPage);
      } else {
        setResults(cached.data);
        setPage(0);
      }
      setHasMore(cached.data.length === maxResults);
      return;
    }

    // Debounce the search
    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const searchResults = await searchFunction(query, {
          offset: currentPage * maxResults,
          limit: maxResults + 1, // Get one extra to check if there are more
          signal: abortController.signal
        });

        if (abortController.signal.aborted) {
          return;
        }

        const hasMoreResults = searchResults.length > maxResults;
        const limitedResults = searchResults.slice(0, maxResults);

        // Cache the results
        searchCache.set(cacheKey, {
          data: limitedResults,
          timestamp: Date.now()
        });

        if (loadMore) {
          setResults(prev => [...prev, ...limitedResults]);
          setPage(currentPage);
        } else {
          setResults(limitedResults);
          setPage(0);
        }
        
        setHasMore(hasMoreResults);
      } catch (err) {
        if (abortController.signal.aborted) {
          return;
        }
        console.error('Search error:', err);
        setError(err instanceof Error ? err.message : 'Search failed');
        if (!loadMore) {
          setResults([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }, delay);
  }, [searchFunction, delay, maxResults, page]);

  const loadMore = useCallback((query: string) => {
    if (!loading && hasMore) {
      search(query, true);
    }
  }, [search, loading, hasMore]);

  const clearSearch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setResults([]);
    setLoading(false);
    setError(null);
    setPage(0);
    setHasMore(true);
  }, []);

  return { 
    results, 
    loading, 
    error, 
    hasMore, 
    search, 
    loadMore, 
    clearSearch,
    page
  };
};
