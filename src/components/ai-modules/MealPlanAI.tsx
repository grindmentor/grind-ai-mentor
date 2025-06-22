
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Utensils, ArrowLeft } from "lucide-react";
import { useState } from "react";

interface MealPlanAIProps {
  onBack: () => void;
}

const MealPlanAI = ({ onBack }: MealPlanAIProps) => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      setResponse(`Based on scientific research, here's your personalized meal plan:

**Breakfast (7:00 AM)**
- Oatmeal with berries and almonds (320 calories)
- Greek yogurt (150 calories)

**Lunch (12:30 PM)**
- Grilled chicken salad with mixed vegetables (450 calories)
- Quinoa (180 calories)

**Dinner (7:00 PM)**
- Salmon with sweet potato and broccoli (520 calories)

**Snacks**
- Apple with peanut butter (200 calories)

*Total: ~1,820 calories*

**Scientific Backing:**
- Protein timing optimized for muscle protein synthesis (Schoenfeld et al., 2017)
- Fiber intake meets recommendations for gut health (Slavin, 2013)
- Omega-3 fatty acids from salmon support cardiovascular health (Mozaffarian & Wu, 2011)

**References:**
1. Schoenfeld, B. J., et al. (2017). How much protein can the body use in a single meal for muscle-building?
2. Slavin, J. (2013). Fiber and prebiotics: mechanisms and health benefits. Nutrients, 5(4), 1417-1435.
3. Mozaffarian, D., & Wu, J. H. (2011). Omega-3 fatty acids and cardiovascular disease. Journal of the American College of Cardiology, 58(20), 2047-2067.`);
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

      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
        All recommendations backed by peer-reviewed research
      </Badge>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Create Your Meal Plan</CardTitle>
            <CardDescription className="text-gray-400">
              Describe your dietary preferences, restrictions, and goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Example: I'm a 25-year-old male, 180lbs, moderately active. I want to build muscle while staying lean. I'm vegetarian and prefer high-protein meals..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white min-h-32"
              />
              <Button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                {isLoading ? "Generating Plan..." : "Generate Meal Plan"}
              </Button>
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
              <div className="text-gray-300 space-y-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{response}</pre>
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
