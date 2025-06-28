
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Bot, User, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UsageLimitGuard } from '@/components/subscription/UsageLimitGuard';
import { MobileHeader } from '@/components/MobileHeader';
import FormattedAIResponse from '@/components/FormattedAIResponse';

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
        .limit(20);

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

      // Check for restricted requests and redirect appropriately
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

      // Get AI response for general coaching
      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: {
          prompt: `You are CoachGPT, an expert fitness coach for Myotopia. You provide structured, motivational, and science-backed fitness coaching advice.

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

Format your response with clear headings and structure. Be encouraging and cite scientific principles when relevant.`,
          type: 'coaching',
          maxTokens: 500
        }
      });

      if (error) {
        console.error('AI Response Error:', error);
        throw error;
      }

      const response = data?.response || "I'm having trouble processing your request right now. Please try again later.";

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
      
      // Remove the user message if there was an error
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
      <div className="min-h-screen bg-gradient-to-br from-black via-cyan-900/10 to-cyan-800/20">
        <MobileHeader 
          title="CoachGPT" 
          onBack={onBack}
        />
        
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/30 backdrop-blur-sm border-cyan-500/30 h-[calc(100vh-120px)] flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500/30 to-blue-500/40 rounded-xl flex items-center justify-center border border-cyan-500/30">
                  <MessageSquare className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-xl">CoachGPT</CardTitle>
                  <CardDescription className="text-cyan-200/80">
                    Your AI fitness coach with research-based guidance
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-cyan-500/20 to-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
                      <Sparkles className="w-10 h-10 text-cyan-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-cyan-200 mb-2">Hello! I'm CoachGPT 💪</h3>
                    <p className="text-cyan-300/70 mb-6 max-w-md mx-auto leading-relaxed">
                      I'm your personal fitness coach, here to help with training advice, form tips, motivation, and answering your fitness questions!
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                      <Button
                        onClick={() => handleQuickPrompt("What's the best way to improve my squat form?")}
                        variant="outline"
                        className="text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/10 bg-cyan-900/20 h-auto py-3 px-4"
                      >
                        <span className="text-sm">💪 Ask about form</span>
                      </Button>
                      <Button
                        onClick={() => handleQuickPrompt("How do I stay motivated to work out consistently?")}
                        variant="outline"
                        className="text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/10 bg-cyan-900/20 h-auto py-3 px-4"
                      >
                        <span className="text-sm">🎯 Get motivation tips</span>
                      </Button>
                      <Button
                        onClick={() => handleQuickPrompt("What are the key principles for muscle growth?")}
                        variant="outline"
                        className="text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/10 bg-cyan-900/20 h-auto py-3 px-4"
                      >
                        <span className="text-sm">📚 Training principles</span>
                      </Button>
                      <Button
                        onClick={() => handleQuickPrompt("How can I prevent workout injuries?")}
                        variant="outline"
                        className="text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/10 bg-cyan-900/20 h-auto py-3 px-4"
                      >
                        <span className="text-sm">🛡️ Injury prevention</span>
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
                        className={`max-w-[85%] rounded-2xl p-4 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-cyan-600/80 to-blue-600/80 text-white ml-4 shadow-lg border border-cyan-500/30'
                            : 'bg-gradient-to-r from-cyan-900/40 to-blue-900/40 text-cyan-100 mr-4 border border-cyan-500/30 shadow-lg backdrop-blur-sm'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {message.role === 'assistant' && (
                            <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                              <Bot className="w-4 h-4 text-cyan-400" />
                            </div>
                          )}
                          {message.role === 'user' && (
                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                              <User className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div className="flex-1">
                            {message.role === 'assistant' ? (
                              <FormattedAIResponse content={message.content} moduleType="coach" />
                            ) : (
                              <div className="text-sm leading-relaxed">{message.content}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] bg-gradient-to-r from-cyan-900/40 to-blue-900/40 text-cyan-100 mr-4 border border-cyan-500/30 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                  className="flex-1 bg-cyan-900/30 border-cyan-500/50 text-white placeholder:text-cyan-300/50 rounded-xl"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 rounded-xl px-6"
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
