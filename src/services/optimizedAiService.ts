
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
  type?: string;
} = {}) => {
    const {
      maxTokens = 100, // Reduced default for cost efficiency
      temperature = 0.7,
      useCache = true,
      priority = 'normal',
      type = 'coaching'
    } = options;

  // Optimized token limits based on query type and priority
  const optimizedMaxTokens = priority === 'low' ? Math.min(maxTokens, 80) : 
                            priority === 'high' ? Math.min(maxTokens, 1500) : 
                            Math.min(maxTokens, 600); // Further reduced default

  const cacheKey = `ai:${type}:${prompt.substring(0, 50)}:${optimizedMaxTokens}:${temperature}`.toLowerCase();
  
  // Check cache first
  if (useCache) {
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('🚀 AI SERVICE: Cache hit for', type);
      return cached;
    }
  }

  try {
    console.log('🔍 AI SERVICE: Starting optimized AI request');
    console.log('🔍 AI SERVICE: Type:', type, 'Priority:', priority, 'Tokens:', optimizedMaxTokens);
    
    const { data, error } = await supabase.functions.invoke('fitness-ai', {
      body: {
        prompt,
        userInput: prompt, // Ensure compatibility
        maxTokens: optimizedMaxTokens,
        temperature,
        type
      }
    });

    console.log('🔍 AI SERVICE: Response received:', { hasData: !!data, hasError: !!error });

    if (error) {
      console.error('Optimized AI Error:', error);
      return "I'm having trouble processing your request right now. Please try again later.";
    }

    const response = data?.response || "I'm having trouble processing your request right now. Please try again later.";
    
    // Cache successful responses with shorter TTL for high-frequency requests
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
