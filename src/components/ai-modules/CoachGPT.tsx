
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Bot, User, Zap, Target, Utensils, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UsageLimitGuard } from '@/components/subscription/UsageLimitGuard';
import { MobileHeader } from '@/components/MobileHeader';
import { optimizedAiService } from '@/services/optimizedAiService';
import { useIsMobile } from '@/hooks/use-mobile';
import { LoadingSpinner } from '@/components/ui/loading-screen';

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
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationLoaded, setConversationLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Memoized system context to prevent recreation
  const coachSystemContext = useMemo(() => `
You are CoachGPT, an expert fitness coach for Myotopia. You provide helpful, motivational, and science-backed fitness advice. 

IMPORTANT RESTRICTIONS:
- You do NOT create meal plans or detailed nutrition plans - redirect users to the Meal Plan AI module
- You do NOT create detailed training programs or workout routines - redirect users to the Smart Training module
- You focus ONLY on: exercise form, technique tips, training principles, motivation, mindset, recovery advice, and answering general fitness questions

Your responses should be:
- Concise but informative (under 200 words)
- Encouraging and professional
- Science-backed when relevant
- Clear about your limitations

If asked about meal plans or detailed training programs, politely redirect to the appropriate Myotopia modules.
`, []);

  useEffect(() => {
    if (user && !conversationLoaded) {
      loadConversationHistory();
    }
  }, [user, conversationLoaded]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const loadConversationHistory = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('coach_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(20); // Limit to recent messages for better performance

      if (error) throw error;

      const conversationMessages = data.map(msg => ({
        id: msg.id,
        role: msg.message_role as 'user' | 'assistant',
        content: msg.message_content,
        timestamp: new Date(msg.created_at)
      }));

      setMessages(conversationMessages);
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setConversationLoaded(true);
    }
  }, [user]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
      // Save user message
      await supabase
        .from('coach_conversations')
        .insert({
          user_id: user.id,
          conversation_session: userMessage.id,
          message_role: 'user',
          message_content: userMessage.content
        });

      // Check for meal plan or training program requests and redirect
      const lowerInput = input.toLowerCase();
      if (lowerInput.includes('meal plan') || lowerInput.includes('diet plan') || lowerInput.includes('nutrition plan')) {
        const redirectMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I see you're interested in meal planning! 🍽️\n\nFor personalized meal plans, I recommend using our dedicated **Meal Plan AI** module. It's specifically designed to create detailed meal plans based on your goals, dietary preferences, and restrictions.\n\nYou can find it in your dashboard. I'm here to help with general fitness coaching, motivation, and answering questions about training techniques! 💪",
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
        return;
      }

      if (lowerInput.includes('training program') || lowerInput.includes('workout program') || lowerInput.includes('training plan') || lowerInput.includes('workout plan')) {
        const redirectMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "For comprehensive training programs, check out our **Smart Training** module! 🏋️‍♂️\n\nIt creates personalized workout programs based on your experience level, goals, and available equipment.\n\nI'm here to help with form tips, exercise selection advice, and general fitness coaching. What specific training question can I help you with today?",
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
        return;
      }

      // Get AI response for general coaching
      const response = await optimizedAiService.getResponse(
        userMessage.content,
        { 
          useCache: true, 
          priority: 'normal',
          maxTokens: 200,
          systemContext: coachSystemContext
        }
      );

      const assistantMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save assistant message
      await supabase
        .from('coach_conversations')
        .insert({
          user_id: user.id,
          conversation_session: userMessage.id,
          message_role: 'assistant',
          message_content: response
        });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, user, toast, coachSystemContext]);

  const suggestedQuestions = useMemo(() => [
    "What's the best way to improve my squat form?",
    "How do I stay motivated to work out?",
    "What are the key principles of muscle growth?",
    "How important is rest between workouts?"
  ], []);

  if (!conversationLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-green-950/50 to-green-900/30">
        <MobileHeader title="CoachGPT" onBack={onBack} />
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner message="Loading conversation..." />
        </div>
      </div>
    );
  }

  return (
    <UsageLimitGuard featureKey="coach_gpt_queries" featureName="CoachGPT">
      <div className="min-h-screen bg-gradient-to-br from-black via-green-950/50 to-green-900/30">
        {/* Mobile Header */}
        {isMobile ? (
          <MobileHeader title="CoachGPT" onBack={onBack} />
        ) : (
          <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800/50">
            <div className="px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={onBack}
                  variant="ghost"
                  size="default"
                  className="text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <h1 className="text-2xl font-bold text-white">CoachGPT</h1>
              </div>
            </div>
          </div>
        )}
        
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/30 backdrop-blur-sm border-green-500/30 h-[calc(100vh-140px)] flex flex-col">
            <CardHeader className="flex-shrink-0 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500/30 to-emerald-500/40 rounded-xl flex items-center justify-center border border-green-500/30">
                  <MessageSquare className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-xl">CoachGPT</CardTitle>
                  <CardDescription className="text-green-200/80">
                    Your AI fitness coach and training companion
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col overflow-hidden p-6">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-thin scrollbar-thumb-green-500/30">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <Bot className="w-16 h-16 text-green-400/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-green-200 mb-2">Hello! I'm CoachGPT 💪</h3>
                    <p className="text-green-300/70 mb-6 max-w-md mx-auto">
                      I'm your personal fitness coach, here to help with training advice, form tips, motivation, and answering your fitness questions!
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                      {suggestedQuestions.map((question, index) => (
                        <Button
                          key={index}
                          onClick={() => setInput(question)}
                          variant="outline"
                          className="text-green-300 border-green-500/30 hover:bg-green-500/10 text-sm h-auto py-3 px-4 whitespace-normal text-left"
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-green-600/80 text-white ml-4'
                            : 'bg-green-900/40 text-green-100 mr-4 border border-green-500/30'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.role === 'assistant' && (
                            <Bot className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          )}
                          {message.role === 'user' && (
                            <User className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                          )}
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] bg-green-900/40 text-green-100 mr-4 border border-green-500/30 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-4 h-4 text-green-400" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me about fitness, training, or motivation..."
                  className="flex-1 bg-green-900/30 border-green-500/50 text-white placeholder:text-green-200/50"
                  disabled={isLoading}
                  maxLength={500}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-green-600 hover:bg-green-700 flex-shrink-0"
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
