import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Bot, User, Sparkles, Infinity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UsageLimitGuard } from '@/components/subscription/UsageLimitGuard';
import { MobileHeader } from '@/components/MobileHeader';
import FormattedAIResponse from '@/components/FormattedAIResponse';
import { aiService } from '@/services/aiService';
import { handleError } from '@/utils/standardErrorHandler';
import { usePerformanceContext } from '@/components/ui/performance-provider';
import { useGlobalState } from '@/contexts/GlobalStateContext';
import { useAppSync } from '@/utils/appSynchronization';
import { useSubscription } from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface CoachGPTProps {
  onBack: () => void;
}

export const CoachGPT: React.FC<CoachGPTProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { optimizedSettings } = usePerformanceContext();
  const { state, actions } = useGlobalState();
  const { getCache, setCache } = useAppSync();
  const { currentTier, isSubscribed } = useSubscription();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && !hasLoaded) {
      loadConversationHistory();
      setHasLoaded(true);
    }
  }, [user, hasLoaded]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: optimizedSettings.reduceAnimations ? 'auto' : 'smooth' });
  };

  const loadConversationHistory = async () => {
    if (!user) return;

    const cacheKey = `coach-conversations-${user.id}`;
    const cached = getCache(cacheKey);
    if (cached) {
      setMessages(cached);
      return;
    }

    actions.setLoading('coach', true);
    
    try {
      const { data, error } = await supabase
        .from('coach_conversations')
        .select('id, message_role, message_content, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(optimizedSettings.lowDataMode ? 10 : 20);

      if (error) throw error;

      const conversationMessages = data?.map(msg => ({
        id: msg.id,
        role: msg.message_role as 'user' | 'assistant',
        content: msg.message_content,
        timestamp: new Date(msg.created_at)
      })) || [];
      
      setMessages(conversationMessages);
      setCache(cacheKey, conversationMessages, 300000);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      actions.setLoading('coach', false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { error: saveError } = await supabase
        .from('coach_conversations')
        .insert({
          user_id: user.id,
          conversation_session: userMessage.id,
          message_role: 'user',
          message_content: userMessage.content
        });

      if (saveError) {
        console.error('Error saving user message:', saveError);
      }

      const lowerInput = input.toLowerCase();
      if (lowerInput.includes('meal plan') || lowerInput.includes('diet plan') || lowerInput.includes('nutrition plan') || lowerInput.includes('calories') || lowerInput.includes('tdee')) {
        const redirectMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "### 🍽️ Nutrition & Meal Planning\n\nI see you're interested in nutrition planning! For personalized meal plans and calorie calculations, I recommend using our dedicated modules:\n\n**• Meal Plan AI** - Creates detailed meal plans based on your goals and preferences\n**• TDEE Calculator** - Calculates your daily calorie needs\n**• CutCalc Pro** - Advanced cutting calculations\n\nI'm here to help with **coaching, motivation, and training techniques**! What specific fitness coaching question can I help you with today? 💪",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, redirectMessage]);
        
        await supabase
          .from('coach_conversations')
          .insert({
            user_id: user.id,
            conversation_session: userMessage.id,
            message_role: 'assistant',
            message_content: redirectMessage.content
          });
        
        setIsLoading(false);
        return;
      }

      if (lowerInput.includes('training program') || lowerInput.includes('workout program') || lowerInput.includes('training plan') || lowerInput.includes('workout plan')) {
        const redirectMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "### 🏋️‍♂️ Training Programs\n\nFor comprehensive training programs, check out our **Smart Training** module! It creates personalized workout programs based on your experience level, goals, and available equipment.\n\n**I'm here to help with:**\n• Form tips and technique advice\n• Exercise selection guidance\n• Training principles and methods\n• Motivation and mindset coaching\n\nWhat specific training question can I help you with today?",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, redirectMessage]);
        
        await supabase
          .from('coach_conversations')
          .insert({
            user_id: user.id,
            conversation_session: userMessage.id,
            message_role: 'assistant',
            message_content: redirectMessage.content
          });
        
        setIsLoading(false);
        return;
      }

      const prompt = `You are CoachGPT, an expert fitness coach for Myotopia. You provide structured, motivational, and science-backed fitness coaching advice.

IMPORTANT FORMATTING RULES:
- Use markdown formatting with ### for main headings, ** for bold text
- Structure responses with clear sections and bullet points
- Keep responses conversational but professional
- Always include practical, actionable advice

COACHING FOCUS AREAS:
• Exercise form and technique
• Training principles and methods  
• Motivation and mindset
• Recovery and injury prevention
• General fitness questions

STRICT RESTRICTIONS - DO NOT:
- Create meal plans or detailed nutrition advice
- Calculate TDEE or calories
- Generate training programs
- Provide medical advice

User question: ${userMessage.content}

Format your response with clear headings and structure. Be encouraging and cite scientific principles when relevant.`;

      const response = await aiService.getCoachingAdvice(prompt, {
        maxTokens: optimizedSettings.maxTokens,
        priority: 'normal',
        useCache: true
      });

      const assistantMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      await supabase
        .from('coach_conversations')
        .insert({
          user_id: user.id,
          conversation_session: userMessage.id,
          message_role: 'assistant',
          message_content: response
        });

    } catch (error) {
      handleError(error, { 
        customMessage: 'Failed to get coaching advice. Please try again.',
        action: () => handleSubmit(e),
        actionLabel: 'Retry'
      });
      
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <UsageLimitGuard featureKey="coach_gpt_queries" featureName="CoachGPT">
      <div className="min-h-screen bg-background">
        <MobileHeader 
          title="CoachGPT"
          onBack={onBack}
          rightElement={
            isSubscribed ? (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 gap-1">
                <Infinity className="w-3 h-3" />
                <span className="text-xs">Unlimited</span>
              </Badge>
            ) : null
          }
        />
        
        <div className="px-4 pb-24 max-w-2xl mx-auto">
          <Card className="bg-card border-border flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
            <CardHeader className="flex-shrink-0 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-foreground text-lg">CoachGPT</CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">
                    AI fitness coach with research-based guidance
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col overflow-hidden pt-0">
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
                {messages.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Hello! I'm CoachGPT 💪</h3>
                    <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                      I'm your personal fitness coach, here to help with training advice, form tips, and motivation!
                    </p>
                    <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                      <Button
                        onClick={() => handleQuickPrompt("What's the best way to improve my squat form?")}
                        variant="outline"
                        size="sm"
                        className="text-xs h-auto py-2.5 px-3"
                      >
                        💪 Ask about form
                      </Button>
                      <Button
                        onClick={() => handleQuickPrompt("How do I stay motivated to work out consistently?")}
                        variant="outline"
                        size="sm"
                        className="text-xs h-auto py-2.5 px-3"
                      >
                        🎯 Get motivation tips
                      </Button>
                      <Button
                        onClick={() => handleQuickPrompt("What are the key principles for muscle growth?")}
                        variant="outline"
                        size="sm"
                        className="text-xs h-auto py-2.5 px-3"
                      >
                        📚 Training principles
                      </Button>
                      <Button
                        onClick={() => handleQuickPrompt("How can I prevent workout injuries?")}
                        variant="outline"
                        size="sm"
                        className="text-xs h-auto py-2.5 px-3"
                      >
                        🛡️ Injury prevention
                      </Button>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn("flex", message.role === 'user' ? 'justify-end' : 'justify-start')}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl p-3",
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground ml-4'
                            : 'bg-muted text-foreground mr-4'
                        )}
                      >
                        <div className="flex items-start gap-2">
                          {message.role === 'assistant' && (
                            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Bot className="w-4 h-4 text-primary" />
                            </div>
                          )}
                          {message.role === 'user' && (
                            <div className="w-6 h-6 bg-primary-foreground/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            {message.role === 'assistant' ? (
                              <FormattedAIResponse content={message.content} moduleType="coach" />
                            ) : (
                              <div className="text-sm">{message.content}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] bg-muted text-foreground mr-4 rounded-2xl p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me about fitness, training, or motivation..."
                  className="flex-1 bg-muted border-border rounded-xl h-11"
                  disabled={isLoading}
                  aria-label="Message input"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="rounded-xl px-4 h-11 min-w-[44px]"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </UsageLimitGuard>
  );
};

export default CoachGPT;