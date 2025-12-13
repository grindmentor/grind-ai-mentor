import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Utensils, Zap, Target, Calendar, Apple, Clock, ChefHat, Leaf, ShoppingCart, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { UsageLimitGuard } from '@/components/subscription/UsageLimitGuard';
import { RateLimitBadge, RateLimitWarning } from '@/components/ui/rate-limit-badge';
import { MobileHeader } from '@/components/MobileHeader';
import FeatureGate from '@/components/FeatureGate';
import { DietCuesDisplay } from './DietCuesDisplay';
import { aiService } from '@/services/aiService';
import { handleError, handleSuccess } from '@/utils/standardErrorHandler';
import { useGlobalState } from '@/contexts/GlobalStateContext';
import { handleAsync } from '@/utils/errorHandler';
import { useAppSync } from '@/utils/appSynchronization';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MealPlanAIProps {
  onBack: () => void;
}

export const MealPlanAI: React.FC<MealPlanAIProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { incrementUsage } = useUsageTracking();
  const { actions } = useGlobalState();
  const { getCache, setCache, invalidateCache } = useAppSync();
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

  useEffect(() => {
    if (user) {
      loadSavedPlans();
    }
  }, [user]);

  const loadSavedPlans = async () => {
    if (!user) return;

    const cacheKey = `meal-plans-${user.id}`;
    const cached = getCache(cacheKey);
    if (cached) {
      setSavedPlans(cached);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      setSavedPlans(data || []);
      setCache(cacheKey, data || [], 300000);
    } catch (error) {
      console.error('Error loading meal plans:', error);
    }
  };

  const handleRefresh = async () => {
    await loadSavedPlans();
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

    const success = await incrementUsage('meal_plan_generations');
    if (!success) return;

    setIsGenerating(true);
    try {
      const prompt = `Create a detailed ${planData.duration || 7} day meal plan for a ${planData.dietType} diet with the goal of ${planData.goal}.

MEAL PLAN REQUIREMENTS:
- Daily calories: ${planData.calories || 2000}
- Diet type: ${planData.dietType}
- Goal: ${planData.goal}
- Allergies/restrictions: ${planData.allergies || 'None specified'}
- Duration: ${planData.duration || 7} days

FORMAT AS JSON:
{
  "title": "Plan Name",
  "duration": ${planData.duration || 7},
  "calories": ${planData.calories || 2000},
  "meals": [
    {
      "day": "Monday",
      "breakfast": {
        "name": "meal name",
        "calories": number,
        "macros": {"protein": number, "carbs": number, "fat": number},
        "ingredients": ["ingredient 1", "ingredient 2"]
      },
      "lunch": {...},
      "dinner": {...}
    }
  ]
}

Include complete nutritional information and practical, easy-to-prepare meals. Base recommendations on the latest nutrition science.`;

      const response = await aiService.getNutritionAdvice(prompt, {
        maxTokens: 2500,
        priority: 'high',
        useCache: true
      });

      let parsedPlan;
      try {
        parsedPlan = JSON.parse(response);
      } catch (parseError) {
        parsedPlan = {
          title: `${planData.dietType} ${planData.goal} Plan`,
          duration: parseInt(planData.duration) || 7,
          calories: parseInt(planData.calories) || 2000,
          content: response
        };
      }

      setGeneratedPlan(parsedPlan);
      handleSuccess('Meal Plan Generated!', { 
        description: 'Your personalized meal plan is ready!' 
      });
    } catch (error) {
      handleError(error, { 
        customMessage: 'Failed to generate meal plan. Please try again.',
        action: generateMealPlan,
        actionLabel: 'Retry'
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
        title: 'Meal Plan Saved!',
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

  const MacroCard = ({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) => (
    <div className={cn("flex-1 p-3 rounded-xl bg-card/50 border border-border/50 text-center")}>
      <div className={cn("text-lg font-bold", color)}>{value}{unit}</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
    </div>
  );

  return (
    <FeatureGate featureKey="meal_plan_generations" allowPreview={false}>
      <UsageLimitGuard featureKey="meal_plan_generations" featureName="Meal Plan AI">
        <div className="min-h-screen bg-background">
          <MobileHeader 
            title="Meal Plan AI" 
            onBack={onBack}
            rightElement={
              <RateLimitBadge 
                featureKey="meal_plan_generations" 
                featureName="Plans"
                showProgress={false}
              />
            }
          />
          
          <PullToRefresh onRefresh={handleRefresh} skeletonVariant="card">
            <div className="px-4 pb-28">
              {/* Hero Section */}
              <motion.div 
                className="text-center py-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="w-14 h-14 mx-auto bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mb-3 border border-green-500/20">
                  <Utensils className="w-7 h-7 text-green-400" />
                </div>
                <h2 className="text-lg font-bold text-foreground mb-1">AI Meal Planning</h2>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Personalized nutrition plans based on science
                </p>
              </motion.div>

              <RateLimitWarning 
                featureKey="meal_plan_generations" 
                featureName="Meal Plan" 
              />
              
              {!generatedPlan ? (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {/* Goal & Diet Type */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Goal</Label>
                      <Select value={planData.goal} onValueChange={(value) => setPlanData({...planData, goal: value})}>
                        <SelectTrigger className="h-12 bg-card border-border rounded-xl" aria-label="Select your goal">
                          <SelectValue placeholder="Select goal" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border rounded-xl">
                          <SelectItem value="weight-loss">Weight Loss</SelectItem>
                          <SelectItem value="weight-gain-bulk">Weight Gain</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="performance">Performance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Diet Type</Label>
                      <Select value={planData.dietType} onValueChange={(value) => setPlanData({...planData, dietType: value})}>
                        <SelectTrigger className="h-12 bg-card border-border rounded-xl" aria-label="Select diet type">
                          <SelectValue placeholder="Select diet" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border rounded-xl">
                          <SelectItem value="balanced">Balanced</SelectItem>
                          <SelectItem value="keto">Keto</SelectItem>
                          <SelectItem value="vegetarian">Vegetarian</SelectItem>
                          <SelectItem value="vegan">Vegan</SelectItem>
                          <SelectItem value="paleo">Paleo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Diet Cues */}
                  {(planData.goal || planData.dietType) && (
                    <DietCuesDisplay 
                      goal={planData.goal} 
                      dietType={planData.dietType}
                      className="mt-2"
                    />
                  )}

                  {/* Calories, Meals, Duration */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Calories</Label>
                      <Input
                        type="number"
                        value={planData.calories}
                        onChange={(e) => setPlanData({...planData, calories: e.target.value})}
                        placeholder="2000"
                        className="h-12 bg-card border-border rounded-xl text-center"
                        aria-label="Target calories"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Meals/Day</Label>
                      <Select value={planData.meals} onValueChange={(value) => setPlanData({...planData, meals: value})}>
                        <SelectTrigger className="h-12 bg-card border-border rounded-xl" aria-label="Meals per day">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border rounded-xl">
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="6">6</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Days</Label>
                      <Input
                        type="number"
                        value={planData.duration}
                        onChange={(e) => setPlanData({...planData, duration: e.target.value})}
                        placeholder="7"
                        className="h-12 bg-card border-border rounded-xl text-center"
                        aria-label="Duration in days"
                      />
                    </div>
                  </div>

                  {/* Allergies & Preferences */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Allergies / Restrictions</Label>
                      <Input
                        value={planData.allergies}
                        onChange={(e) => setPlanData({...planData, allergies: e.target.value})}
                        placeholder="e.g., nuts, dairy, gluten"
                        className="h-12 bg-card border-border rounded-xl"
                        aria-label="Food allergies or restrictions"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Preferences</Label>
                      <Input
                        value={planData.preferences}
                        onChange={(e) => setPlanData({...planData, preferences: e.target.value})}
                        placeholder="e.g., loves chicken, dislikes fish"
                        className="h-12 bg-card border-border rounded-xl"
                        aria-label="Food preferences"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={generateMealPlan}
                    disabled={isGenerating || !planData.goal || !planData.dietType}
                    className="w-full h-14 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-base font-semibold"
                    aria-label="Generate meal plan"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating Plan...
                      </>
                    ) : (
                      <>
                        <ChefHat className="w-5 h-5 mr-2" />
                        Generate Meal Plan
                      </>
                    )}
                  </Button>
                </motion.div>
              ) : (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Plan Header */}
                  <div className="bg-card/50 rounded-2xl border border-border/50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h2 className="text-lg font-bold text-foreground">{generatedPlan.title}</h2>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{generatedPlan.duration} days</span>
                          <span className="text-border">•</span>
                          <span>{generatedPlan.calories} kcal/day</span>
                        </div>
                      </div>
                      <Badge className="bg-green-500/15 text-green-400 border-green-500/30">
                        <Leaf className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={saveMealPlan} size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                        Save Plan
                      </Button>
                      <Button onClick={() => setGeneratedPlan(null)} variant="outline" size="sm" className="flex-1">
                        New Plan
                      </Button>
                    </div>
                  </div>

                  {/* Meals */}
                  {generatedPlan.meals?.map((day: any, index: number) => (
                    <motion.div 
                      key={index} 
                      className="bg-card/50 rounded-2xl border border-border/50 overflow-hidden"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="px-4 py-3 bg-muted/30 border-b border-border/50">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-green-400" />
                          <span className="font-semibold text-foreground">{day.day}</span>
                        </div>
                      </div>
                      
                      <div className="divide-y divide-border/30">
                        {Object.entries(day).filter(([key]) => key !== 'day').map(([mealType, meal]: [string, any]) => (
                          <div key={mealType} className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Apple className="w-4 h-4 text-green-400" />
                                <span className="font-medium text-foreground capitalize">{mealType}</span>
                              </div>
                              <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400 bg-green-500/10">
                                {meal.calories} kcal
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-foreground mb-3">{meal.name}</p>
                            
                            {meal.macros && (
                              <div className="flex gap-2 mb-3">
                                <MacroCard label="Protein" value={meal.macros.protein} unit="g" color="text-blue-400" />
                                <MacroCard label="Carbs" value={meal.macros.carbs} unit="g" color="text-amber-400" />
                                <MacroCard label="Fat" value={meal.macros.fat} unit="g" color="text-rose-400" />
                              </div>
                            )}
                            
                            {meal.ingredients && (
                              <div className="flex flex-wrap gap-1">
                                {meal.ingredients.slice(0, 4).map((ing: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-[10px] border-border/50 bg-muted/30">
                                    {ing}
                                  </Badge>
                                ))}
                                {meal.ingredients.length > 4 && (
                                  <Badge variant="outline" className="text-[10px] border-border/50 bg-muted/30">
                                    +{meal.ingredients.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Saved Plans */}
              {savedPlans.length > 0 && !generatedPlan && (
                <motion.div 
                  className="mt-6 space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-sm font-semibold text-foreground">Saved Plans</h3>
                  {savedPlans.map((plan, index) => (
                    <button
                      key={plan.id}
                      onClick={() => {
                        try {
                          setGeneratedPlan(JSON.parse(plan.content));
                        } catch {
                          toast({
                            title: 'Error',
                            description: 'Could not load this plan',
                            variant: 'destructive'
                          });
                        }
                      }}
                      className="w-full p-4 bg-card/50 rounded-xl border border-border/50 text-left hover:bg-card transition-colors"
                      aria-label={`Load ${plan.title}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-foreground text-sm">{plan.title}</h4>
                          <p className="text-xs text-muted-foreground">{plan.user_requirements}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </PullToRefresh>
        </div>
      </UsageLimitGuard>
    </FeatureGate>
  );
};

export default MealPlanAI;
