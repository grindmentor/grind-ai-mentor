
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
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

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
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: "system", content: SCIENCE_FITNESS_CONTEXT },
        { role: "user", content: prompt }
      ],
      max_tokens: maxTokens,
      temperature,
    });

    const response = completion.choices[0].message.content || "I'm having trouble processing your request right now. Please try again later.";
    
    // Cache successful responses
    if (useCache) {
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
