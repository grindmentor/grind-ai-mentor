
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Utensils, ArrowLeft, Download, Play, MessageCircle, Sparkles, Target, Users, Clock } from "lucide-react";
import { useState } from "react";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import UsageIndicator from "@/components/UsageIndicator";
import { supabase } from "@/integrations/supabase/client";
import { useUserData } from "@/contexts/UserDataContext";
import FormattedAIResponse from "@/components/FormattedAIResponse";
import { toast } from "sonner";

interface MealPlanAIProps {
  onBack: () => void;
}

const MealPlanAI = ({ onBack }: MealPlanAIProps) => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { canUseFeature, incrementUsage } = useUsageTracking();
  const { getCleanUserContext } = useUserData();

  const examplePrompts = [
    {
      icon: <Users className="w-4 h-4" />,
      title: "Weight Loss Plan",
      prompt: "I want to lose 2 pounds per week, I'm 180lbs male, moderately active"
    },
    {
      icon: <Target className="w-4 h-4" />,
      title: "Muscle Building",
      prompt: "Bulking meal plan for muscle gain, 3000 calories, high protein, no dairy"
    },
    {
      icon: <Utensils className="w-4 h-4" />,
      title: "Vegetarian Plan",
      prompt: "Vegetarian meal plan for maintenance, 2200 calories, Mediterranean style"
    },
    {
      icon: <Clock className="w-4 h-4" />,
      title: "Busy Professional",
      prompt: "Quick meal prep plan, 30 minutes max cooking time, balanced nutrition"
    }
  ];

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !canUseFeature('meal_plan_generations')) return;
    
    const success = await incrementUsage('meal_plan_generations');
    if (!success) return;
    
    setIsLoading(true);
    
    try {
      const userContext = getCleanUserContext();
      const enhancedInput = `Create a comprehensive meal plan based on the following request: ${input}

User Context: ${userContext}

Please provide:
1. Daily calorie and macro breakdown
2. Complete meal plan with recipes
3. Shopping list organized by food groups
4. Meal prep instructions and timing
5. Substitution options for flexibility
6. Nutritional analysis and benefits

Base all recommendations on current nutrition science and evidence-based dietary guidelines from 2024.`;

      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: { 
          prompt: enhancedInput,
          feature: 'meal_plan_generations'
        }
      });

      if (error) throw error;
      
      if (data.response) {
        setResponse(data.response);
        toast.success('Meal plan generated successfully!');
      } else {
        throw new Error('No response received');
      }
    } catch (error) {
      console.error('Error generating meal plan:', error);
      setResponse('Sorry, there was an error generating your meal plan. Please try again.');
      toast.error('Failed to generate meal plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([response], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'meal-plan.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast.success('Meal plan downloaded successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-green-900/20 to-green-700 animate-fade-in">
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
                <div className="w-16 h-16 bg-gradient-to-r from-green-500/20 to-green-700/40 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25 border border-green-400/20">
                  <Utensils className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    MealPlan AI
                  </h1>
                  <p className="text-slate-400 text-lg">Science-based nutrition planning</p>
                </div>
              </div>
            </div>
            
            <UsageIndicator featureKey="meal_plan_generations" featureName="Meal Plans" compact />
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              All meal plans based on evidence-based nutrition science
            </Badge>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <Card className="bg-slate-900/30 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-xl flex items-center">
                  <MessageCircle className="w-5 h-5 mr-3 text-green-400" />
                  Create Meal Plan
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Describe your goals, dietary preferences, and restrictions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Example Prompts */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium flex items-center">
                    <Target className="w-4 h-4 mr-2 text-green-400" />
                    Meal Plan Templates
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {examplePrompts.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => handleExampleClick(example.prompt)}
                        className="text-left p-4 bg-slate-800/30 hover:bg-slate-700/50 rounded-xl border border-slate-700/50 hover:border-green-500/50 transition-all duration-200 group backdrop-blur-sm"
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="text-green-400 group-hover:text-green-300 transition-colors">
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
                    placeholder="Describe your nutrition goals, dietary preferences, allergies, calorie target, and lifestyle..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="bg-slate-800/30 border-slate-600/50 text-white min-h-32 focus:border-green-500 transition-colors resize-none backdrop-blur-sm"
                    disabled={!canUseFeature('meal_plan_generations')}
                  />
                  <Button 
                    type="submit" 
                    disabled={!input.trim() || isLoading || !canUseFeature('meal_plan_generations')}
                    className="w-full bg-gradient-to-r from-green-500/80 to-emerald-600/80 hover:from-green-600/80 hover:to-emerald-700/80 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg shadow-green-500/25 backdrop-blur-sm"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Meal Plan...
                      </>
                    ) : (
                      <>
                        <Utensils className="w-4 h-4 mr-2" />
                        Generate Meal Plan
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card className="bg-slate-900/30 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-xl flex items-center">
                  <Play className="w-5 h-5 mr-3 text-green-400" />
                  Your Meal Plan
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Personalized nutrition plan with recipes and shopping list
                </CardDescription>
              </CardHeader>
              <CardContent>
                {response ? (
                  <div className="space-y-6">
                    {/* Action Button */}
                    <div className="flex items-center justify-between">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <Play className="w-3 h-3 mr-1" />
                        Meal Plan Ready
                      </Badge>
                      <Button 
                        onClick={handleDownload}
                        variant="outline" 
                        size="sm"
                        className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50 hover:border-green-500/50 backdrop-blur-sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Plan
                      </Button>
                    </div>

                    {/* Response Content */}
                    <div className="bg-slate-800/20 rounded-xl border border-slate-700/50 p-6 max-h-96 overflow-y-auto backdrop-blur-sm">
                      <FormattedAIResponse content={response} />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-slate-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Utensils className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-white font-medium mb-2">Ready to Create Your Plan</h3>
                    <p className="text-slate-400 text-sm">
                      Enter your nutrition goals to get your personalized meal plan
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

export default MealPlanAI;
