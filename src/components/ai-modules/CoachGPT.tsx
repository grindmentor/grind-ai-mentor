import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Brain, ArrowLeft, Send, History, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface CoachGPTProps {
  onBack: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id?: string;
}

const CoachGPT = ({ onBack }: CoachGPTProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { canUseFeature, incrementUsage, getRemainingUsage } = useUsageTracking();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I'm CoachGPT, your 24/7 AI fitness coach powered by advanced AI. All my advice is backed by scientific research and I'll provide study citations when relevant.

I can help you with:
• General fitness advice and motivation
• Exercise form and technique guidance
• Recovery and sleep optimization
• Injury prevention strategies
• Performance enhancement tips

⚠️ **Note**: I cannot provide specific training programs (use Smart Training for that) or detailed meal plans (use MealPlanAI for nutrition).

**Example questions to get started:**
• "What's the best way to improve my squat form?"
• "How much sleep do I need for optimal recovery?"
• "What are the signs of overtraining?"
• "How can I prevent lower back pain during deadlifts?"

What would you like to know?`
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId] = useState(() => crypto.randomUUID());

  const remainingUsage = getRemainingUsage('coach_gpt_queries');
  const canUse = canUseFeature('coach_gpt_queries');

  useEffect(() => {
    if (user) {
      loadConversationHistory();
    }
  }, [user]);

  const loadConversationHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('coach_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('conversation_session', currentSessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedMessages = data.map(msg => ({
          role: msg.message_role as 'user' | 'assistant',
          content: msg.message_content,
          id: msg.id
        }));
        setMessages(prev => [...prev.filter(m => m.role === 'assistant' && !m.id), ...loadedMessages]);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const saveMessage = async (role: 'user' | 'assistant', content: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('coach_conversations')
        .insert({
          user_id: user.id,
          message_role: role,
          message_content: content,
          conversation_session: currentSessionId
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const clearConversation = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('coach_conversations')
        .delete()
        .eq('user_id', user.id)
        .eq('conversation_session', currentSessionId);

      if (error) throw error;

      setMessages([{
        role: 'assistant',
        content: messages[0].content // Keep the initial message
      }]);

      toast({
        title: "Conversation cleared",
        description: "Chat history has been cleared.",
      });
    } catch (error) {
      console.error('Error clearing conversation:', error);
      toast({
        title: "Error",
        description: "Failed to clear conversation.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !canUse || isLoading) return;

    const userMessage = input;
    setInput("");
    
    const newUserMessage = { role: 'user' as const, content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    
    // Save user message
    await saveMessage('user', userMessage);
    
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: { 
          type: 'coaching',
          userInput: userMessage
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data || !data.response) {
        throw new Error('No response received from AI service');
      }
      
      // Only increment usage on successful response
      const success = await incrementUsage('coach_gpt_queries');
      if (!success) {
        toast({
          title: "Usage Limit Reached",
          description: "You've reached your monthly limit for this feature.",
          variant: "destructive",
        });
        return;
      }

      const assistantMessage = { role: 'assistant' as const, content: data.response };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Save assistant message
      await saveMessage('assistant', data.response);
      
    } catch (error) {
      console.error('Error getting coaching advice:', error);
      const errorMessage = { 
        role: 'assistant' as const, 
        content: 'Sorry, I encountered an error. Please try asking your question again. This attempt did not count towards your usage limit.' 
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-gray-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">CoachGPT</h1>
            <p className="text-gray-400">24/7 AI coaching with research citations</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
          Every response includes scientific citations and peer-reviewed research
        </Badge>
        <Badge className={`${!canUse ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
          {remainingUsage === -1 ? 'Unlimited' : `${remainingUsage} prompts left`}
        </Badge>
        {messages.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearConversation}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Chat
          </Button>
        )}
      </div>

      {!canUse && (
        <Card className="bg-gradient-to-r from-orange-500/10 to-red-600/10 border-orange-500/30">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Usage Limit Reached</h3>
            <p className="text-gray-300 mb-4">
              Upgrade to get unlimited prompts and access to all AI features
            </p>
            <Button 
              onClick={() => window.open('/pricing', '_blank')}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              Upgrade Now
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Chat with CoachGPT</CardTitle>
          <CardDescription className="text-gray-400">
            Ask any fitness question and get science-backed answers (excludes specific training programs & meal plans) - All conversations are saved
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white' 
                    : 'bg-gray-700 text-gray-100 border border-gray-600'
                }`}>
                  <pre className="whitespace-pre-wrap text-sm font-sans">{message.content}</pre>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-gray-100 p-3 rounded-lg border border-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <div className="animate-pulse">Researching scientific literature...</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              placeholder="Ask about fitness advice, exercise form, recovery... (No training programs or meal plans)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white flex-1 focus:ring-2 focus:ring-blue-500"
              disabled={!canUse || isLoading}
            />
            <Button 
              type="submit" 
              disabled={!input.trim() || isLoading || !canUse}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoachGPT;
