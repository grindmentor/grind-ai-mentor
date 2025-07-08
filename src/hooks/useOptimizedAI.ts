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

  const callAI = useCallback(async (prompt: string, additionalData?: any) => {
    // Check cache first
    const key = cacheKey ? `${cacheKey}-${prompt}` : prompt;
    const cached = cacheRef.current.get(key);
    if (cached && !cached.error) {
      setResponse(cached.content);
      return cached.content;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: aiError } = await supabase.functions.invoke(functionName, {
        body: { 
          prompt,
          ...additionalData
        }
      });

      if (aiError) throw aiError;

      const result = data.response || data.content || data;
      
      // Cache successful response
      cacheRef.current.set(key, { content: result });
      
      setResponse(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'AI request failed';
      setError(errorMessage);
      
      // Cache error to avoid repeated failures
      cacheRef.current.set(key, { content: '', error: errorMessage });
      
      throw err;
    } finally {
      setIsLoading(false);
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

  return {
    isLoading,
    response,
    error,
    callAI,
    debouncedCallAI,
    clearCache
  };
};