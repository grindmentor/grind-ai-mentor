import { supabase } from '@/integrations/supabase/client';
import { AIResponse, AIServiceOptions, CacheEntry } from '@/types/ai';
import { handleError } from '@/utils/standardErrorHandler';

class UnifiedAIService {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  private pendingRequests = new Map<string, Promise<string>>();

  /**
   * Generate cache key from prompt and options
   */
  private generateCacheKey(prompt: string, options: AIServiceOptions): string {
    const {
      maxTokens = 600,
      temperature = 0.7,
      type = 'coaching'
    } = options;
    
    return `ai:${type}:${prompt.substring(0, 50)}:${maxTokens}:${temperature}`.toLowerCase();
  }

  /**
   * Get cached response if available and not expired
   */
  private getCachedResponse(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Cache a response
   */
  private setCachedResponse(key: string, data: string, ttl = this.DEFAULT_CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    });

    // Cleanup old entries if cache gets too large
    if (this.cache.size > 100) {
      const oldestKeys = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, 20)
        .map(([key]) => key);
      
      oldestKeys.forEach(key => this.cache.delete(key));
    }
  }

  /**
   * Main method to get AI response
   */
  async getResponse(prompt: string, options: AIServiceOptions = {}): Promise<string> {
    const {
      maxTokens = 600,
      temperature = 0.7,
      useCache = true,
      priority = 'normal',
      type = 'coaching'
    } = options;

    // Optimize token limits based on priority
    const optimizedMaxTokens = 
      priority === 'low' ? Math.min(maxTokens, 80) : 
      priority === 'high' ? Math.min(maxTokens, 1500) : 
      Math.min(maxTokens, 600);

    const cacheKey = this.generateCacheKey(prompt, { maxTokens: optimizedMaxTokens, temperature, type });

    // Check cache first
    if (useCache) {
      const cached = this.getCachedResponse(cacheKey);
      if (cached) {
        console.log('🚀 AI SERVICE: Cache hit for', type);
        return cached;
      }
    }

    // Check for pending request (deduplication)
    const pendingRequest = this.pendingRequests.get(cacheKey);
    if (pendingRequest) {
      console.log('🔄 AI SERVICE: Deduplicating request for', type);
      return pendingRequest;
    }

    // Create new request
    const requestPromise = this.makeAIRequest(prompt, {
      maxTokens: optimizedMaxTokens,
      temperature,
      type
    });

    // Store pending request
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const response = await requestPromise;

      // Cache successful response
      if (useCache && response && !response.includes('having trouble')) {
        this.setCachedResponse(cacheKey, response);
      }

      return response;
    } finally {
      // Remove from pending requests
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Make actual AI request to edge function
   */
  private async makeAIRequest(
    prompt: string,
    options: { maxTokens: number; temperature: number; type: string }
  ): Promise<string> {
    try {
      console.log('🔍 AI SERVICE: Starting AI request');
      console.log('🔍 AI SERVICE: Type:', options.type, 'Tokens:', options.maxTokens);

      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: {
          prompt,
          userInput: prompt,
          maxTokens: options.maxTokens,
          temperature: options.temperature,
          type: options.type
        }
      });

      console.log('🔍 AI SERVICE: Response received:', { hasData: !!data, hasError: !!error });

      if (error) {
        handleError(error, { customMessage: 'AI service error. Please try again.' });
        return "I'm having trouble processing your request right now. Please try again later.";
      }

      return data?.response || "I'm having trouble processing your request right now. Please try again later.";
    } catch (error) {
      handleError(error, { customMessage: 'Failed to connect to AI service.' });
      return "I'm having trouble processing your request right now. Please try again later.";
    }
  }

  /**
   * Clear all cached responses
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 AI SERVICE: Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }

  /**
   * Specific method for coaching advice
   */
  async getCoachingAdvice(prompt: string, options?: Omit<AIServiceOptions, 'type'>): Promise<string> {
    return this.getResponse(prompt, { ...options, type: 'coaching' });
  }

  /**
   * Specific method for nutrition advice
   */
  async getNutritionAdvice(prompt: string, options?: Omit<AIServiceOptions, 'type'>): Promise<string> {
    return this.getResponse(prompt, { ...options, type: 'nutrition' });
  }

  /**
   * Specific method for training programs
   */
  async getTrainingAdvice(prompt: string, options?: Omit<AIServiceOptions, 'type'>): Promise<string> {
    return this.getResponse(prompt, { ...options, type: 'training' });
  }

  /**
   * Specific method for recovery advice
   */
  async getRecoveryAdvice(prompt: string, options?: Omit<AIServiceOptions, 'type'>): Promise<string> {
    return this.getResponse(prompt, { ...options, type: 'recovery' });
  }
}

// Export singleton instance
export const aiService = new UnifiedAIService();

// Export for backward compatibility
export const getAIResponse = (prompt: string, options?: AIServiceOptions) => 
  aiService.getResponse(prompt, options);

export const getCoachingAdvice = (prompt: string, options?: Omit<AIServiceOptions, 'type'>) => 
  aiService.getCoachingAdvice(prompt, options);
