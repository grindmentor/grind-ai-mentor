
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Bot, User, Zap, Target, Utensils } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UsageLimitGuard } from '@/components/subscription/UsageLimitGuard';
import { MobileHeader } from '@/components/MobileHeader';
import { getOptimizedAIResponse } from '@/services/optimizedAiService';

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadConversationHistory();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversationHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('coach_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Error loading conversation:', error);
        return;
      }

      const conversationMessages = data?.map(msg => ({
        id: msg.id,
        role: msg.message_role as 'user' | 'assistant',
        content: msg.message_content,
        timestamp: new Date(msg.created_at)
      })) || [];

      setMessages(conversationMessages);
    } catch (error) {
      console.error('Error loading conversation:', error);
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
      // Save user message
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

      // Check for meal plan or training program requests
      const lowerInput = input.toLowerCase();
      if (lowerInput.includes('meal plan') || lowerInput.includes('diet plan') || lowerInput.includes('nutrition plan')) {
        const redirectMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I see you're interested in meal planning! For personalized meal plans, I recommend using our dedicated **Meal Plan AI** module. It's specifically designed to create detailed meal plans based on your goals, dietary preferences, and restrictions.\n\nYou can find it in your dashboard. I'm here to help with general fitness coaching, motivation, and answering questions about training techniques! 💪",
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

      if (lowerInput.includes('training program') || lowerInput.includes('workout program') || lowerInput.includes('training plan')) {
        const redirectMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "For comprehensive training programs, check out our **Smart Training** module! It creates personalized workout programs based on your experience level, goals, and available equipment.\n\nI'm here to help with form tips, exercise selection advice, and general fitness coaching. What specific training question can I help you with today? 🏋️‍♂️",
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

      // Get AI response for general coaching
      const systemPrompt = `You are CoachGPT, an expert fitness coach for Myotopia. Provide helpful, motivational, and science-backed fitness advice. Keep responses concise but informative. Focus on:
      - Exercise form and technique
      - Training principles and methods  
      - Motivation and mindset
      - General fitness questions
      - Recovery and injury prevention
      
      Do NOT create meal plans or detailed training programs - redirect users to the appropriate modules for those requests.
      
      Be encouraging, professional, and cite scientific principles when relevant.`;

      const response = await getOptimizedAIResponse(
        `${systemPrompt}\n\nUser question: ${userMessage.content}`,
        { 
          useCache: true, 
          priority: 'normal',
          maxTokens: 300,
          temperature: 0.7
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
  };

  return (
    <UsageLimitGuard featureKey="coach_gpt_queries" featureName="CoachGPT">
      <div className="min-h-screen bg-gradient-to-br from-black via-green-950/50 to-green-900/30">
        <MobileHeader 
          title="CoachGPT" 
          onBack={onBack}
        />
        
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/30 backdrop-blur-sm border-green-500/30 h-[calc(100vh-120px)] flex flex-col">
            <CardHeader className="flex-shrink-0">
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
            
            <CardContent className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <Bot className="w-16 h-16 text-green-400/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-green-200 mb-2">Hello! I'm CoachGPT 💪</h3>
                    <p className="text-green-300/70 mb-6 max-w-md mx-auto">
                      I'm your personal fitness coach, here to help with training advice, form tips, motivation, and answering your fitness questions!
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                      <Button
                        onClick={() => setInput("What's the best way to improve my squat form?")}
                        variant="outline"
                        className="text-green-300 border-green-500/30 hover:bg-green-500/10"
                      >
                        Ask about form
                      </Button>
                      <Button
                        onClick={() => setInput("How do I stay motivated to work out?")}
                        variant="outline"
                        className="text-green-300 border-green-500/30 hover:bg-green-500/10"
                      >
                        Get motivation tips
                      </Button>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
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
                          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
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
                  className="flex-1 bg-green-900/30 border-green-500/50 text-white"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-green-600 hover:bg-green-700"
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
