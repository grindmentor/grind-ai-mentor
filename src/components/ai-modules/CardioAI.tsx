import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, ArrowLeft, Download, Play, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import UsageIndicator from "@/components/UsageIndicator";

interface CardioAIProps {
  onBack: () => void;
}

const CardioAI = ({ onBack }: CardioAIProps) => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { canUseFeature, incrementUsage } = useUsageTracking();

  const examplePrompts = [
    "I want to lose weight with 30 minutes of cardio, 4 times per week",
    "Training for a 5K race in 3 months, currently can run 2 miles",
    "High-intensity cardio for fat loss, prefer cycling and rowing",
    "Low-impact cardio due to knee issues, goal is cardiovascular health"
  ];

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
  };

  const normalizeInput = (text: string) => {
    const corrections: { [key: string]: string } = {
      'cardio': 'cardiovascular',
      'waight': 'weight',
      'loose': 'lose',
      'runing': 'running',
      'bycicle': 'bicycle',
      'excersize': 'exercise',
      'enduranse': 'endurance',
      'intreval': 'interval'
    };

    let normalized = text.toLowerCase();
    Object.entries(corrections).forEach(([wrong, correct]) => {
      normalized = normalized.replace(new RegExp(wrong, 'g'), correct);
    });
    
    return normalized;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !canUseFeature('training_programs')) return;
    
    const success = await incrementUsage('training_programs');
    if (!success) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: { 
          type: 'cardio',
          userInput: input
        }
      });

      if (error) throw error;
      setResponse(data.response);
    } catch (error) {
      console.error('Error generating cardio program:', error);
      setResponse('Sorry, there was an error generating your cardio program. Please try again.');
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
          <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">CardioAI</h1>
            <p className="text-gray-400">Science-based cardiovascular training programs</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
          All programs based on cardiovascular exercise science research
        </Badge>
        <UsageIndicator featureKey="training_programs" featureName="Cardio Programs" compact />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Create Cardio Program</CardTitle>
            <CardDescription className="text-gray-400">
              Describe your cardio goals, fitness level, and available equipment
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
                placeholder="Describe your cardiovascular goals, current fitness level, preferred activities, and time availability..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white min-h-32"
                disabled={!canUseFeature('training_programs')}
              />
              <Button 
                type="submit" 
                disabled={!input.trim() || isLoading || !canUseFeature('training_programs')}
                className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
              >
                <Heart className="w-4 h-4 mr-2" />
                {isLoading ? "Creating Program..." : "Generate Cardio Program"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Your Cardio Program</CardTitle>
            <CardDescription className="text-gray-400">
              Evidence-based cardiovascular training with research citations
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
                      element.download = 'cardio-program.txt';
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
                <div className="text-gray-300 space-y-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">{response}</pre>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                <Heart className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p>Enter your cardio goals above to get your personalized program</p>
                <p className="text-sm mt-2">Science-backed training plans with heart rate zones</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CardioAI;
