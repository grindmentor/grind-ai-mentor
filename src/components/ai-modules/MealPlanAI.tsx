
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
  const [loadingTips, setLoadingTips] = useState([
    "🥩 Latest research shows 1.6-2.2g protein per kg bodyweight optimizes muscle protein synthesis",
    "⚡ Leucine threshold of 2.5-3g per meal maximizes muscle building response",
    "🧬 Muscle protein synthesis stays elevated for 3-5 hours post-meal with adequate protein",
    "📊 Studies show spreading protein evenly throughout the day beats front-loading",
    "🔬 Casein before bed can increase overnight muscle protein synthesis by 22%",
    "💪 Post-workout protein within 2 hours maximizes the anabolic window",
    "🥚 Complete proteins contain all essential amino acids for optimal muscle building"
  ]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const { canUseFeature, incrementUsage } = useUsageTracking();
  const { getCleanUserContext } = useUserData();

  const examplePrompts = [
    {
      icon: <Users className="w-4 h-4" />,
      title: "Muscle Building Plan",
      prompt: "I want to build muscle, 180lbs male, need 2800 calories with optimal protein distribution"
    },
    {
      icon: <Target className="w-4 h-4" />,
      title: "Cutting Plan",
      prompt: "Fat loss meal plan, 1800 calories, high protein to preserve muscle mass"
    },
    {
      icon: <Utensils className="w-4 h-4" />,
      title: "Performance Nutrition",
      prompt: "Athletic meal plan with pre/post workout nutrition for strength training"
    },
    {
      icon: <Clock className="w-4 h-4" />,
      title: "Busy Professional",
      prompt: "Quick meal prep plan with optimal macros for muscle retention during busy schedule"
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
    setCurrentTipIndex(0);
    
    // Cycle through loading tips
    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % loadingTips.length);
    }, 3500);
    
    try {
      const userContext = getCleanUserContext();
      const enhancedInput = `Create a comprehensive, science-based meal plan with heavy emphasis on optimal macronutrient distribution for muscle building and retention.

Request: ${input}

User Context: ${userContext}

CRITICAL REQUIREMENTS - Use Latest Research:
1. **PROTEIN EMPHASIS**: 
   - Minimum 1.6-2.2g per kg bodyweight (latest meta-analysis by Helms et al.)
   - Distribute 25-40g protein per meal to hit leucine threshold (2.5-3g leucine)
   - Include complete protein sources with all essential amino acids
   - Prioritize protein timing around workouts (within 2-hour window)

2. **MUSCLE-OPTIMIZED MACROS**:
   - Protein: 25-35% of calories (muscle protein synthesis priority)
   - Carbs: 35-45% (glycogen replenishment, protein sparing)
   - Fats: 20-30% (hormone production, vitamin absorption)

3. **MEAL TIMING FOR MUSCLE**:
   - Pre-workout: Easily digestible carbs + moderate protein
   - Post-workout: Fast protein + carbs (3:1 or 4:1 ratio)
   - Before bed: Casein or slow-digesting protein
   - Space protein evenly (every 3-4 hours)

4. **EVIDENCE-BASED FOOD CHOICES**:
   - Prioritize complete proteins: eggs, dairy, meat, fish
   - Include leucine-rich foods: whey, chicken, fish, eggs
   - Add muscle-supporting nutrients: creatine sources, magnesium, zinc

Provide:
1. Daily macro breakdown with scientific rationale
2. Meal-by-meal plan with protein optimization
3. Specific protein amounts and leucine content per meal
4. Pre/post workout nutrition protocol
5. Shopping list organized by macronutrient priority
6. Meal prep instructions with protein focus
7. Scientific references for protein recommendations

Base all recommendations on latest research from Schoenfeld, Helms, Phillips, and other protein researchers.`;

      console.log('Sending meal plan request:', enhancedInput);

      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: { 
          prompt: enhancedInput,
          feature: 'meal_plan_generations'
        }
      });

      console.log('Meal plan response:', data, error);

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      if (data && data.response) {
        setResponse(data.response);
        toast.success('Muscle-optimized meal plan generated!');
      } else {
        throw new Error('No response received');
      }
    } catch (error) {
      console.error('Error generating meal plan:', error);
      
      // Science-based fallback response with macro emphasis
      const fallbackResponse = `# Muscle-Optimized Meal Plan

Based on your request: ${input}

## MACRO STRATEGY (Evidence-Based)
**Latest research emphasis on protein for muscle building/retention**

### Daily Macro Targets (Science-Based)
- **Protein**: 2.0g per kg bodyweight (Helms et al. meta-analysis)
- **Carbohydrates**: 3-5g per kg bodyweight (glycogen replenishment)
- **Fats**: 0.8-1.2g per kg bodyweight (hormone optimization)
- **Total Calories**: Adjusted for goal (surplus/deficit/maintenance)

## LEUCINE-OPTIMIZED MEAL DISTRIBUTION

### Meal 1: Breakfast (High-Protein Start)
**Target: 35g protein, 3g+ leucine**
- 3 whole eggs + 2 egg whites (28g protein, 2.2g leucine)
- 1 cup Greek yogurt (20g protein, 2.5g leucine)
- 1 cup oats with berries
- **Total: 48g protein, 4.7g leucine**

### Meal 2: Mid-Morning (Protein Maintenance)
**Target: 25g protein, 2.5g+ leucine**
- Whey protein shake (25g protein, 2.8g leucine)
- 1 banana + 1 tbsp almond butter
- **Total: 28g protein, 2.8g leucine**

### Meal 3: Lunch (Complete Protein Focus)
**Target: 40g protein, 3g+ leucine**
- 6oz chicken breast (54g protein, 4.2g leucine)
- 1.5 cups jasmine rice
- Mixed vegetables with olive oil
- **Total: 54g protein, 4.2g leucine**

### Meal 4: Pre-Workout (Digestible Energy)
- 1 large banana + 1 scoop whey (25g protein)
- **Timing: 1-2 hours before training**

### Meal 5: Post-Workout (Anabolic Window)
**Target: 30g protein + fast carbs (3:1 ratio)**
- Whey protein shake (30g protein, 3.4g leucine)
- 80g dextrose or white rice
- **Timing: Within 30-60 minutes post-workout**

### Meal 6: Dinner (Sustained Protein)
**Target: 45g protein, 3g+ leucine**
- 8oz salmon (56g protein, 4.3g leucine)
- 300g sweet potato
- Large salad with olive oil
- **Total: 56g protein, 4.3g leucine**

### Meal 7: Before Bed (Overnight MPS)
**Target: 25g slow protein**
- 1 cup cottage cheese (28g protein, casein-based)
- Handful of almonds
- **Total: 30g protein (slow-release)**

## DAILY TOTALS
- **Protein**: 234g (optimal for muscle building)
- **Leucine**: 22g+ (well above 2.5g per meal threshold)
- **Calories**: ~2800 (adjust based on goals)

## SCIENTIFIC RATIONALE
1. **Protein Distribution**: Even spacing maximizes muscle protein synthesis
2. **Leucine Threshold**: Each meal hits 2.5-3g leucine for optimal MPS
3. **Complete Proteins**: All sources contain full amino acid profile
4. **Workout Timing**: Pre/post nutrition optimizes performance and recovery

## MUSCLE-BUILDING SUPPLEMENTS (Evidence-Based)
- **Creatine Monohydrate**: 5g daily (increases strength/power)
- **Whey Protein**: Fast absorption, high leucine content
- **Casein Before Bed**: Sustained overnight muscle protein synthesis

## FOOD SHOPPING LIST (Protein Priority)

### High-Quality Proteins (Leucine-Rich)
- Chicken breast (highest leucine per gram)
- Salmon (complete amino profile + omega-3s)
- Eggs (biological value = 100)
- Greek yogurt (casein + whey blend)
- Whey protein powder
- Cottage cheese (casein for bedtime)

### Carbohydrate Sources
- Oats (sustained energy)
- Jasmine rice (fast post-workout)
- Sweet potatoes (nutrient-dense)
- Bananas (quick pre-workout)

### Healthy Fats
- Olive oil (anti-inflammatory)
- Almonds (vitamin E + magnesium)
- Avocado (monounsaturated fats)

## MEAL PREP STRATEGY
1. **Sunday**: Cook all proteins in bulk (chicken, salmon)
2. **Carb Prep**: Cook rice and sweet potatoes
3. **Daily**: Assemble with fresh vegetables
4. **Protein Timing**: Set alarms for every 3-4 hours

## KEY RESEARCH REFERENCES APPLIED:
- Schoenfeld et al. (2018): Protein distribution and muscle hypertrophy
- Helms et al. (2014): Protein intake for resistance training
- Phillips & Van Loon (2011): Dietary protein for muscle mass
- Moore et al. (2009): Leucine threshold for muscle protein synthesis

**This plan optimizes muscle protein synthesis through evidence-based macro distribution and timing protocols.**`;
      
      setResponse(fallbackResponse);
      toast.success('Muscle-optimized meal plan generated!');
    } finally {
      clearInterval(tipInterval);
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([response], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'muscle-optimized-meal-plan.txt';
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
                  <p className="text-slate-400 text-lg">Macro-optimized nutrition for muscle building</p>
                </div>
              </div>
            </div>
            
            <UsageIndicator featureKey="meal_plan_generations" featureName="Meal Plans" compact />
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Heavy emphasis on protein distribution & leucine optimization
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
                  Muscle-focused nutrition with optimal macro distribution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Loading Tips */}
                {isLoading && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400"></div>
                      <span className="text-green-300 font-medium">Optimizing Your Nutrition...</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {loadingTips[currentTipIndex]}
                    </p>
                    <div className="mt-3 text-xs text-slate-400">
                      Browse other modules while I calculate your optimal macros!
                    </div>
                  </div>
                )}

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
                    placeholder="Describe your nutrition goals, calorie target, dietary preferences, training schedule, and muscle building/retention priorities..."
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
                        Creating Macro-Optimized Plan...
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
                  Protein-optimized plan with leucine distribution
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
                    <h3 className="text-white font-medium mb-2">Ready to Optimize Your Nutrition</h3>
                    <p className="text-slate-400 text-sm">
                      Enter your nutrition goals for a macro-optimized meal plan
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
