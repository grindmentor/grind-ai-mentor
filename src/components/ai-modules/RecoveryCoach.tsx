
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Moon, ArrowLeft, Download, MessageCircle, Sparkles, Brain, Heart, Zap } from "lucide-react";
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
    {
      icon: <Moon className="w-4 h-4" />,
      title: "Sleep Optimization",
      prompt: "I sleep 5-6 hours per night and feel constantly tired, help optimize my recovery"
    },
    {
      icon: <Brain className="w-4 h-4" />,
      title: "Stress Management",
      prompt: "High stress levels affecting my workouts, need recovery and stress management plan"
    },
    {
      icon: <Heart className="w-4 h-4" />,
      title: "Muscle Recovery",
      prompt: "Sore muscles after workouts, what's the best recovery protocol?"
    },
    {
      icon: <Zap className="w-4 h-4" />,
      title: "Shift Work Recovery",
      prompt: "How to optimize sleep and recovery for shift work schedule?"
    }
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
      
      toast({
        title: "Recovery Plan Generated!",
        description: "Your personalized recovery protocol is ready with research citations.",
      });
    } catch (error) {
      console.error('Error getting recovery advice:', error);
      setResponse('Sorry, there was an error generating your recovery plan. Please try again.');
      
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
    
    toast({
      title: "Recovery Plan Downloaded!",
      description: "Your plan has been saved to your device.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-black to-blue-900">
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={onBack} 
                className="text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Dashboard
              </Button>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <Moon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent">
                    Recovery Coach
                  </h1>
                  <p className="text-slate-400 text-lg">Science-backed recovery and sleep optimization</p>
                </div>
              </div>
            </div>
            
            <UsageIndicator featureKey="coach_gpt_queries" featureName="Recovery Sessions" compact />
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              All recovery protocols based on sleep science and recovery research
            </Badge>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-xl flex items-center">
                  <MessageCircle className="w-5 h-5 mr-3 text-indigo-400" />
                  Get Recovery Guidance
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Describe your recovery challenges, sleep patterns, and stress levels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Example Prompts */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium flex items-center">
                    <Brain className="w-4 h-4 mr-2 text-indigo-400" />
                    Recovery Focus Areas
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {examplePrompts.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => handleExampleClick(example.prompt)}
                        className="text-left p-4 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-200 group"
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="text-indigo-400 group-hover:text-indigo-300 transition-colors">
                            {example.icon}
                          </div>
                          <span className="text-white font-medium">{example.title}</span>
                        </div>
                        <p className="text-slate-400 text-sm">"{example.prompt}"</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Textarea
                    placeholder="Tell me about your sleep quality, recovery challenges, stress levels, training intensity..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white min-h-32 focus:border-indigo-500 transition-colors resize-none"
                    disabled={!canUseFeature('coach_gpt_queries')}
                  />
                  <Button 
                    type="submit" 
                    disabled={!input.trim() || isLoading || !canUseFeature('coach_gpt_queries')}
                    className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing Recovery...
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 mr-2" />
                        Get Recovery Plan
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-xl flex items-center">
                  <Sparkles className="w-5 h-5 mr-3 text-indigo-400" />
                  Your Recovery Protocol
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Evidence-based recovery strategies with research citations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {response ? (
                  <div className="space-y-6">
                    {/* Action Button */}
                    <div className="flex items-center justify-between">
                      <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                        <Moon className="w-3 h-3 mr-1" />
                        Recovery Plan Ready
                      </Badge>
                      <Button 
                        onClick={handleDownload}
                        variant="outline" 
                        size="sm"
                        className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-indigo-500"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Plan
                      </Button>
                    </div>

                    {/* Response Content */}
                    <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-6 max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-slate-300 text-sm leading-relaxed">{response}</pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Moon className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-white font-medium mb-2">Ready to Optimize Recovery</h3>
                    <p className="text-slate-400 text-sm mb-2">
                      Enter your recovery concerns to get your personalized plan
                    </p>
                    <p className="text-slate-500 text-xs">
                      Science-backed sleep and recovery optimization
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecoveryCoach;
