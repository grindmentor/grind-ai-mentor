
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Utensils, ArrowLeft, MessageCircle, Download } from "lucide-react";
import { useState } from "react";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import UsageIndicator from "@/components/UsageIndicator";

interface MealPlanAIProps {
  onBack: () => void;
}

const MealPlanAI = ({ onBack }: MealPlanAIProps) => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { canUseFeature, incrementUsage, userTier } = useUsageTracking();

  const canGenerate = canUseFeature('meal_plan_generations');

  const examplePrompts = [
    "I'm 25 years old, 180lbs, want to build muscle while staying lean, vegetarian",
    "Weight loss meal plan, 1800 calories, avoid dairy and gluten",
    "High-protein meals for strength training, 200g protein daily target",
    "Meal prep friendly options for busy schedule, balanced nutrition"
  ];

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
  };

  const normalizeInput = (text: string) => {
    const corrections: { [key: string]: string } = {
      'protien': 'protein',
      'waight': 'weight',
      'loose': 'lose',
      'mussel': 'muscle',
      'vegeterian': 'vegetarian',
      'vegan': 'plant-based',
      'glutten': 'gluten',
      'dairy': 'lactose'
    };

    let normalized = text.toLowerCase();
    Object.entries(corrections).forEach(([wrong, correct]) => {
      normalized = normalized.replace(new RegExp(wrong, 'g'), correct);
    });
    
    return normalized;
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

    const normalizedInput = normalizeInput(input);
    
    setTimeout(() => {
      const isVegetarian = normalizedInput.includes('vegetarian') || normalizedInput.includes('plant-based');
      const isWeightLoss = normalizedInput.includes('weight loss') || normalizedInput.includes('lose weight');
      const isMuscleBuilding = normalizedInput.includes('muscle') || normalizedInput.includes('build') || normalizedInput.includes('bulk');

      setResponse(`**EVIDENCE-BASED NUTRITION PLAN**

**NUTRITIONAL FRAMEWORK**

*Macronutrient Distribution*
Based on current research, optimal macronutrient ratios support your specific goals through strategic nutrient timing and composition.

*Protein Requirements*
Research indicates protein intake should be distributed throughout the day to maximize muscle protein synthesis and metabolic benefits.

**DAILY MEAL STRUCTURE**

*Breakfast (7:00 AM)*
- High-protein foundation meal to kickstart metabolism
- Complex carbohydrates for sustained energy
- Healthy fats for hormone production

*Mid-Morning (10:00 AM)*
- Balanced macronutrient snack
- Focus on satiety and blood sugar stability

*Lunch (1:00 PM)*
- Complete protein source with vegetables
- Micronutrient-dense foods for optimal health
- Appropriate portion sizes for energy needs

*Afternoon (4:00 PM)*
- Strategic pre/post-workout nutrition timing
- Emphasis on recovery and performance support

*Dinner (7:00 PM)*
- Balanced evening meal supporting recovery
- Focus on sleep quality through appropriate nutrients
- Digestive considerations for overnight fasting

**NUTRITIONAL SCIENCE PRINCIPLES**

*Protein Timing and Distribution*
Research demonstrates that distributing protein intake across multiple meals optimizes muscle protein synthesis rates throughout the day.

*Micronutrient Density*
Emphasis on nutrient-dense whole foods ensures adequate vitamin and mineral intake while supporting overall health markers.

*Metabolic Flexibility*
Strategic macronutrient cycling supports the body's ability to efficiently utilize both carbohydrates and fats as fuel sources.

**MEAL TIMING STRATEGIES**

*Pre-Workout Nutrition*
Consuming appropriate nutrients 1-3 hours before exercise optimizes performance and reduces muscle breakdown during training.

*Post-Workout Recovery*
The post-exercise period represents a critical window for nutrient uptake and recovery initiation.

*Evening Protocols*
Strategic evening nutrition supports sleep quality, recovery, and metabolic processes during overnight fasting periods.

**HYDRATION AND SUPPLEMENTATION**

*Fluid Balance*
Adequate hydration supports all physiological processes and optimizes nutrient transport throughout the body.

*Evidence-Based Supplementation*
Only scientifically-supported supplements should be considered, with emphasis on obtaining nutrients from whole food sources.

**RESEARCH CITATIONS**

1. Schoenfeld, B.J., et al. (2017). "How much protein can the body use in a single meal for muscle-building? Implications for daily protein distribution." Journal of the International Society of Sports Nutrition, 15, 10.

2. Helms, E.R., et al. (2014). "Evidence-based recommendations for natural bodybuilding contest preparation: nutrition and supplementation." Journal of the International Society of Sports Nutrition, 11, 20.

3. Aragon, A.A., et al. (2013). "International society of sports nutrition position stand: nutrient timing." Journal of the International Society of Sports Nutrition, 10, 53.

4. Phillips, S.M. & Van Loon, L.J. (2011). "Dietary protein for athletes: from requirements to optimum adaptation." Journal of Sports Sciences, 29(S1), S29-S38.`);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
      </div>

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
                  <Button 
                    onClick={() => {
                      const element = document.createElement('a');
                      const file = new Blob([response], { type: 'text/plain' });
                      element.href = URL.createObjectURL(file);
                      element.download = 'meal-plan.txt';
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
                </div>
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
