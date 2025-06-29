
import { supabase } from '@/integrations/supabase/client';
import { debounce } from 'lodash';

interface CachedResponse {
  query: string;
  response: string;
  timestamp: number;
  expiresAt: number;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
}

interface OptimizedAIOptions {
  maxTokens?: number;
  temperature?: number;
  useCache?: boolean;
  priority?: 'low' | 'normal' | 'high';
  model?: 'gpt-4o-mini' | 'gpt-4o';
}

class OptimizedAIService {
  private cache = new Map<string, CachedResponse>();
  private requestQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;
  private readonly CACHE_DURATION = 3600000; // 1 hour
  private readonly MAX_CACHE_SIZE = 200;
  private readonly DEBOUNCE_DELAY = 500;

  // Debounced request to prevent duplicate calls
  private debouncedRequest = debounce(
    (prompt: string, options: OptimizedAIOptions, resolve: (value: string) => void, reject: (reason: any) => void) => {
      this.processRequest(prompt, options).then(resolve).catch(reject);
    },
    this.DEBOUNCE_DELAY,
    { leading: false, trailing: true }
  );

  private generateCacheKey(prompt: string, options: OptimizedAIOptions): string {
    const normalized = prompt.toLowerCase().trim();
    const optionsStr = JSON.stringify({
      maxTokens: options.maxTokens,
      temperature: options.temperature,
      model: options.model
    });
    return btoa(normalized + optionsStr).substring(0, 32);
  }

  private isExpired(cached: CachedResponse): boolean {
    return Date.now() > cached.expiresAt;
  }

  private evictOldEntries(): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Remove oldest 25% of entries
      const toRemove = Math.floor(this.MAX_CACHE_SIZE * 0.25);
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }

  private async getCachedResponse(cacheKey: string): Promise<string | null> {
    const cached = this.cache.get(cacheKey);
    
    if (cached && !this.isExpired(cached)) {
      console.log('[AI Cache] Serving cached response');
      return cached.response;
    }
    
    if (cached && this.isExpired(cached)) {
      this.cache.delete(cacheKey);
    }
    
    return null;
  }

  private setCachedResponse(
    cacheKey: string, 
    query: string, 
    response: string, 
    options: OptimizedAIOptions,
    usage: any
  ): void {
    this.evictOldEntries();
    
    const cached: CachedResponse = {
      query,
      response,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.CACHE_DURATION,
      model: options.model || 'gpt-4o-mini',
      usage: {
        promptTokens: usage?.prompt_tokens || 0,
        completionTokens: usage?.completion_tokens || 0
      }
    };
    
    this.cache.set(cacheKey, cached);
  }

  private async processRequest(prompt: string, options: OptimizedAIOptions): Promise<string> {
    const startTime = performance.now();
    
    try {
      // Use lighter model by default for better performance
      const model = options.model || 'gpt-4o-mini';
      
      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: {
          prompt,
          maxTokens: options.maxTokens || 200,
          temperature: options.temperature || 0.7,
          model
        }
      });

      const endTime = performance.now();
      console.log(`[AI Service] ${model} response time: ${endTime - startTime}ms`);

      if (error) {
        console.error('[AI Service] Error:', error);
        return "I'm having trouble processing your request right now. Please try again in a moment.";
      }

      return data?.response || "I'm having trouble processing your request right now. Please try again in a moment.";
    } catch (error) {
      console.error('[AI Service] Network error:', error);
      return "I'm currently having connectivity issues. Please check your internet connection and try again.";
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        await request();
        // Small delay between requests to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    this.isProcessingQueue = false;
  }

  async getOptimizedAIResponse(prompt: string, options: OptimizedAIOptions = {}): Promise<string> {
    const { useCache = true, priority = 'normal' } = options;
    
    // Check cache first if enabled
    if (useCache) {
      const cacheKey = this.generateCacheKey(prompt, options);
      const cachedResponse = await this.getCachedResponse(cacheKey);
      
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    // Use debounced request for normal and low priority
    if (priority !== 'high') {
      return new Promise((resolve, reject) => {
        this.debouncedRequest(prompt, options, resolve, reject);
      });
    }

    // Process high priority requests immediately
    return this.processRequest(prompt, options);
  }

  async getCoachingAdvice(prompt: string): Promise<string> {
    return this.getOptimizedAIResponse(prompt, {
      maxTokens: 300,
      temperature: 0.8,
      priority: 'normal'
    });
  }

  // Batch processing for multiple requests
  async batchProcess(requests: Array<{ prompt: string; options?: OptimizedAIOptions }>): Promise<string[]> {
    const results = await Promise.allSettled(
      requests.map(req => this.getOptimizedAIResponse(req.prompt, req.options))
    );
    
    return results.map(result => 
      result.status === 'fulfilled' ? result.value : 'Request failed'
    );
  }

  // Get cache statistics
  getCacheStats(): { size: number; hitRate: number; totalSavings: number } {
    const totalResponses = this.cache.size;
    const totalTokensSaved = Array.from(this.cache.values()).reduce(
      (sum, cached) => sum + cached.usage.promptTokens + cached.usage.completionTokens,
      0
    );
    
    return {
      size: totalResponses,
      hitRate: 0, // Could implement with hit/miss counters
      totalSavings: totalTokensSaved
    };
  }

  // Clear cache manually
  clearCache(): void {
    this.cache.clear();
    console.log('[AI Cache] Cache cleared');
  }
}

export const optimizedAiService = new OptimizedAIService();
export const getOptimizedAIResponse = optimizedAiService.getOptimizedAIResponse.bind(optimizedAiService);
