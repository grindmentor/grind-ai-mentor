
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Moon, ArrowLeft, Download, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import UsageIndicator from "@/components/UsageIndicator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RecoveryCoachProps {
  onBack: () => void;
}

const RecoveryCoach = ({ onBack }: RecoveryCoachProps) => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { canUseFeature, incrementUsage } = useUsageTracking();
  const { toast } = useToast();

  const examplePrompts = [
    "I sleep 5-6 hours per night and feel constantly tired, help optimize my recovery",
    "High stress levels affecting my workouts, need recovery and stress management plan",
    "Sore muscles after workouts, what's the best recovery protocol?",
    "How to optimize sleep and recovery for shift work schedule?"
  ];

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !canUseFeature('coach_gpt_queries')) return;
    
    const success = await incrementUsage('coach_gpt_queries');
    if (!success) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: { 
          type: 'recovery',
          userInput: input
        }
      });

      if (error) throw error;
      setResponse(data.response);
      
      // Show success toast
      toast({
        title: "Recovery Plan Generated!",
        description: "Your personalized recovery protocol is ready with research citations.",
      });
    } catch (error) {
      console.error('Error getting recovery advice:', error);
      setResponse('Sorry, there was an error generating your recovery plan. Please try again.');
      
      // Show error toast
      toast({
        title: "Error generating recovery plan",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([response], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'recovery-plan.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    // Show download toast
    toast({
      title: "Recovery Plan Downloaded!",
      description: "Your plan has been saved to your device.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-gray-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
            <Moon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Recovery Coach</h1>
            <p className="text-gray-400">Science-backed recovery and sleep optimization</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
          All recovery protocols based on sleep science and recovery research
        </Badge>
        <UsageIndicator featureKey="coach_gpt_queries" featureName="Recovery Sessions" compact />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Get Recovery Guidance</CardTitle>
            <CardDescription className="text-gray-400">
              Describe your recovery challenges, sleep patterns, and stress levels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-white font-medium flex items-center">
                <MessageCircle className="w-4 h-4 mr-2" />
                Example Recovery Questions
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {examplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(prompt)}
                    className="text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Tell me about your sleep quality, recovery challenges, stress levels, training intensity..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white min-h-32"
                disabled={!canUseFeature('coach_gpt_queries')}
              />
              <Button 
                type="submit" 
                disabled={!input.trim() || isLoading || !canUseFeature('coach_gpt_queries')}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                <Moon className="w-4 h-4 mr-2" />
                {isLoading ? "Analyzing Recovery..." : "Get Recovery Plan"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Your Recovery Protocol</CardTitle>
            <CardDescription className="text-gray-400">
              Evidence-based recovery strategies with research citations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {response ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Recovery Plan Ready
                  </Badge>
                  <Button 
                    onClick={handleDownload}
                    variant="outline" 
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
                <div className="text-gray-300 space-y-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">{response}</pre>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                <Moon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p>Enter your recovery concerns above to get your personalized plan</p>
                <p className="text-sm mt-2">Science-backed sleep and recovery optimization</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecoveryCoach;
