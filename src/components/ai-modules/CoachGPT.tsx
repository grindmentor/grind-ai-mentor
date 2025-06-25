
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Send, ArrowLeft, Brain, RefreshCw, Sparkles, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useCoachMemory } from '@/hooks/useCoachMemory';
import FormattedAIResponse from '../FormattedAIResponse';

interface CoachGPTProps {
  onBack: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const CoachGPT: React.FC<CoachGPTProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { userContext, isLoading: contextLoading, fetchUserContext, getContextPrompt } = useCoachMemory();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationSession] = useState(() => crypto.randomUUID());

  useEffect(() => {
    if (user) {
      loadConversationHistory();
    }
  }, [user, conversationSession]);

  const loadConversationHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('coach_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('conversation_session', conversationSession)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: Message[] = data.map(msg => ({
        id: msg.id,
        role: msg.message_role as 'user' | 'assistant',
        content: msg.message_content,
        timestamp: msg.created_at
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const saveMessage = async (role: 'user' | 'assistant', content: string) => {
    if (!user) return;

    try {
      await supabase
        .from('coach_conversations')
        .insert({
          user_id: user.id,
          conversation_session: conversationSession,
          message_role: role,
          message_content: content
        });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Save user message
    await saveMessage('user', inputMessage);

    try {
      // Get conversation history for context
      const conversationHistory = messages
        .slice(-6) // Last 6 messages for context
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n\n');

      // Get user context
      const contextPrompt = getContextPrompt();

      const fullPrompt = `${contextPrompt}

## Conversation History
${conversationHistory}

## Current User Message
${inputMessage}

**Instructions**: You are an expert fitness coach with access to the user's complete fitness journey data. Provide personalized, science-based coaching that references their specific data when relevant. Use recent 2024 research and studies to support your recommendations. Be encouraging, specific, and actionable. Always maintain context from previous conversations and their tracked data.

Focus areas:
- Evidence-based training advice (cite 2024 studies when relevant)
- Personalized nutrition guidance based on their food logs
- Progress analysis using their tracked workouts
- Goal-specific recommendations
- Motivation and accountability

Respond in a professional, encouraging tone that shows you understand their complete fitness journey.`;

      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: {
          prompt: fullPrompt,
          feature: 'coach_gpt_queries'
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Save assistant message
      await saveMessage('assistant', data.response);

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to get coach response');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshContext = async () => {
    await fetchUserContext();
    toast.success('Context updated with latest data');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={onBack} 
                className="text-blue-200 hover:text-white hover:bg-blue-800/50"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Dashboard
              </Button>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/25">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
                    CoachGPT
                  </h1>
                  <p className="text-blue-200 text-lg">Your AI fitness coach with memory</p>
                </div>
              </div>
            </div>
            
            <Button
              onClick={refreshContext}
              disabled={contextLoading}
              className="bg-blue-600 hover:bg-blue-700 border-0"
            >
              {contextLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Update Context
            </Button>
          </div>

          {/* Context Summary */}
          {userContext && (
            <div className="mb-6 p-4 bg-blue-800/30 backdrop-blur-sm rounded-2xl border border-blue-600/30">
              <div className="text-sm text-blue-200">
                <strong className="text-blue-300">🧠 Active Context:</strong>
                {userContext.profile?.display_name && ` ${userContext.profile.display_name} | `}
                {userContext.recentWorkouts?.length > 0 && `${userContext.recentWorkouts.length} recent workouts | `}
                {userContext.recentFoodLogs?.length > 0 && `${userContext.recentFoodLogs.length} recent meals | `}
                {userContext.tdeeData && `TDEE: ${userContext.tdeeData.tdee} cal`}
              </div>
            </div>
          )}

          {/* Messages Container */}
          <Card className="bg-blue-900/50 border-blue-600/30 backdrop-blur-sm min-h-[600px] flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Brain className="w-10 h-10 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Welcome to CoachGPT</h3>
                  <p className="text-blue-200 max-w-md mx-auto mb-8">
                    I'm your personal AI fitness coach with access to all your training, nutrition, and progress data. 
                    Ask me anything about your fitness journey!
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {[
                      { text: "📊 Analyze my progress", prompt: "Analyze my recent workout progress and suggest improvements" },
                      { text: "🥗 Review my nutrition", prompt: "Review my nutrition and suggest optimizations" },
                      { text: "💪 Plan my workouts", prompt: "Create a workout plan based on my goals and experience" },
                      { text: "🚀 Break plateaus", prompt: "Help me break through a training plateau" }
                    ].map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="border-blue-600/50 text-blue-200 hover:bg-blue-700/50 hover:border-blue-500 text-left justify-start p-4 h-auto"
                        onClick={() => setInputMessage(suggestion.prompt)}
                      >
                        {suggestion.text}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${message.role === 'user' ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-blue-800/50 backdrop-blur-sm'} rounded-2xl p-6 shadow-lg`}>
                      {message.role === 'assistant' ? (
                        <FormattedAIResponse content={message.content} />
                      ) : (
                        <p className="text-white">{message.content}</p>
                      )}
                      <div className={`text-xs mt-3 ${message.role === 'user' ? 'text-blue-100' : 'text-blue-300'}`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-blue-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                      <span className="text-blue-200">🧠 Coach is analyzing...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-blue-600/30">
              <div className="flex space-x-4">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask your coach anything... I remember your workouts, nutrition, and goals!"
                  className="bg-blue-800/50 border-blue-600/50 text-white resize-none focus:border-blue-500 backdrop-blur-sm"
                  rows={2}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 border-0 px-6"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CoachGPT;
