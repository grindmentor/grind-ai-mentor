
import { useState, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';

export const useOptimizedSearch = <T>(
  searchFunction: (query: string) => Promise<T[]>,
  delay: number = 500
) => {
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized debounced search function
  const debouncedSearch = useMemo(
    () => debounce(async (query: string) => {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const searchResults = await searchFunction(query);
        setResults(searchResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, delay),
    [searchFunction, delay]
  );

  const search = useCallback((query: string) => {
    debouncedSearch(query);
  }, [debouncedSearch]);

  const clearSearch = useCallback(() => {
    debouncedSearch.cancel();
    setResults([]);
    setLoading(false);
    setError(null);
  }, [debouncedSearch]);

  return { results, loading, error, search, clearSearch };
};
