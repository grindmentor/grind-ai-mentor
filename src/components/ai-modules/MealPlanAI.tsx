
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Utensils, Target, Clock, ChefHat } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/ui/page-transition";
import { useIsMobile } from "@/hooks/use-mobile";

interface MealPlanAIProps {
  onBack: () => void;
}

interface MealPlan {
  id: string;
  meals: any[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  createdAt: Date;
}

const MealPlanAI = ({ onBack }: MealPlanAIProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isGenerating, setIsGenerating] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [preferences, setPreferences] = useState({
    calorieGoal: '',
    proteinGoal: '',
    dietType: '',
    allergies: '',
    mealsPerDay: '3'
  });

  const generateMealPlan = async () => {
    if (!user || !preferences.calorieGoal) {
      toast({
        title: "Missing information",
        description: "Please fill in your calorie goal.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate AI meal plan generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockMeals = [
        {
          name: "Overnight Oats with Berries",
          type: "Breakfast",
          calories: 320,
          protein: 12,
          carbs: 45,
          fat: 8,
          ingredients: ["Oats", "Greek yogurt", "Berries", "Honey"]
        },
        {
          name: "Grilled Chicken Salad",
          type: "Lunch", 
          calories: 450,
          protein: 35,
          carbs: 25,
          fat: 18,
          ingredients: ["Chicken breast", "Mixed greens", "Avocado", "Olive oil"]
        },
        {
          name: "Salmon with Quinoa",
          type: "Dinner",
          calories: 520,
          protein: 38,
          carbs: 40,
          fat: 22,
          ingredients: ["Salmon fillet", "Quinoa", "Broccoli", "Lemon"]
        }
      ];

      const totalCalories = mockMeals.reduce((sum, meal) => sum + meal.calories, 0);
      const totalProtein = mockMeals.reduce((sum, meal) => sum + meal.protein, 0);
      const totalCarbs = mockMeals.reduce((sum, meal) => sum + meal.carbs, 0);
      const totalFat = mockMeals.reduce((sum, meal) => sum + meal.fat, 0);

      const generatedPlan: MealPlan = {
        id: Date.now().toString(),
        meals: mockMeals,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        createdAt: new Date()
      };

      setMealPlan(generatedPlan);

      toast({
        title: "Meal plan generated!",
        description: "Your personalized meal plan is ready.",
      });
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast({
        title: "Error",
        description: "Failed to generate meal plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-black via-yellow-900/10 to-orange-800/20 text-white">
        <div className="p-3 sm:p-4 md:p-6">
          <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="text-white hover:bg-yellow-500/20 backdrop-blur-sm w-fit"
                size={isMobile ? "sm" : "default"}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {isMobile ? "Back" : "Back to Dashboard"}
              </Button>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-yellow-500/20 to-orange-600/40 backdrop-blur-sm rounded-xl flex items-center justify-center border border-yellow-400/20">
                  <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    Meal Plan Generator
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-400">AI-powered nutrition planning</p>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center sm:justify-start">
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                <Utensils className="w-3 h-3 mr-1" />
                Personalized Nutrition
              </Badge>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Input Panel */}
              <Card className="bg-gray-900/40 backdrop-blur-sm border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Target className="w-5 h-5 mr-2 text-yellow-400" />
                    Meal Plan Preferences
                  </CardTitle>
                  <CardDescription>
                    Tell us your goals and preferences for a personalized meal plan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Daily Calorie Goal</Label>
                      <Input
                        type="number"
                        placeholder="2000"
                        value={preferences.calorieGoal}
                        onChange={(e) => setPreferences({...preferences, calorieGoal: e.target.value})}
                        className="bg-gray-800 border-yellow-500/30 text-white focus:border-yellow-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Protein Goal (g)</Label>
                      <Input
                        type="number"  
                        placeholder="150"
                        value={preferences.proteinGoal}
                        onChange={(e) => setPreferences({...preferences, proteinGoal: e.target.value})}
                        className="bg-gray-800 border-yellow-500/30 text-white focus:border-yellow-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Diet Type</Label>
                    <Select value={preferences.dietType} onValueChange={(value) => setPreferences({...preferences, dietType: value})}>
                      <SelectTrigger className="bg-gray-800 border-yellow-500/30 text-white">
                        <SelectValue placeholder="Select diet type" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-yellow-500/30">
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="high-protein">High Protein</SelectItem>
                        <SelectItem value="low-carb">Low Carb</SelectItem>
                        <SelectItem value="vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="vegan">Vegan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Meals Per Day</Label>
                    <Select value={preferences.mealsPerDay} onValueChange={(value) => setPreferences({...preferences, mealsPerDay: value})}>
                      <SelectTrigger className="bg-gray-800 border-yellow-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-yellow-500/30">
                        <SelectItem value="3">3 Meals</SelectItem>
                        <SelectItem value="4">4 Meals</SelectItem>
                        <SelectItem value="5">5 Meals</SelectItem>
                        <SelectItem value="6">6 Meals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Allergies/Restrictions</Label>
                    <Input
                      placeholder="e.g., nuts, dairy, gluten"
                      value={preferences.allergies}
                      onChange={(e) => setPreferences({...preferences, allergies: e.target.value})}
                      className="bg-gray-800 border-yellow-500/30 text-white focus:border-yellow-400"
                    />
                  </div>

                  <Button 
                    onClick={generateMealPlan}
                    disabled={!preferences.calorieGoal || isGenerating}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating Plan...
                      </>
                    ) : (
                      <>
                        <ChefHat className="w-4 h-4 mr-2" />
                        Generate Meal Plan
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Results Panel */}
              <Card className="bg-gray-900/40 backdrop-blur-sm border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-yellow-400" />
                    Your Meal Plan
                  </CardTitle>
                  <CardDescription>
                    Personalized nutrition plan based on your goals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {mealPlan ? (
                    <div className="space-y-6">
                      {/* Nutrition Summary */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-yellow-400">{mealPlan.totalCalories}</div>
                          <div className="text-xs text-gray-400">Total Calories</div>
                        </div>
                        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-orange-400">{mealPlan.totalProtein}g</div>
                          <div className="text-xs text-gray-400">Protein</div>
                        </div>
                      </div>

                      {/* Meals */}
                      <div className="space-y-4">
                        {mealPlan.meals.map((meal, index) => (
                          <div key={index} className="bg-gray-800/20 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-white">{meal.name}</h4>
                              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                                {meal.type}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 mb-2">
                              <span>{meal.calories} cal</span>
                              <span>{meal.protein}g protein</span>
                              <span>{meal.carbs}g carbs</span>
                              <span>{meal.fat}g fat</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {meal.ingredients.join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ChefHat className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500 mx-auto mb-4 opacity-50" />
                      <h3 className="text-white font-medium mb-2">Ready to Generate</h3>
                      <p className="text-gray-400 text-sm">
                        Set your preferences and generate your personalized meal plan
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default MealPlanAI;
