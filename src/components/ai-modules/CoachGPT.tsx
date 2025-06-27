
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Bot, User, MessageSquare, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/ui/page-transition";
import { useIsMobile } from "@/hooks/use-mobile";

interface CoachGPTProps {
  onBack: () => void;
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const CoachGPT = ({ onBack }: CoachGPTProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: {
          message: input.trim(),
          context: 'coach-gpt',
          user_id: user.id
        }
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || "I'm here to help with your fitness journey! Ask me about workouts, nutrition, or any fitness-related questions.",
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-black via-green-900/10 to-green-800/20 text-white">
        <div className="p-3 sm:p-4 md:p-6">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="text-white hover:bg-green-500/20 backdrop-blur-sm w-fit"
                size={isMobile ? "sm" : "default"}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {isMobile ? "Back" : "Back to Dashboard"}
              </Button>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500/20 to-emerald-600/40 backdrop-blur-sm rounded-xl flex items-center justify-center border border-green-400/20">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    CoachGPT
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-400">Your AI fitness coach</p>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center sm:justify-start">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <Zap className="w-3 h-3 mr-1" />
                AI-Powered Coaching
              </Badge>
            </div>

            {/* Chat Interface */}
            <Card className="bg-gray-900/40 backdrop-blur-sm border-green-500/30 h-[60vh] sm:h-[70vh] flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center text-lg sm:text-xl">
                  <MessageSquare className="w-5 h-5 mr-2 text-green-500" />
                  Chat with Your AI Coach
                </CardTitle>
                <CardDescription>
                  Ask me anything about fitness, nutrition, workouts, or health!
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-4 sm:p-6 pt-0">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <Bot className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-4 opacity-50" />
                      <p className="text-gray-400 text-sm sm:text-base">
                        Welcome! I'm your AI fitness coach. Ask me anything about:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 max-w-md mx-auto text-xs sm:text-sm">
                        <span className="text-green-400">• Workout routines</span>
                        <span className="text-green-400">• Nutrition advice</span>
                        <span className="text-green-400">• Exercise form</span>
                        <span className="text-green-400">• Recovery tips</span>
                      </div>
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-lg p-3 ${
                        message.isUser 
                          ? 'bg-green-500/20 text-white border border-green-500/30' 
                          : 'bg-gray-800/50 text-gray-100 border border-gray-700/50'
                      }`}>
                        <div className="flex items-start space-x-2">
                          {message.isUser ? (
                            <User className="w-4 h-4 mt-1 text-green-400 flex-shrink-0" />
                          ) : (
                            <Bot className="w-4 h-4 mt-1 text-green-400 flex-shrink-0" />
                          )}
                          <div className="text-sm sm:text-base leading-relaxed">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg p-3 bg-gray-800/50 border border-gray-700/50">
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

                {/* Input Area */}
                <div className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask your fitness coach..."
                    className="flex-1 bg-gray-800 border-green-500/30 text-white placeholder:text-gray-400 focus:border-green-400"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="bg-green-500 hover:bg-green-600 text-white px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default CoachGPT;
