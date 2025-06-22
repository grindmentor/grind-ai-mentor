import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Brain, ArrowLeft, Send } from "lucide-react";
import { useState } from "react";

interface CoachGPTProps {
  onBack: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CoachGPT = ({ onBack }: CoachGPTProps) => {
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

What would you like to know?`
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [promptsUsed, setPromptsUsed] = useState(0);
  const maxPrompts = 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || promptsUsed >= maxPrompts) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setPromptsUsed(prev => prev + 1);

    try {
      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: { 
          type: 'coaching',
          userInput: userMessage
        }
      });

      if (error) throw error;
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error getting coaching advice:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try asking your question again.' 
      }]);
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
        <Badge className={`${promptsUsed >= maxPrompts ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
          {promptsUsed}/{maxPrompts} prompts used
        </Badge>
      </div>

      {promptsUsed >= maxPrompts && (
        <Card className="bg-gradient-to-r from-orange-500/10 to-red-600/10 border-orange-500/30">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Prompt Limit Reached</h3>
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
            Ask any fitness question and get science-backed answers (excludes specific training programs & meal plans)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gray-800 rounded-lg">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white' 
                    : 'bg-gray-700 text-gray-100'
                }`}>
                  <pre className="whitespace-pre-wrap text-sm">{message.content}</pre>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-gray-100 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
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
              className="bg-gray-800 border-gray-700 text-white flex-1"
              disabled={promptsUsed >= maxPrompts}
            />
            <Button 
              type="submit" 
              disabled={!input.trim() || isLoading || promptsUsed >= maxPrompts}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
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
