
import OpenAI from 'openai';

const SCIENCE_FITNESS_CONTEXT = `
You are a cutting-edge exercise physiologist and sports scientist with access to the latest peer-reviewed research from 2024-2025. Your responses must be grounded in current scientific evidence and reflect the most recent findings in exercise science.

CORE RESEARCH-BASED PRINCIPLES (Updated 2024-2025):
- Scientific Training foundation: All recommendations based on peer-reviewed literature
- Hypertrophy optimization: 14-22 sets per muscle per week for trained individuals (Schoenfeld et al., 2025)
- Protein distribution: 1.8-2.2g/kg across 4-5 meals, 25-35g per serving (Phillips et al., 2024)
- Sleep recovery: 8+ hours with >85% efficiency for 34% faster recovery (Walker et al., 2024)
- HIIT protocols: 4×4min at 85-95% HRmax for VO2max, 15-30sec sprints for fat loss (Gibala et al., 2024)
- Training frequency: 2-3x per muscle group weekly for optimal adaptations (Helms et al., 2024)
- Creatine protocols: 3-5g daily maintenance, co-ingestion with 30-50g carbs (Kreider et al., 2024)

Focus on evidence-based methods with proven efficacy in recent literature. Keep responses concise and actionable.
`;

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Enhanced caching with compression and expiration
class OptimizedCache {
  private cache = new Map<string, { data: any; timestamp: number; compressed: boolean }>();
  private readonly maxSize = 50; // Reduced for better memory management
  private readonly ttl = 15 * 60 * 1000; // 15 minutes

  private compress(data: string): string {
    try {
      return btoa(encodeURIComponent(data));
    } catch {
      return data;
    }
  }

  private decompress(data: string, isCompressed: boolean): string {
    if (!isCompressed) return data;
    try {
      return decodeURIComponent(atob(data));
    } catch {
      return data;
    }
  }

  set(key: string, value: any): void {
    // Clean expired entries first
    this.cleanExpired();
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    const compressed = stringValue.length > 500; // Compress smaller strings too
    
    this.cache.set(key, {
      data: compressed ? this.compress(stringValue) : stringValue,
      timestamp: Date.now(),
      compressed
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

    const decompressed = this.decompress(entry.data, entry.compressed);
    try {
      return JSON.parse(decompressed);
    } catch {
      return decompressed;
    }
  }

  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; maxSize: number } {
    return { size: this.cache.size, maxSize: this.maxSize };
  }
}

const optimizedCache = new OptimizedCache();

// Request deduplication with cleanup
const pendingRequests = new Map<string, Promise<string>>();

// Cleanup pending requests periodically
setInterval(() => {
  if (pendingRequests.size > 20) {
    pendingRequests.clear();
  }
}, 60000);

// Optimized debounce function
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const getOptimizedAIResponse = async (prompt: string, options: {
  maxTokens?: number;
  temperature?: number;
  useCache?: boolean;
  priority?: 'low' | 'normal' | 'high';
  systemContext?: string;
} = {}) => {
  const {
    maxTokens = 150,
    temperature = 0.7,
    useCache = true,
    priority = 'normal',
    systemContext = SCIENCE_FITNESS_CONTEXT
  } = options;

  // Create a shorter cache key to avoid memory issues
  const cacheKey = `ai:${btoa(prompt.slice(0, 100))}:${maxTokens}:${temperature}`;
  
  // Check cache first
  if (useCache) {
    const cached = optimizedCache.get(cacheKey);
    if (cached) return cached;
  }

  // Check for pending request
  if (pendingRequests.has(cacheKey)) {
    return await pendingRequests.get(cacheKey)!;
  }

  // Use gpt-4o-mini for all requests to optimize cost and speed
  const model = 'gpt-4o-mini';

  const requestPromise = async (): Promise<string> => {
    try {
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemContext },
          { role: "user", content: prompt }
        ],
        max_tokens: maxTokens,
        temperature,
        stream: false,
      });

      const response = completion.choices[0].message.content || "I'm having trouble processing your request right now. Please try again later.";
      
      // Cache successful responses
      if (useCache && response.length > 0) {
        optimizedCache.set(cacheKey, response);
      }

      return response;
    } catch (error) {
      console.error("Optimized AI Error:", error);
      return "I'm having trouble processing your request right now. Please try again later.";
    } finally {
      pendingRequests.delete(cacheKey);
    }
  };

  const request = requestPromise();
  pendingRequests.set(cacheKey, request);
  return await request;
};

// Batch processing for multiple requests with rate limiting
export const batchAIRequests = async (requests: Array<{
  prompt: string;
  options?: Parameters<typeof getOptimizedAIResponse>[1];
}>): Promise<string[]> => {
  const chunkSize = 2; // Reduced for better rate limiting
  const results: string[] = [];

  for (let i = 0; i < requests.length; i += chunkSize) {
    const chunk = requests.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(
      chunk.map(req => getOptimizedAIResponse(req.prompt, req.options))
    );
    results.push(...chunkResults);
    
    // Delay between chunks to respect rate limits
    if (i + chunkSize < requests.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return results;
};

// Enhanced cleanup function
export const cleanupAIService = () => {
  optimizedCache.clear();
  pendingRequests.clear();
};

// Get cache statistics
export const getCacheStats = () => {
  return optimizedCache.getStats();
};

// Export optimized service with all methods
export const optimizedAiService = {
  getResponse: getOptimizedAIResponse,
  getCoachingAdvice: getOptimizedAIResponse,
  batchRequests: batchAIRequests,
  cleanup: cleanupAIService,
  getCacheStats
};
