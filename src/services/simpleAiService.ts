
import { supabase } from '@/integrations/supabase/client';

export const getSimpleAIResponse = async (prompt: string, options?: {
  maxTokens?: number;
  temperature?: number;
}) => {
  try {
    const { data, error } = await supabase.functions.invoke('fitness-ai', {
      body: {
        prompt,
        maxTokens: options?.maxTokens || 300,
        temperature: options?.temperature || 0.7
      }
    });

    if (error) {
      console.error('Simple AI Error:', error);
      return "I'm having trouble processing your request right now. Please try again later.";
    }

    return data?.response || "I'm having trouble processing your request right now. Please try again later.";
  } catch (error) {
    console.error('Simple AI Error:', error);
    return "I'm having trouble processing your request right now. Please try again later.";
  }
};

export const simpleAiService = {
  getResponse: getSimpleAIResponse,
  getCoachingAdvice: getSimpleAIResponse
};
