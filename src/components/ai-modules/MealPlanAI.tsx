import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Utensils, ArrowLeft, MessageCircle, Download, Save, History } from "lucide-react";
import { useState, useEffect } from "react";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import UsageIndicator from "@/components/UsageIndicator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface MealPlanAIProps {
  onBack: () => void;
}

interface MealPlan {
  id: string;
  title: string;
  content: string;
  user_requirements: string;
  created_at: string;
}

const MealPlanAI = ({ onBack }: MealPlanAIProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [savedPlans, setSavedPlans] = useState<MealPlan[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { canUseFeature, incrementUsage, userTier } = useUsageTracking();

  const canGenerate = canUseFeature('meal_plan_generations');

  useEffect(() => {
    if (user) {
      loadSavedPlans();
    }
  }, [user]);

  const loadSavedPlans = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedPlans(data || []);
    } catch (error) {
      console.error('Error loading meal plans:', error);
    }
  };

  const saveMealPlan = async () => {
    if (!user || !response || !title.trim()) {
      toast({
        title: "Missing information",
        description: "Please add a title for your meal plan.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          title: title.trim(),
          content: response,
          user_requirements: input
        });

      if (error) throw error;

      toast({
        title: "Meal plan saved!",
        description: "Your meal plan has been saved to your profile.",
      });

      setTitle("");
      await loadSavedPlans();
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast({
        title: "Error saving meal plan",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadMealPlan = (plan: MealPlan) => {
    setInput(plan.user_requirements || "");
    setResponse(plan.content);
    setTitle(plan.title);
    setShowHistory(false);
  };

  const examplePrompts = [
    "I'm 25 years old, 180lbs, want to build muscle while staying lean, vegetarian",
    "Weight loss meal plan, 1800 calories, avoid dairy and gluten",
    "High-protein meals for strength training, 200g protein daily target",
    "Meal prep friendly options for busy schedule, balanced nutrition"
  ];

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !canGenerate) return;
    
    setIsLoading(true);
    
    const success = await incrementUsage('meal_plan_generations');
    if (!success) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: { 
          type: 'nutrition',
          userInput: input
        }
      });

      if (error) throw error;
      setResponse(data.response);
      
      // Generate a default title based on input
      const words = input.split(' ').slice(0, 4);
      setTitle(`Meal Plan - ${words.join(' ')}`);
    } catch (error) {
      console.error('Error generating meal plan:', error);
      setResponse('Sorry, there was an error generating your meal plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-gray-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">MealPlanAI</h1>
            <p className="text-gray-400">Science-backed personalized nutrition plans</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
          All recommendations backed by peer-reviewed research
        </Badge>
        <UsageIndicator 
          featureKey="meal_plan_generations" 
          featureName="Meal Plans" 
          compact={true} 
        />
        <Button
          variant="outline"
          onClick={() => setShowHistory(!showHistory)}
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          <History className="w-4 h-4 mr-2" />
          History ({savedPlans.length})
        </Button>
      </div>

      {showHistory && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Saved Meal Plans</CardTitle>
            <CardDescription className="text-gray-400">
              Your previously generated meal plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {savedPlans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{plan.title}</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(plan.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => loadMealPlan(plan)}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Load
                  </Button>
                </div>
              ))}
              {savedPlans.length === 0 && (
                <p className="text-gray-500 text-center py-4">No saved meal plans yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Create Your Meal Plan</CardTitle>
            <CardDescription className="text-gray-400">
              Describe your dietary preferences, restrictions, and goals
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
                placeholder="Describe your nutrition goals, dietary preferences, restrictions, and lifestyle factors..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white min-h-32"
                disabled={!canGenerate}
              />
              <Button 
                type="submit" 
                disabled={!input.trim() || isLoading || !canGenerate}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                {isLoading ? "Generating Plan..." : "Generate Meal Plan"}
              </Button>
              {!canGenerate && (
                <p className="text-red-400 text-sm text-center">
                  You've reached your monthly limit. Upgrade to continue using this feature.
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Your Personalized Plan</CardTitle>
            <CardDescription className="text-gray-400">
              Science-backed recommendations with research citations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {response ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Plan Ready
                  </Badge>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => {
                        const element = document.createElement('a');
                        const file = new Blob([response], { type: 'text/plain' });
                        element.href = URL.createObjectURL(file);
                        element.download = `${title || 'meal-plan'}.txt`;
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
                    <Button 
                      onClick={saveMealPlan}
                      variant="outline" 
                      size="sm"
                      className="border-green-600 text-green-300 hover:bg-green-800"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
                
                {response && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Enter a title for this meal plan..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-2 bg-gray-800 border border-gray-700 text-white rounded"
                    />
                  </div>
                )}

                <div className="text-gray-300 space-y-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">{response}</pre>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                Enter your requirements above to get your personalized meal plan
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MealPlanAI;
