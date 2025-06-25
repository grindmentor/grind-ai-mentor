
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Utensils, ArrowLeft, MessageCircle, Download, Save, History, Sparkles, Clock, Target } from "lucide-react";
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
    {
      icon: <Target className="w-4 h-4" />,
      title: "Muscle Building",
      prompt: "I'm 25 years old, 180lbs, want to build muscle while staying lean, vegetarian"
    },
    {
      icon: <Sparkles className="w-4 h-4" />,
      title: "Weight Loss",
      prompt: "Weight loss meal plan, 1800 calories, avoid dairy and gluten"
    },
    {
      icon: <Clock className="w-4 h-4" />,
      title: "High Protein",
      prompt: "High-protein meals for strength training, 200g protein daily target"
    },
    {
      icon: <Utensils className="w-4 h-4" />,
      title: "Meal Prep",
      prompt: "Meal prep friendly options for busy schedule, balanced nutrition"
    }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
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
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <Utensils className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                    MealPlan AI
                  </h1>
                  <p className="text-slate-400 text-lg">Science-backed personalized nutrition plans</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <UsageIndicator 
                featureKey="meal_plan_generations" 
                featureName="Meal Plans" 
                compact={true} 
              />
              <Button
                variant="outline"
                onClick={() => setShowHistory(!showHistory)}
                className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-emerald-500 transition-all duration-200"
              >
                <History className="w-4 h-4 mr-2" />
                History ({savedPlans.length})
              </Button>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              All recommendations backed by peer-reviewed research
            </Badge>
          </div>

          {/* History Panel */}
          {showHistory && (
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <History className="w-5 h-5 mr-2 text-emerald-400" />
                  Saved Meal Plans
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Your previously generated meal plans
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {savedPlans.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-200">
                      <div>
                        <p className="text-white font-medium">{plan.title}</p>
                        <p className="text-slate-400 text-sm">
                          {new Date(plan.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => loadMealPlan(plan)}
                        variant="outline"
                        size="sm"
                        className="border-emerald-600 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all duration-200"
                      >
                        Load Plan
                      </Button>
                    </div>
                  ))}
                  {savedPlans.length === 0 && (
                    <p className="text-slate-500 text-center py-8">No saved meal plans yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-xl flex items-center">
                  <MessageCircle className="w-5 h-5 mr-3 text-emerald-400" />
                  Create Your Meal Plan
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Describe your dietary preferences, restrictions, and goals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Example Prompts */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-emerald-400" />
                    Quick Start Templates
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {examplePrompts.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => handleExampleClick(example.prompt)}
                        className="text-left p-4 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-200 group"
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="text-emerald-400 group-hover:text-emerald-300 transition-colors">
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
                    placeholder="Describe your nutrition goals, dietary preferences, restrictions, and lifestyle factors..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white min-h-32 focus:border-emerald-500 transition-colors resize-none"
                    disabled={!canGenerate}
                  />
                  <Button 
                    type="submit" 
                    disabled={!input.trim() || isLoading || !canGenerate}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating Plan...
                      </>
                    ) : (
                      <>
                        <Utensils className="w-4 h-4 mr-2" />
                        Generate Meal Plan
                      </>
                    )}
                  </Button>
                  {!canGenerate && (
                    <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      You've reached your monthly limit. Upgrade to continue using this feature.
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-xl flex items-center">
                  <Target className="w-5 h-5 mr-3 text-emerald-400" />
                  Your Personalized Plan
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Science-backed recommendations with research citations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {response ? (
                  <div className="space-y-6">
                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Plan Ready
                      </Badge>
                      <div className="flex space-x-3">
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
                          className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-emerald-500"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button 
                          onClick={saveMealPlan}
                          variant="outline" 
                          size="sm"
                          className="border-emerald-600 text-emerald-400 hover:bg-emerald-600 hover:text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Plan
                        </Button>
                      </div>
                    </div>
                    
                    {/* Title Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Plan Title</label>
                      <input
                        type="text"
                        placeholder="Enter a title for this meal plan..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-3 bg-slate-800/50 border border-slate-600 text-white rounded-xl focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    {/* Response Content */}
                    <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-6 max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-slate-300 text-sm leading-relaxed">{response}</pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Utensils className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-white font-medium mb-2">Ready to Create Your Plan</h3>
                    <p className="text-slate-400 text-sm">
                      Enter your requirements to get your personalized meal plan
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
