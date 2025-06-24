
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Send, ArrowLeft, Brain, RefreshCw } from 'lucide-react';
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-orange-500" />
            <div>
              <h2 className="text-2xl font-bold text-white">CoachGPT</h2>
              <p className="text-gray-400">Your AI fitness coach with memory</p>
            </div>
          </div>
        </div>
        <Button
          onClick={refreshContext}
          disabled={contextLoading}
          variant="outline"
          size="sm"
          className="border-gray-700"
        >
          {contextLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Update Context
        </Button>
      </div>

      {/* Context Summary */}
      {userContext && (
        <div className="p-4 bg-gray-900/50 border-b border-gray-800">
          <div className="text-sm text-gray-400">
            <strong className="text-orange-400">Active Context:</strong>
            {userContext.profile?.display_name && ` ${userContext.profile.display_name} | `}
            {userContext.recentWorkouts?.length > 0 && `${userContext.recentWorkouts.length} recent workouts | `}
            {userContext.recentFoodLogs?.length > 0 && `${userContext.recentFoodLogs.length} recent meals | `}
            {userContext.tdeeData && `TDEE: ${userContext.tdeeData.tdee} cal`}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Welcome to CoachGPT</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              I'm your personal AI fitness coach with access to all your training, nutrition, and progress data. 
              Ask me anything about your fitness journey!
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              <Button
                variant="outline"
                className="border-gray-700 text-left justify-start"
                onClick={() => setInputMessage("Analyze my recent workout progress and suggest improvements")}
              >
                📊 Analyze my progress
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 text-left justify-start"
                onClick={() => setInputMessage("Review my nutrition and suggest optimizations")}
              >
                🥗 Review my nutrition
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 text-left justify-start"
                onClick={() => setInputMessage("Create a workout plan based on my goals and experience")}
              >
                💪 Plan my workouts
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 text-left justify-start"
                onClick={() => setInputMessage("Help me break through a training plateau")}
              >
                🚀 Break plateaus
              </Button>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${message.role === 'user' ? 'bg-orange-600' : 'bg-gray-800'} rounded-lg p-4`}>
                {message.role === 'assistant' ? (
                  <FormattedAIResponse content={message.content} />
                ) : (
                  <p className="text-white">{message.content}</p>
                )}
                <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-orange-100' : 'text-gray-500'}`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                <span className="text-gray-400">Coach is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-gray-800">
        <div className="flex space-x-3">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask your coach anything... I remember your workouts, nutrition, and goals!"
            className="bg-gray-800 border-gray-700 text-white resize-none"
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
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CoachGPT;
