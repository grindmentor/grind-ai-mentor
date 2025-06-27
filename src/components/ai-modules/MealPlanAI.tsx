import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Utensils, Zap, Target, Calendar, Apple, Clock, Crown, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UsageLimitGuard } from '@/components/subscription/UsageLimitGuard';
import { MobileHeader } from '@/components/MobileHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSubscription } from '@/hooks/useSubscription';

interface MealPlanAIProps {
  onBack: () => void;
}

export const MealPlanAI: React.FC<MealPlanAIProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { currentTier } = useSubscription();
  const [isGenerating, setIsGenerating] = useState(false);
  const [planData, setPlanData] = useState({
    goal: '',
    dietType: '',
    calories: '',
    meals: '3',
    allergies: '',
    preferences: '',
    duration: '7'
  });
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);

  const isPaidUser = currentTier !== 'free';

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
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setSavedPlans(data || []);
    } catch (error) {
      console.error('Error loading meal plans:', error);
    }
  };

  const generateMealPlan = async () => {
    if (!user || !planData.goal || !planData.dietType) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in your goal and diet type.',
        variant: 'destructive'
      });
      return;
    }

    if (!isPaidUser) {
      toast({
        title: 'Premium Feature',
        description: 'Upgrade to generate custom meal plans',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Mock meal plan generation - in production this would call an AI service
      const mockPlan = {
        title: `${planData.dietType} ${planData.goal} Plan`,
        duration: parseInt(planData.duration),
        calories: parseInt(planData.calories) || 2000,
        meals: [
          {
            day: 'Monday',
            breakfast: {
              name: 'Protein Overnight Oats',
              calories: 350,
              macros: { protein: 25, carbs: 45, fat: 8 },
              ingredients: ['1 cup oats', '1 scoop protein powder', '1 cup almond milk', '1 tbsp chia seeds', '1/2 banana']
            },
            lunch: {
              name: 'Grilled Chicken Salad',
              calories: 450,
              macros: { protein: 35, carbs: 20, fat: 22 },
              ingredients: ['6oz chicken breast', '2 cups mixed greens', '1/4 avocado', '1 tbsp olive oil', 'cherry tomatoes']
            },
            dinner: {
              name: 'Salmon with Sweet Potato',
              calories: 500,
              macros: { protein: 40, carbs: 35, fat: 20 },
              ingredients: ['6oz salmon fillet', '1 medium sweet potato', '1 cup broccoli', '1 tsp olive oil']
            }
          },
          {
            day: 'Tuesday',
            breakfast: {
              name: 'Greek Yogurt Bowl',
              calories: 320,
              macros: { protein: 20, carbs: 35, fat: 10 },
              ingredients: ['1 cup Greek yogurt', '1/2 cup berries', '1 tbsp honey', '1 tbsp almonds']
            },
            lunch: {
              name: 'Turkey and Hummus Wrap',
              calories: 420,
              macros: { protein: 30, carbs: 40, fat: 15 },
              ingredients: ['whole wheat tortilla', '4oz turkey', '2 tbsp hummus', 'spinach', 'cucumber']
            },
            dinner: {
              name: 'Lean Beef Stir Fry',
              calories: 480,
              macros: { protein: 35, carbs: 30, fat: 18 },
              ingredients: ['5oz lean beef', '1 cup mixed vegetables', '1/2 cup brown rice', '1 tbsp sesame oil']
            }
          }
        ]
      };

      setGeneratedPlan(mockPlan);
      
      toast({
        title: 'Meal Plan Generated! 🍽️',
        description: 'Your personalized meal plan is ready!'
      });
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate meal plan. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveMealPlan = async () => {
    if (!user || !generatedPlan) return;

    try {
      const { error } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          title: generatedPlan.title,
          content: JSON.stringify(generatedPlan),
          user_requirements: `${planData.goal} - ${planData.dietType} - ${planData.calories} calories`
        });

      if (error) throw error;

      toast({
        title: 'Meal Plan Saved! 💾',
        description: 'Your meal plan has been saved to your library.'
      });

      loadSavedPlans();
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to save meal plan. Please try again.',
        variant: 'destructive'
      });
    }
  };

  if (!isPaidUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-green-950/50 to-green-900/30">
        <MobileHeader 
          title="Meal Plan AI" 
          onBack={onBack}
        />
        
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/30 backdrop-blur-sm border-green-500/30">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500/30 to-emerald-500/40 rounded-xl flex items-center justify-center border border-green-500/30">
                  <Utensils className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-lg sm:text-xl flex items-center">
                    Meal Plan AI
                    <Crown className="w-5 h-5 ml-2 text-yellow-400" />
                  </CardTitle>
                  <CardDescription className="text-green-200/80 text-sm sm:text-base">
                    Premium feature - Generate personalized meal plans
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center py-8">
                <Lock className="w-16 h-16 text-green-400/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-200 mb-2">Premium Feature</h3>
                <p className="text-green-300/70 mb-6 max-w-md mx-auto">
                  Unlock personalized meal plans with science-backed nutrition recommendations. 
                  Get custom plans tailored to your goals, dietary preferences, and restrictions.
                </p>
                
                {/* Preview Interface */}
                <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-6 mb-6 opacity-60">
                  <h4 className="text-green-200 font-medium mb-4">Preview: Sample Meal Plan</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    <div className="space-y-2">
                      <h5 className="text-green-300 font-medium text-sm">Breakfast</h5>
                      <p className="text-green-200/80 text-xs">Protein Overnight Oats</p>
                      <p className="text-green-300/60 text-xs">350 cal • 25g protein</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-green-300 font-medium text-sm">Lunch</h5>
                      <p className="text-green-200/80 text-xs">Grilled Chicken Salad</p>
                      <p className="text-green-300/60 text-xs">450 cal • 35g protein</p>
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-green-300 font-medium text-sm">Dinner</h5>
                      <p className="text-green-200/80 text-xs">Salmon with Sweet Potato</p>
                      <p className="text-green-300/60 text-xs">500 cal • 40g protein</p>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => window.location.href = '/subscription'}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <UsageLimitGuard featureKey="meal_plan_generations" featureName="Meal Plan AI">
      <div className="min-h-screen bg-gradient-to-br from-black via-green-950/50 to-green-900/30">
        <MobileHeader 
          title="Meal Plan AI" 
          onBack={onBack}
        />
        
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/30 backdrop-blur-sm border-green-500/30">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500/30 to-emerald-500/40 rounded-xl flex items-center justify-center border border-green-500/30">
                  <Utensils className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-lg sm:text-xl">Meal Plan AI</CardTitle>
                  <CardDescription className="text-green-200/80 text-sm sm:text-base">
                    Generate personalized meal plans based on your goals
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {!generatedPlan ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-green-200 text-sm sm:text-base">Primary Goal</Label>
                      <Select value={planData.goal} onValueChange={(value) => setPlanData({...planData, goal: value})}>
                        <SelectTrigger className="bg-green-900/30 border-green-500/50 text-white text-sm sm:text-base">
                          <SelectValue placeholder="Select your goal" />
                        </SelectTrigger>
                        <SelectContent className="bg-green-900 border-green-500">
                          <SelectItem value="weight-loss">Weight Loss</SelectItem>
                          <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="performance">Athletic Performance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-green-200 text-sm sm:text-base">Diet Type</Label>
                      <Select value={planData.dietType} onValueChange={(value) => setPlanData({...planData, dietType: value})}>
                        <SelectTrigger className="bg-green-900/30 border-green-500/50 text-white text-sm sm:text-base">
                          <SelectValue placeholder="Select diet type" />
                        </SelectTrigger>
                        <SelectContent className="bg-green-900 border-green-500">
                          <SelectItem value="balanced">Balanced</SelectItem>
                          <SelectItem value="high-protein">High Protein</SelectItem>
                          <SelectItem value="keto">Ketogenic</SelectItem>
                          <SelectItem value="vegetarian">Vegetarian</SelectItem>
                          <SelectItem value="vegan">Vegan</SelectItem>
                          <SelectItem value="paleo">Paleo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-green-200 text-sm sm:text-base">Target Calories</Label>
                      <Input
                        type="number"
                        value={planData.calories}
                        onChange={(e) => setPlanData({...planData, calories: e.target.value})}
                        placeholder="e.g., 2000"
                        className="bg-green-900/30 border-green-500/50 text-white text-sm sm:text-base"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-green-200 text-sm sm:text-base">Meals per Day</Label>
                      <Select value={planData.meals} onValueChange={(value) => setPlanData({...planData, meals: value})}>
                        <SelectTrigger className="bg-green-900/30 border-green-500/50 text-white text-sm sm:text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-green-900 border-green-500">
                          <SelectItem value="3">3 Meals</SelectItem>
                          <SelectItem value="4">4 Meals</SelectItem>
                          <SelectItem value="5">5 Meals</SelectItem>
                          <SelectItem value="6">6 Meals</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-green-200 text-sm sm:text-base">Duration (days)</Label>
                      <Input
                        type="number"
                        value={planData.duration}
                        onChange={(e) => setPlanData({...planData, duration: e.target.value})}
                        placeholder="7"
                        className="bg-green-900/30 border-green-500/50 text-white text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-green-200 text-sm sm:text-base">Food Allergies/Restrictions</Label>
                      <Textarea
                        value={planData.allergies}
                        onChange={(e) => setPlanData({...planData, allergies: e.target.value})}
                        placeholder="e.g., nuts, dairy, gluten"
                        className="bg-green-900/30 border-green-500/50 text-white placeholder:text-green-200/50 text-sm sm:text-base"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-green-200 text-sm sm:text-base">Food Preferences</Label>
                      <Textarea
                        value={planData.preferences}
                        onChange={(e) => setPlanData({...planData, preferences: e.target.value})}
                        placeholder="e.g., loves chicken, dislikes fish"
                        className="bg-green-900/30 border-green-500/50 text-white placeholder:text-green-200/50 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={generateMealPlan}
                    disabled={isGenerating || !planData.goal || !planData.dietType}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-3 text-sm sm:text-base"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Generating Meal Plan...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Generate Meal Plan
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white">{generatedPlan.title}</h2>
                      <p className="text-green-200 text-sm sm:text-base">{generatedPlan.duration} days • {generatedPlan.calories} calories/day</p>
                    </div>
                    <div className="space-x-2">
                      <Button onClick={saveMealPlan} className="bg-green-600 hover:bg-green-700" size="sm">
                        Save Plan
                      </Button>
                      <Button onClick={() => setGeneratedPlan(null)} variant="outline" size="sm">
                        Generate New
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {generatedPlan.meals.map((day: any, index: number) => (
                      <Card key={index} className="bg-green-900/40 border-green-500/40">
                        <CardHeader>
                          <CardTitle className="text-green-200 flex items-center text-sm sm:text-base">
                            <Calendar className="w-4 h-4 mr-2" />
                            {day.day}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {Object.entries(day).filter(([key]) => key !== 'day').map(([mealType, meal]: [string, any]) => (
                              <div key={mealType} className="p-4 bg-green-800/30 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-white capitalize flex items-center text-sm sm:text-base">
                                    <Apple className="w-4 h-4 mr-2" />
                                    {mealType}: {meal.name}
                                  </h4>
                                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                    {meal.calories} cal
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mb-3 text-xs sm:text-sm">
                                  <div className="text-green-200">P: {meal.macros.protein}g</div>
                                  <div className="text-green-200">C: {meal.macros.carbs}g</div>
                                  <div className="text-green-200">F: {meal.macros.fat}g</div>
                                </div>
                                <div className="text-green-300 text-xs sm:text-sm">
                                  <strong>Ingredients:</strong> {meal.ingredients.join(', ')}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {savedPlans.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-green-200 text-sm sm:text-base">Your Saved Meal Plans</h3>
                  <div className="grid gap-3">
                    {savedPlans.map((plan) => (
                      <Card key={plan.id} className="bg-green-900/40 border-green-500/40">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-white text-sm sm:text-base">{plan.title}</h4>
                              <p className="text-green-300 text-xs sm:text-sm">{plan.user_requirements}</p>
                            </div>
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                              Saved
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </UsageLimitGuard>
  );
};

export default MealPlanAI;
