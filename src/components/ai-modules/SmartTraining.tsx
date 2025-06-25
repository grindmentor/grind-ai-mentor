
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, ArrowLeft, Download, Play, MessageCircle, Zap, Target, Users, Clock } from "lucide-react";
import { useState } from "react";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import UsageIndicator from "@/components/UsageIndicator";
import { supabase } from "@/integrations/supabase/client";
import { useUserData } from "@/contexts/UserDataContext";
import FormattedAIResponse from "@/components/FormattedAIResponse";

interface SmartTrainingProps {
  onBack: () => void;
}

const SmartTraining = ({ onBack }: SmartTrainingProps) => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { canUseFeature, incrementUsage } = useUsageTracking();
  const { getCleanUserContext } = useUserData();

  const examplePrompts = [
    {
      icon: <Users className="w-4 h-4" />,
      title: "Beginner Muscle Building",
      prompt: "I'm a beginner who wants to build muscle mass with 3 workouts per week"
    },
    {
      icon: <Target className="w-4 h-4" />,
      title: "Strength Training",
      prompt: "Advanced lifter looking to increase bench press, squat, and deadlift strength"
    },
    {
      icon: <Dumbbell className="w-4 h-4" />,
      title: "Home Workouts",
      prompt: "Home workouts with dumbbells only, goal is weight loss and toning"
    },
    {
      icon: <Zap className="w-4 h-4" />,
      title: "Powerlifting Prep",
      prompt: "Powerlifting program for competition prep, 5 days per week available"
    }
  ];

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !canUseFeature('training_programs')) return;
    
    const success = await incrementUsage('training_programs');
    if (!success) return;
    
    setIsLoading(true);
    
    try {
      const userContext = getCleanUserContext();
      const enhancedInput = `${input}

${userContext}`;

      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: { 
          type: 'training',
          userInput: enhancedInput
        }
      });

      if (error) throw error;
      setResponse(data.response);
    } catch (error) {
      console.error('Error generating training program:', error);
      setResponse('Sorry, there was an error generating your training program. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-indigo-900">
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
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Dumbbell className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
                    Smart Training
                  </h1>
                  <p className="text-slate-400 text-lg">Evidence-based workout programs with scientific backing</p>
                </div>
              </div>
            </div>
            
            <UsageIndicator featureKey="training_programs" featureName="Training Programs" compact />
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 px-4 py-2 text-sm">
              <Zap className="w-4 h-4 mr-2" />
              All programs based on peer-reviewed exercise science research
            </Badge>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-xl flex items-center">
                  <MessageCircle className="w-5 h-5 mr-3 text-purple-400" />
                  Create Training Program
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Describe your goals, experience level, and available equipment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Example Prompts */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium flex items-center">
                    <Target className="w-4 h-4 mr-2 text-purple-400" />
                    Training Templates
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {examplePrompts.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => handleExampleClick(example.prompt)}
                        className="text-left p-4 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-200 group"
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="text-purple-400 group-hover:text-purple-300 transition-colors">
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
                    placeholder="Describe your training goals, experience level, available equipment, and time commitment..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white min-h-32 focus:border-purple-500 transition-colors resize-none"
                    disabled={!canUseFeature('training_programs')}
                  />
                  <Button 
                    type="submit" 
                    disabled={!input.trim() || isLoading || !canUseFeature('training_programs')}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/25"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Program...
                      </>
                    ) : (
                      <>
                        <Dumbbell className="w-4 h-4 mr-2" />
                        Generate Training Program
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
                  <Play className="w-5 h-5 mr-3 text-purple-400" />
                  Your Training Program
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Science-backed programs with research citations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {response ? (
                  <div className="space-y-6">
                    {/* Action Button */}
                    <div className="flex items-center justify-between">
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        <Play className="w-3 h-3 mr-1" />
                        Program Ready
                      </Badge>
                      <Button 
                        onClick={() => {
                          const element = document.createElement('a');
                          const file = new Blob([response], { type: 'text/plain' });
                          element.href = URL.createObjectURL(file);
                          element.download = 'training-program.txt';
                          document.body.appendChild(element);
                          element.click();
                          document.body.removeChild(element);
                        }}
                        variant="outline" 
                        size="sm"
                        className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-purple-500"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Program
                      </Button>
                    </div>

                    {/* Response Content */}
                    <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-6 max-h-96 overflow-y-auto">
                      <FormattedAIResponse content={response} />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Dumbbell className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-white font-medium mb-2">Ready to Build Your Program</h3>
                    <p className="text-slate-400 text-sm">
                      Enter your training goals to get your personalized program
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

export default SmartTraining;
