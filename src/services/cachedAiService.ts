
import { supabase } from '@/integrations/supabase/client';

interface CachedResponse {
  query: string;
  response: string;
  timestamp: number;
  expiresAt: number;
}

class OptimizedAICacheService {
  private cache = new Map<string, CachedResponse>();
  private readonly CACHE_DURATION = 3600000; // 1 hour
  private readonly MAX_CACHE_SIZE = 100;

  private generateCacheKey(prompt: string, options?: any): string {
    const normalized = prompt.toLowerCase().trim();
    const optionsStr = options ? JSON.stringify(options) : '';
    return btoa(normalized + optionsStr).substring(0, 32);
  }

  private isExpired(cached: CachedResponse): boolean {
    return Date.now() > cached.expiresAt;
  }

  private evictOldEntries(): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Remove oldest 20% of entries
      const toRemove = Math.floor(this.MAX_CACHE_SIZE * 0.2);
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

  private setCachedResponse(cacheKey: string, query: string, response: string): void {
    this.evictOldEntries();
    
    const cached: CachedResponse = {
      query,
      response,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.CACHE_DURATION
    };
    
    this.cache.set(cacheKey, cached);
    
    // Persist to service worker cache if available
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_AI_RESPONSE',
        query,
        response
      });
    }
  }

  async getOptimizedAIResponse(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
    useCache?: boolean;
  }): Promise<string> {
    const { maxTokens = 300, temperature = 0.7, useCache = true } = options || {};
    
    // Check cache first if enabled
    if (useCache) {
      const cacheKey = this.generateCacheKey(prompt, { maxTokens, temperature });
      const cachedResponse = await this.getCachedResponse(cacheKey);
      
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    try {
      const startTime = performance.now();
      
      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: {
          prompt,
          maxTokens,
          temperature
        }
      });

      const endTime = performance.now();
      console.log(`[AI Service] Response time: ${endTime - startTime}ms`);

      if (error) {
        console.error('[AI Service] Error:', error);
        return "I'm having trouble processing your request right now. Please try again in a moment.";
      }

      const response = data?.response || "I'm having trouble processing your request right now. Please try again in a moment.";
      
      // Cache successful responses
      if (useCache && response && !response.includes('having trouble')) {
        const cacheKey = this.generateCacheKey(prompt, { maxTokens, temperature });
        this.setCachedResponse(cacheKey, prompt, response);
      }

      return response;
    } catch (error) {
      console.error('[AI Service] Network error:', error);
      return "I'm currently having connectivity issues. Please check your internet connection and try again.";
    }
  }

  // Clear cache manually if needed
  clearCache(): void {
    this.cache.clear();
    console.log('[AI Cache] Cache cleared');
  }

  // Get cache statistics
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0 // Could be implemented with hit/miss counters
    };
  }
}

export const cachedAiService = new OptimizedAICacheService();
export const getOptimizedAIResponse = cachedAiService.getOptimizedAIResponse.bind(cachedAiService);
