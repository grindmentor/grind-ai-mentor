
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ChefHat, ArrowLeft, Download, Sparkles, Utensils, Clock, Users, History } from 'lucide-react';
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import FeatureGate from "@/components/FeatureGate";
import UsageIndicator from "@/components/UsageIndicator";
import { supabase } from "@/integrations/supabase/client";
import { useUserData } from "@/contexts/UserDataContext";
import FormattedAIResponse from "@/components/FormattedAIResponse";
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';

interface MealPlanAIProps {
  onBack: () => void;
}

const MealPlanAI: React.FC<MealPlanAIProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { canUseFeature, incrementUsage } = useUsageTracking();
  const { getCleanUserContext } = useUserData();
  const { canUse } = useFeatureAccess('meal_plan_generator');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !canUse) return;
    
    const success = await incrementUsage('meal_plan_generations');
    if (!success) return;
    
    setIsLoading(true);
    
    try {
      const userContext = getCleanUserContext();
      const enhancedInput = `Create a comprehensive, science-based meal plan based on the request: ${input}

User Context: ${userContext}

Please provide detailed meal plans with nutritional information, portion sizes, and preparation instructions.`;

      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: { 
          prompt: enhancedInput,
          feature: 'meal_plan_generator'
        }
      });

      if (error) throw error;
      
      if (data && data.response) {
        setResponse(data.response);
        toast.success('Meal plan generated successfully!');
      } else {
        throw new Error('No response received');
      }
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast.error('Failed to generate meal plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FeatureGate featureKey="meal_plan_generator" previewMode={!canUse}>
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/20 to-orange-700 animate-fade-in">
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
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500/20 to-orange-700/40 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25 border border-orange-400/20">
                    <ChefHat className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                      Meal Plan Generator
                    </h1>
                    <p className="text-slate-400 text-lg">Science-based nutrition planning</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <UsageIndicator featureKey="meal_plan_generations" featureName="Meal Plans" compact />
              </div>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Panel */}
              <Card className="bg-slate-900/30 border-slate-700/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white text-xl flex items-center">
                    <Utensils className="w-5 h-5 mr-3 text-orange-400" />
                    Meal Plan Request
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Describe your nutrition goals and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="E.g., Create a 2000-calorie meal plan for muscle building with high protein, moderate carbs, and healthy fats. I'm vegetarian and prefer 4 meals per day..."
                      className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 min-h-[120px] resize-none focus:border-orange-500 focus:ring-orange-500/20"
                      disabled={!canUse}
                    />
                    
                    <Button 
                      type="submit" 
                      disabled={!input.trim() || isLoading || !canUse}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white font-medium py-3 shadow-lg shadow-orange-500/25 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Generating Meal Plan...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4" />
                          <span>Generate Meal Plan</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Response Panel */}
              <Card className="bg-slate-900/30 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-xl flex items-center">
                    <ChefHat className="w-5 h-5 mr-3 text-orange-400" />
                    Your Meal Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {response ? (
                    <div className="space-y-4">
                      <div className="max-h-96 overflow-y-auto">
                        <FormattedAIResponse content={response} />
                      </div>
                      <Button 
                        onClick={() => {
                          const element = document.createElement('a');
                          const file = new Blob([response], { type: 'text/plain' });
                          element.href = URL.createObjectURL(file);
                          element.download = 'meal-plan.txt';
                          document.body.appendChild(element);
                          element.click();
                          document.body.removeChild(element);
                          toast.success('Meal plan downloaded!');
                        }}
                        className="w-full bg-orange-600/20 hover:bg-orange-700/30 border border-orange-500/30 text-orange-300"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Meal Plan
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ChefHat className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-400">Your personalized meal plan will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
};

export default MealPlanAI;
