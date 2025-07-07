import { useState, useCallback, useRef } from 'react';
import { debounce } from '@/utils/performanceOptimizations';
import { supabase } from '@/integrations/supabase/client';

interface AIResponse {
  content: string;
  error?: string;
}

interface UseOptimizedAIProps {
  functionName: string;
  cacheKey?: string;
  debounceMs?: number;
}

export const useOptimizedAI = ({ 
  functionName, 
  cacheKey,
  debounceMs = 500 
}: UseOptimizedAIProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const cacheRef = useRef<Map<string, AIResponse>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  const callAI = useCallback(async (prompt: string, additionalData?: any) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Check cache first
    const key = cacheKey ? `${cacheKey}-${prompt}` : prompt;
    const cached = cacheRef.current.get(key);
    if (cached && !cached.error) {
      setResponse(cached.content);
      return cached.content;
    }

    setIsLoading(true);
    setError(null);
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      const { data, error: aiError } = await supabase.functions.invoke(functionName, {
        body: { 
          prompt,
          ...additionalData
        },
        signal: abortControllerRef.current.signal
      });

      if (aiError) throw aiError;

      const result = data.response || data.content || data;
      
      // Cache successful response
      cacheRef.current.set(key, { content: result });
      
      setResponse(result);
      return result;
    } catch (err) {
      if (err.name === 'AbortError') return;
      
      const errorMessage = err instanceof Error ? err.message : 'AI request failed';
      setError(errorMessage);
      
      // Cache error to avoid repeated failures
      cacheRef.current.set(key, { content: '', error: errorMessage });
      
      throw err;
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [functionName, cacheKey]);

  // Debounced version for search/input scenarios
  const debouncedCallAI = useCallback(
    debounce(callAI, debounceMs),
    [callAI, debounceMs]
  );

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    isLoading,
    response,
    error,
    callAI,
    debouncedCallAI,
    clearCache,
    cancelRequest
  };
};