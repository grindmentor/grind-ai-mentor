
import { supabase } from '@/integrations/supabase/client';

// Simple cache implementation
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly ttl = 30 * 60 * 1000; // 30 minutes

  set(key: string, value: any): void {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now()
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

const cache = new SimpleCache();

export const getOptimizedAIResponse = async (prompt: string, options: {
  maxTokens?: number;
  temperature?: number;
  useCache?: boolean;
  priority?: 'low' | 'normal' | 'high';
} = {}) => {
  const {
    maxTokens = 150,
    temperature = 0.7,
    useCache = true,
    priority = 'normal'
  } = options;

  const cacheKey = `ai:${prompt}:${maxTokens}:${temperature}`.toLowerCase();
  
  // Check cache first
  if (useCache) {
    const cached = cache.get(cacheKey);
    if (cached) return cached;
  }

  try {
    console.log('🔍 AI SERVICE: Starting getOptimizedAIResponse');
    console.log('🔍 AI SERVICE: Prompt:', prompt.substring(0, 100) + '...');
    console.log('🔍 AI SERVICE: Options:', options);
    
    const { data, error } = await supabase.functions.invoke('fitness-ai', {
      body: {
        prompt,
        maxTokens,
        temperature,
        type: 'coaching'
      }
    });

    console.log('🔍 AI SERVICE: Supabase response:', { data, error });

    if (error) {
      console.error('Optimized AI Error:', error);
      return "I'm having trouble processing your request right now. Please try again later.";
    }

    const response = data?.response || "I'm having trouble processing your request right now. Please try again later.";
    
    // Cache successful responses
    if (useCache && response && !response.includes('having trouble')) {
      cache.set(cacheKey, response);
    }

    return response;
  } catch (error) {
    console.error("Optimized AI Error:", error);
    return "I'm having trouble processing your request right now. Please try again later.";
  }
};

// Export optimized service with all methods
export const optimizedAiService = {
  getResponse: getOptimizedAIResponse,
  getCoachingAdvice: getOptimizedAIResponse,
  cleanup: () => cache.clear()
};
