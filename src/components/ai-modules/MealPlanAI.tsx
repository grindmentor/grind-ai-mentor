import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Utensils, Clock, ChefHat, Bookmark, Heart, Trash2, ChevronRight, Sparkles, Settings2, Refrigerator, Camera, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { UsageLimitGuard } from '@/components/subscription/UsageLimitGuard';
import { RateLimitBadge, RateLimitWarning } from '@/components/ui/rate-limit-badge';
import { MobileHeader } from '@/components/MobileHeader';
import FeatureGate from '@/components/FeatureGate';
import { aiService } from '@/services/aiService';
import { handleError, handleSuccess } from '@/utils/standardErrorHandler';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDietaryPreferences, dietTypeConfig, useDailyTargets } from '@/hooks/useDietaryPreferences';
import { useSavedRecipes, SavedRecipe } from '@/hooks/useSavedRecipes';
import DietaryPreferencesSetup from './DietaryPreferencesSetup';
import { useUserData } from '@/contexts/UserDataContext';

interface MealPlanAIProps {
  onBack: () => void;
}

type DietType = keyof typeof dietTypeConfig;

interface GeneratedMeal {
  id: string;
  name: string;
  description: string;
  cookTime: string;
  protein: number;
  calories: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string[];
  saved?: boolean;
}

export const MealPlanAI: React.FC<MealPlanAIProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { incrementUsage } = useUsageTracking();
  const { userData } = useUserData();
  const navigate = useNavigate();
  
  // Hooks
  const { preferences, isLoading: prefsLoading, needsSetup, savePreferences, getProteinMinimum } = useDietaryPreferences();
  const { recipes, saveRecipe, deleteRecipe, isLoading: recipesLoading } = useSavedRecipes();
  const dailyTargets = useDailyTargets();
  
  // State
  const [showSetup, setShowSetup] = useState(false);
  const [view, setView] = useState<'main' | 'generate' | 'recipes'>('main');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMeal, setGeneratedMeal] = useState<GeneratedMeal | null>(null);
  const [savingRecipe, setSavingRecipe] = useState(false);
  
  // Generation params
  const [selectedDietType, setSelectedDietType] = useState<DietType>('balanced');
  const [quickMeal, setQuickMeal] = useState(false);
  const [customRequest, setCustomRequest] = useState('');

  // Check if setup needed on mount
  useEffect(() => {
    if (!prefsLoading && needsSetup) {
      setShowSetup(true);
    }
  }, [prefsLoading, needsSetup]);

  // Set default diet type from preferences
  useEffect(() => {
    if (preferences.diet_type) {
      setSelectedDietType(preferences.diet_type as DietType);
    }
  }, [preferences.diet_type]);

  const handleRefresh = async () => {
    // Refresh data
  };

  const generateSingleMeal = async () => {
    const success = await incrementUsage('meal_plan_generations');
    if (!success) return;

    setIsGenerating(true);
    setView('generate');
    
    try {
      const proteinMin = getProteinMinimum();
      const calories = dailyTargets.calories || preferences.target_calories || 2000;
      const dietConfig = dietTypeConfig[selectedDietType];
      
      // Stricter low-cal targeting: under 350 cal, max 10g fat, high volume
      const isLowCal = selectedDietType === 'low-cal';
      const targetCals = isLowCal ? 350 : Math.round(calories / 3);
      const fatLimit = isLowCal ? 10 : Math.round((calories * 0.3) / 9 / 3);

      const prompt = `Generate ONE practical meal that fits these requirements:

DIET TYPE: ${dietConfig.label} - ${dietConfig.description}
${selectedDietType === 'personalized' ? `USER GOAL: ${userData.goal || 'general fitness'}` : ''}

REQUIREMENTS:
- Calories: ${isLowCal ? `STRICT MAXIMUM ${targetCals} calories (low-cal cutting meal)` : `~${targetCals} per meal (targeting ${calories}/day)`}
${isLowCal ? `- Fat: MAXIMUM ${fatLimit}g (minimize added fats, use cooking spray not oil)` : ''}
${isLowCal ? `- Volume: Prioritize HIGH-VOLUME, LOW-CALORIE foods (vegetables, lean proteins, egg whites)` : ''}
${isLowCal ? `- Prep: Simple preparations - grilled, steamed, air-fried, no heavy sauces` : ''}
- Protein: minimum ${proteinMin}g
- Time: ${quickMeal ? 'Under 10 minutes' : 'Any prep time'}
- Allergies to AVOID: ${preferences.allergies.length > 0 ? preferences.allergies.join(', ') : 'None'}
- Dislikes to AVOID: ${preferences.dislikes.length > 0 ? preferences.dislikes.join(', ') : 'None'}
${customRequest ? `- Special request: ${customRequest}` : ''}

Return ONLY valid JSON:
{
  "id": "meal-1",
  "name": "Meal name",
  "description": "Brief 1-line description",
  "cookTime": "15 min",
  "protein": 42,
  "calories": 450,
  "carbs": 35,
  "fat": 18,
  "ingredients": ["ingredient 1 with amount", "ingredient 2 with amount"],
  "instructions": ["Step 1", "Step 2", "Step 3"]
}`;

      const response = await aiService.getNutritionAdvice(prompt, {
        maxTokens: 1500,
        priority: 'high',
        useCache: false
      });

      let parsedMeal;
      try {
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
        parsedMeal = JSON.parse(jsonStr);
      } catch (parseError) {
        throw new Error('Failed to parse meal response');
      }

      setGeneratedMeal({ ...parsedMeal, saved: false });
      handleSuccess('Meal Generated!', { 
        description: parsedMeal.name 
      });
    } catch (error) {
      handleError(error, { 
        customMessage: 'Failed to generate meal. Please try again.',
        action: generateSingleMeal,
        actionLabel: 'Retry'
      });
      setView('main');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveGeneratedMeal = async () => {
    if (!generatedMeal) return;
    
    setSavingRecipe(true);
    const success = await saveRecipe({
      name: generatedMeal.name,
      description: generatedMeal.description,
      cook_time: generatedMeal.cookTime,
      protein: generatedMeal.protein,
      calories: generatedMeal.calories,
      carbs: generatedMeal.carbs,
      fat: generatedMeal.fat,
      ingredients: generatedMeal.ingredients,
      instructions: generatedMeal.instructions,
      source: 'mealplan',
      meal_type: selectedDietType,
    });

    if (success) {
      setGeneratedMeal({ ...generatedMeal, saved: true });
    }
    setSavingRecipe(false);
  };

  const MacroCard = ({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) => (
    <div className="p-2 rounded-lg bg-card/50 border border-border/50 text-center">
      <p className={cn("text-lg font-bold", color)}>{value}{unit}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );

  // Show setup if needed
  if (showSetup) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader title="Quick Setup" onBack={() => setShowSetup(false)} />
        <div className="px-4 pb-28">
          <DietaryPreferencesSetup onComplete={() => setShowSetup(false)} />
        </div>
      </div>
    );
  }

  return (
    <FeatureGate featureKey="meal_plan_generations" allowPreview={false}>
      <UsageLimitGuard featureKey="meal_plan_generations" featureName="Meal Plan AI">
        <div className="min-h-screen bg-background">
          <MobileHeader 
            title="Meal AI" 
            onBack={onBack}
            rightElement={
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setShowSetup(true)}>
                  <Settings2 className="w-4 h-4" />
                </Button>
                <RateLimitBadge 
                  featureKey="meal_plan_generations" 
                  featureName="Meals"
                  showProgress={false}
                />
              </div>
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
                <h2 className="text-lg font-bold text-foreground mb-1">AI Meal Generator</h2>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  One meal at a time, tailored to your goals
                </p>
              </motion.div>

              <RateLimitWarning 
                featureKey="meal_plan_generations" 
                featureName="Meal" 
              />
              
              {view === 'main' && (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {/* FridgeScan Promo */}
                  <motion.button
                    onClick={() => navigate('/fridge-scan')}
                    className="w-full p-4 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-teal-500/20 to-emerald-500/20 border-2 border-cyan-500/40 hover:border-cyan-400/60 transition-all relative overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Animated shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    <div className="flex items-center gap-4 relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                        <Refrigerator className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">FridgeScan</span>
                          <Badge className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-[10px] px-2 py-0 border-0">
                            NEW
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Camera className="w-3 h-3" />
                          Snap fridge → Get macro-fit meals
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.button>

                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-border/50" />
                    <span className="text-xs text-muted-foreground">or generate from scratch</span>
                    <div className="flex-1 h-px bg-border/50" />
                  </div>

                  {/* Diet Type Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Meal Style</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.entries(dietTypeConfig) as [DietType, typeof dietTypeConfig[DietType]][]).map(([key, config]) => (
                        <button
                          key={key}
                          onClick={() => setSelectedDietType(key)}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-xl border transition-all text-left",
                            selectedDietType === key
                              ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                              : "border-border/50 bg-card/50 hover:border-primary/50"
                          )}
                        >
                          <span className="text-xl">{config.icon}</span>
                          <span className="text-sm font-medium">{config.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick meal toggle */}
                  <button
                    onClick={() => setQuickMeal(!quickMeal)}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 rounded-xl border transition-all",
                      quickMeal
                        ? "border-primary bg-primary/10"
                        : "border-border/50 bg-card/50"
                    )}
                  >
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">Under 10 minutes</p>
                      <p className="text-xs text-muted-foreground">Quick & easy meals only</p>
                    </div>
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 transition-colors",
                      quickMeal ? "bg-primary border-primary" : "border-muted-foreground"
                    )} />
                  </button>

                  {/* Custom request */}
                  <div className="space-y-2">
                    <Label className="text-sm">Special request (optional)</Label>
                    <Input
                      value={customRequest}
                      onChange={(e) => setCustomRequest(e.target.value)}
                      placeholder="e.g., high fiber, no bread, use chicken..."
                      className="bg-card border-border"
                    />
                  </div>

                  {/* Show preferences */}
                  {(preferences.allergies.length > 0 || preferences.dislikes.length > 0) && (
                    <div className="p-3 rounded-xl border border-border/50 bg-card/30 space-y-2">
                      {preferences.allergies.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-muted-foreground mr-1">Avoiding:</span>
                          {preferences.allergies.map(a => (
                            <Badge key={a} variant="outline" className="text-xs border-destructive/30 text-destructive">
                              {a}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {preferences.dislikes.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-muted-foreground mr-1">Dislikes:</span>
                          {preferences.dislikes.map(d => (
                            <Badge key={d} variant="secondary" className="text-xs">
                              {d}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={generateSingleMeal}
                    className="w-full h-14 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-base font-semibold"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Meal
                  </Button>

                  {/* Saved recipes section */}
                  {recipes.length > 0 && (
                    <div className="mt-8 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">Saved Recipes</h3>
                        <Badge variant="secondary">{recipes.length}</Badge>
                      </div>
                      <ScrollArea className="h-64">
                        <div className="space-y-2">
                          {recipes.map((recipe) => (
                            <div
                              key={recipe.id}
                              className="p-3 bg-card/50 rounded-xl border border-border/50 flex items-center gap-3"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-sm">{recipe.name}</p>
                                <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                                  <span className="text-green-400">{recipe.protein}g P</span>
                                  <span>•</span>
                                  <span>{recipe.calories} cal</span>
                                  {recipe.cook_time && (
                                    <>
                                      <span>•</span>
                                      <span>{recipe.cook_time}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => deleteRecipe(recipe.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </motion.div>
              )}

              {view === 'generate' && (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-muted-foreground">Creating your perfect meal...</p>
                    </div>
                  ) : generatedMeal ? (
                    <Card className="bg-card/60 border-border/50">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl">{generatedMeal.name}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">{generatedMeal.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {generatedMeal.cookTime && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {generatedMeal.cookTime}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Macros */}
                        <div className="grid grid-cols-4 gap-2">
                          <MacroCard label="Protein" value={generatedMeal.protein} unit="g" color="text-green-400" />
                          <MacroCard label="Calories" value={generatedMeal.calories} unit="" color="text-orange-400" />
                          <MacroCard label="Carbs" value={generatedMeal.carbs} unit="g" color="text-blue-400" />
                          <MacroCard label="Fat" value={generatedMeal.fat} unit="g" color="text-yellow-400" />
                        </div>

                        {/* Ingredients */}
                        <div>
                          <p className="text-sm font-medium mb-2">Ingredients</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {generatedMeal.ingredients.map((ing, idx) => (
                              <li key={idx}>• {ing}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Instructions */}
                        <div>
                          <p className="text-sm font-medium mb-2">Instructions</p>
                          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                            {generatedMeal.instructions.map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ol>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={handleSaveGeneratedMeal}
                            disabled={generatedMeal.saved || savingRecipe}
                            className="flex-1"
                            variant={generatedMeal.saved ? "secondary" : "default"}
                          >
                            {savingRecipe ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                            ) : generatedMeal.saved ? (
                              <Heart className="w-4 h-4 mr-2 fill-current" />
                            ) : (
                              <Bookmark className="w-4 h-4 mr-2" />
                            )}
                            {generatedMeal.saved ? 'Saved!' : 'Save Recipe'}
                          </Button>
                          <Button variant="outline" onClick={() => setView('main')} className="flex-1">
                            New Meal
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
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
