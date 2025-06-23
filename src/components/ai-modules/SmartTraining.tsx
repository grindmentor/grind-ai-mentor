
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, ArrowLeft, Download, Play, MessageCircle } from "lucide-react";
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
  const { getPrefilledData } = useUserData();

  const examplePrompts = [
    "I'm a beginner who wants to build muscle mass with 3 workouts per week",
    "Advanced lifter looking to increase bench press, squat, and deadlift strength",
    "Home workouts with dumbbells only, goal is weight loss and toning",
    "Powerlifting program for competition prep, 5 days per week available"
  ];

  const handleExampleClick = (prompt: string) => {
    const userData = getPrefilledData();
    let enhancedPrompt = prompt;
    
    if (userData.experience) {
      enhancedPrompt += ` (Experience level: ${userData.experience})`;
    }
    if (userData.goal) {
      enhancedPrompt += ` (Primary goal: ${userData.goal})`;
    }
    if (userData.activity) {
      enhancedPrompt += ` (Activity level: ${userData.activity})`;
    }
    
    setInput(enhancedPrompt);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !canUseFeature('training_programs')) return;
    
    const success = await incrementUsage('training_programs');
    if (!success) return;
    
    setIsLoading(true);
    
    try {
      const userData = getPrefilledData();
      const enhancedInput = `${input}

User Profile:
- Weight: ${userData.weight || 'Not specified'} ${userData.weightUnit}
- Height: ${userData.height || 'Not specified'} ${userData.heightUnit}
- Age: ${userData.age || 'Not specified'}
- Experience: ${userData.experience || 'Not specified'}
- Activity Level: ${userData.activity || 'Not specified'}
- Primary Goal: ${userData.goal || 'Not specified'}`;

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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-gray-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Smart Training</h1>
            <p className="text-gray-400">Evidence-based workout programs with scientific backing</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
          All programs based on peer-reviewed exercise science research
        </Badge>
        <UsageIndicator featureKey="training_programs" featureName="Training Programs" compact />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Create Training Program</CardTitle>
            <CardDescription className="text-gray-400">
              Describe your goals, experience level, and available equipment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-white font-medium flex items-center">
                <MessageCircle className="w-4 h-4 mr-2" />
                Example Prompts
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
                placeholder="Describe your training goals, experience level, available equipment, and time commitment..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white min-h-32"
                disabled={!canUseFeature('training_programs')}
              />
              <Button 
                type="submit" 
                disabled={!input.trim() || isLoading || !canUseFeature('training_programs')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                {isLoading ? "Creating Program..." : "Generate Training Program"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Your Training Program</CardTitle>
            <CardDescription className="text-gray-400">
              Science-backed programs with research citations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {response ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
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
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
                <div className="max-h-96 overflow-y-auto bg-gray-800 p-4 rounded-lg">
                  <FormattedAIResponse content={response} />
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                Enter your training goals above to get your personalized program
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SmartTraining;
