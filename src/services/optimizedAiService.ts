
import OpenAI from 'openai';

const LIGHTWEIGHT_CONTEXT = `
You are a fitness AI assistant. Keep responses under 150 words and be direct. Focus on actionable advice based on scientific evidence.
`;

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Enhanced caching with compression
const cache = new Map<string, { data: string; timestamp: number; compressed: boolean }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const MAX_CACHE_SIZE = 50; // Limit cache size

// Simple text compression for cache
const compressText = (text: string): string => {
  // Basic compression by removing extra whitespace
  return text.replace(/\s+/g, ' ').trim();
};

const getCacheKey = (prompt: string): string => {
  // Create shorter cache keys
  return btoa(prompt.substring(0, 100)).substring(0, 16);
};

// Cleanup old cache entries
const cleanupCache = () => {
  const now = Date.now();
  const entries = Array.from(cache.entries());
  
  // Remove expired entries
  entries.forEach(([key, value]) => {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  });
  
  // Limit cache size
  if (cache.size > MAX_CACHE_SIZE) {
    const sortedEntries = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toDelete = sortedEntries.slice(0, cache.size - MAX_CACHE_SIZE);
    toDelete.forEach(([key]) => cache.delete(key));
  }
};

// Batch multiple requests
const requestQueue: Array<{ prompt: string; resolve: (value: string) => void; reject: (error: any) => void }> = [];
let batchTimeout: NodeJS.Timeout | null = null;

const processBatch = async () => {
  if (requestQueue.length === 0) return;
  
  const batch = requestQueue.splice(0, 3); // Process max 3 at once
  
  try {
    const promises = batch.map(async ({ prompt, resolve, reject }) => {
      try {
        const result = await makeDirectRequest(prompt);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    
    await Promise.allSettled(promises);
  } catch (error) {
    console.error('Batch processing error:', error);
  }
  
  batchTimeout = null;
  
  // Process remaining queue
  if (requestQueue.length > 0) {
    batchTimeout = setTimeout(processBatch, 100);
  }
};

const makeDirectRequest = async (prompt: string): Promise<string> => {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Lightest model
    messages: [
      { role: "system", content: LIGHTWEIGHT_CONTEXT },
      { role: "user", content: prompt }
    ],
    max_tokens: 150, // Reduced for faster responses
    temperature: 0.3, // Lower for more consistent caching
  });

  return completion.choices[0].message.content || "Unable to process request.";
};

export const getOptimizedAIResponse = async (prompt: string): Promise<string> => {
  cleanupCache();
  
  const cacheKey = getCacheKey(prompt);
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  return new Promise((resolve, reject) => {
    requestQueue.push({ prompt, resolve, reject });
    
    if (!batchTimeout) {
      batchTimeout = setTimeout(processBatch, 50); // Small delay for batching
    }
  }).then((response: string) => {
    const compressed = compressText(response);
    cache.set(cacheKey, {
      data: compressed,
      timestamp: Date.now(),
      compressed: true
    });
    
    return compressed;
  });
};

// Lightweight coaching with minimal processing
export const getQuickCoachingTip = async (category: string): Promise<string> => {
  const tips: Record<string, string[]> = {
    training: [
      "Focus on compound movements for maximum efficiency.",
      "Progressive overload: gradually increase weight or reps.",
      "Rest 48-72 hours between training same muscle groups."
    ],
    nutrition: [
      "Eat protein with every meal (0.8-1g per lb bodyweight).",
      "Stay hydrated: drink water throughout the day.",
      "Include vegetables in every meal for micronutrients."
    ],
    recovery: [
      "Aim for 7-9 hours of quality sleep nightly.",
      "Light activity on rest days promotes recovery.",
      "Manage stress through breathing or meditation."
    ]
  };
  
  const categoryTips = tips[category] || tips.training;
  return categoryTips[Math.floor(Math.random() * categoryTips.length)];
};
