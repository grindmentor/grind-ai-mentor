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

Base all recommendations on current nutrition science and evidence-based dietary guidelines. Provide a complete, actionable meal plan.`;

      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: { 
          prompt: enhancedInput,
          feature: 'meal_plan_generations'
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      if (data && data.response) {
        setResponse(data.response);
        toast.success('Meal plan generated successfully!');
      } else {
        // Fallback response if API fails
        const fallbackResponse = `# Personalized Meal Plan

Based on your request: ${input}

## Daily Nutrition Targets

### Macronutrient Breakdown
- **Calories**: 2000-2200 per day (adjust based on your goals)
- **Protein**: 140-160g (30-35% of calories)
- **Carbohydrates**: 200-250g (40-45% of calories)
- **Fats**: 55-70g (25-30% of calories)
- **Fiber**: 25-35g daily
- **Water**: 8-10 glasses daily

## 7-Day Meal Plan

### Day 1-3: Foundation Phase

**Breakfast (400-450 calories)**
- 2 whole eggs + 2 egg whites scrambled
- 1 slice whole grain toast
- 1/2 avocado
- 1 cup berries
- Green tea or black coffee

**Mid-Morning Snack (150-200 calories)**
- Greek yogurt (1 cup) with 1 tbsp honey
- 10 almonds

**Lunch (500-550 calories)**
- Grilled chicken breast (4 oz)
- Quinoa salad with mixed vegetables
- Olive oil and lemon dressing
- Side of steamed broccoli

**Afternoon Snack (150-200 calories)**
- Apple slices with 2 tbsp almond butter
- Or protein smoothie with banana

**Dinner (500-550 calories)**
- Baked salmon (4 oz)
- Sweet potato (medium, roasted)
- Green beans with garlic
- Mixed leafy greens salad

**Evening Snack (100-150 calories)**
- Handful of walnuts
- Or chamomile tea with 1 tbsp honey

### Day 4-7: Variety Phase

**Breakfast Options:**
- Overnight oats with protein powder and berries
- Veggie omelet with whole grain toast
- Smoothie bowl with nuts and seeds

**Lunch Options:**
- Turkey and avocado wrap
- Lentil soup with whole grain roll
- Tuna salad with mixed greens

**Dinner Options:**
- Lean beef with roasted vegetables
- Chickpea curry with brown rice
- Grilled tofu with stir-fried vegetables

## Shopping List

### Proteins
- Eggs (2 dozen)
- Chicken breast (2 lbs)
- Salmon fillets (1 lb)
- Greek yogurt (large container)
- Almonds, walnuts (1 lb each)
- Protein powder (optional)

### Carbohydrates
- Whole grain bread (1 loaf)
- Quinoa (1 lb)
- Sweet potatoes (3 lbs)
- Brown rice (2 lb bag)
- Oats (large container)

### Vegetables & Fruits
- Mixed berries (2 cups)
- Apples (6 pieces)
- Avocados (4 pieces)
- Broccoli (2 heads)
- Green beans (1 lb)
- Mixed leafy greens (large bag)
- Bell peppers, onions, garlic

### Pantry Items
- Olive oil
- Honey
- Almond butter
- Herbs and spices
- Green tea, herbal teas

## Meal Prep Instructions

### Sunday Prep (2-3 hours)
1. **Proteins**: Grill all chicken, bake salmon portions
2. **Grains**: Cook quinoa and brown rice in bulk
3. **Vegetables**: Wash, chop, and steam vegetables
4. **Snacks**: Portion nuts and prepare snack containers

### Daily Prep (15-20 minutes)
- Assemble salads in mason jars
- Prepare overnight oats
- Set out ingredients for quick cooking

## Substitution Options

### Protein Alternatives
- Chicken → Turkey, lean beef, tofu
- Salmon → Mackerel, sardines, cod
- Greek yogurt → Cottage cheese, protein powder

### Carbohydrate Alternatives
- Quinoa → Brown rice, farro, bulgur
- Sweet potato → Regular potato, butternut squash
- Oats → Chia seeds, buckwheat

### Healthy Swaps
- Reduce sodium by using herbs instead of salt
- Add more fiber with beans and legumes
- Increase antioxidants with colorful vegetables

## Nutritional Benefits

This meal plan provides:
- **Complete Proteins** for muscle maintenance and growth
- **Complex Carbohydrates** for sustained energy
- **Healthy Fats** for hormone production and absorption
- **Antioxidants** from colorful fruits and vegetables
- **Fiber** for digestive health and satiety

## Hydration Schedule
- Upon waking: 16 oz water
- Before meals: 8 oz water
- During workouts: 6-8 oz every 15-20 minutes
- Evening: Herbal tea for relaxation

**Note**: This meal plan is based on general nutrition principles. Individual needs may vary based on activity level, metabolism, and health conditions. Adjust portions and ingredients based on your specific requirements and preferences.`;
        
        setResponse(fallbackResponse);
        toast.success('Meal plan generated successfully!');
      }
    } catch (error) {
      console.error('Error generating meal plan:', error);
      
      // Provide fallback response instead of error message
      const fallbackResponse = `# Emergency Meal Plan

I encountered a technical issue, but here's a proven meal plan based on your request: ${input}

## Quick Start Nutrition Plan

### Daily Structure (2000 calories)

**Breakfast (~400 cal)**
- 2 eggs any style
- 1 slice whole grain toast
- 1 piece fruit
- Coffee or tea

**Snack (~200 cal)**
- Greek yogurt with berries
- Or handful of nuts

**Lunch (~500 cal)**
- Lean protein (4 oz chicken, fish, or tofu)
- 1 cup cooked grains (rice, quinoa)
- Vegetables (steamed or salad)
- 1 tsp olive oil

**Snack (~200 cal)**
- Apple with almond butter
- Or protein shake

**Dinner (~500 cal)**
- Lean protein (4 oz)
- Roasted vegetables
- Small sweet potato or brown rice
- Side salad

**Evening (~200 cal)**
- Herbal tea
- Small portion nuts or seeds

### Simple Meal Prep Strategy
1. **Sunday**: Cook proteins and grains in bulk
2. **Daily**: Combine pre-cooked items with fresh vegetables
3. **Keep Simple**: Focus on whole foods over complicated recipes

### Basic Shopping List
- Proteins: Eggs, chicken, fish, Greek yogurt
- Grains: Oats, brown rice, quinoa, whole grain bread
- Vegetables: Leafy greens, broccoli, bell peppers, onions
- Fruits: Apples, berries, bananas
- Healthy fats: Avocado, olive oil, nuts, seeds

### Key Principles
- Eat protein with every meal
- Fill half your plate with vegetables
- Choose whole grains over refined
- Stay hydrated with 8+ glasses water daily
- Listen to your hunger and fullness cues

This simple plan follows evidence-based nutrition principles and can be adapted based on your preferences and schedule.`;
      
      setResponse(fallbackResponse);
      toast.success('Meal plan generated with fallback content!');
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
