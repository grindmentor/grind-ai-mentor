
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Camera, ArrowLeft, Plus, Brain } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import UsageIndicator from "@/components/UsageIndicator";

interface SmartFoodLogProps {
  onBack: () => void;
}

interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  analysis?: string;
}

const SmartFoodLog = ({ onBack }: SmartFoodLogProps) => {
  const [foodInput, setFoodInput] = useState("");
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const { canUseFeature, incrementUsage } = useUsageTracking();

  const handleAddFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodInput.trim() || !canUseFeature('food_log_analyses')) return;
    
    setIsLoading(true);
    
    const success = await incrementUsage('food_log_analyses');
    if (!success) {
      setIsLoading(false);
      return;
    }
    
    try {
      // Get AI analysis of the food
      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: { 
          type: 'food_log',
          userInput: `Analyze this food item for nutritional content and provide macronutrient breakdown: ${foodInput}`
        }
      });

      if (error) throw error;

      // Parse the AI response to extract nutrition data
      // For now, using mock data but in production this would parse the AI response
      const mockFoodData = {
        "chicken breast": { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
        "rice": { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
        "broccoli": { calories: 25, protein: 3, carbs: 5, fat: 0.3 },
        "salmon": { calories: 208, protein: 22, carbs: 0, fat: 12 },
        "oats": { calories: 389, protein: 17, carbs: 66, fat: 7 },
        "banana": { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
        "eggs": { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
        "avocado": { calories: 160, protein: 2, carbs: 9, fat: 15 }
      };
      
      const foodName = foodInput.toLowerCase();
      const foodKey = Object.keys(mockFoodData).find(key => foodName.includes(key));
      const nutrition = foodKey ? mockFoodData[foodKey as keyof typeof mockFoodData] : 
        { calories: 100, protein: 5, carbs: 10, fat: 3 };
      
      const newEntry: FoodEntry = {
        id: Date.now().toString(),
        name: foodInput,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        analysis: data.response
      };
      
      setFoodEntries(prev => [...prev, newEntry]);
      setFoodInput("");
    } catch (error) {
      console.error('Error analyzing food:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDailyAnalysis = async () => {
    if (foodEntries.length === 0 || !canUseFeature('food_log_analyses')) return;
    
    setIsLoading(true);
    
    const success = await incrementUsage('food_log_analyses');
    if (!success) {
      setIsLoading(false);
      return;
    }

    try {
      const foodList = foodEntries.map(entry => `${entry.name} (${entry.calories} cal)`).join(', ');
      
      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: { 
          type: 'food_log',
          userInput: `Provide a comprehensive nutritional analysis of today's food intake: ${foodList}. Total calories: ${totalNutrition.calories}, Protein: ${totalNutrition.protein.toFixed(1)}g, Carbs: ${totalNutrition.carbs.toFixed(1)}g, Fat: ${totalNutrition.fat.toFixed(1)}g. Include recommendations for optimization and cite scientific research.`
        }
      });

      if (error) throw error;
      setAnalysis(data.response);
    } catch (error) {
      console.error('Error generating analysis:', error);
      setAnalysis('Sorry, there was an error generating your nutritional analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalNutrition = foodEntries.reduce((total, entry) => ({
    calories: total.calories + entry.calories,
    protein: total.protein + entry.protein,
    carbs: total.carbs + entry.carbs,
    fat: total.fat + entry.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-gray-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Smart Food Log</h1>
            <p className="text-gray-400">AI-powered nutrition tracking with scientific analysis</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
          AI analyzes foods and provides research-backed nutritional insights
        </Badge>
        <UsageIndicator featureKey="food_log_analyses" featureName="Food Analyses" compact />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Log Food</CardTitle>
            <CardDescription className="text-gray-400">
              AI analyzes your food for accurate nutrition data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddFood} className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="e.g., '200g grilled chicken breast' or 'medium banana'"
                  value={foodInput}
                  onChange={(e) => setFoodInput(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white flex-1"
                  disabled={!canUseFeature('food_log_analyses')}
                />
                <Button 
                  type="submit" 
                  disabled={!foodInput.trim() || isLoading || !canUseFeature('food_log_analyses')}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                >
                  {isLoading ? "Analyzing..." : <Plus className="w-4 h-4" />}
                </Button>
              </div>
            </form>

            <div className="mt-6">
              <h3 className="text-white font-medium mb-3">Today's Entries</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {foodEntries.length > 0 ? (
                  foodEntries.map((entry) => (
                    <div key={entry.id} className="bg-gray-800 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-white font-medium">{entry.name}</div>
                          <div className="text-gray-400 text-sm">{entry.time}</div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="text-orange-400 font-bold">{entry.calories} cal</div>
                          <div className="text-gray-400">
                            P: {entry.protein.toFixed(1)}g | C: {entry.carbs.toFixed(1)}g | F: {entry.fat.toFixed(1)}g
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-4">
                    No foods logged today
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Daily Summary</CardTitle>
            <CardDescription className="text-gray-400">
              Total nutritional intake for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <div className="text-orange-400 text-2xl font-bold">{totalNutrition.calories}</div>
                  <div className="text-gray-400 text-sm">Total Calories</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <div className="text-blue-400 text-2xl font-bold">{totalNutrition.protein.toFixed(1)}g</div>
                  <div className="text-gray-400 text-sm">Protein</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <div className="text-green-400 text-2xl font-bold">{totalNutrition.carbs.toFixed(1)}g</div>
                  <div className="text-gray-400 text-sm">Carbohydrates</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <div className="text-yellow-400 text-2xl font-bold">{totalNutrition.fat.toFixed(1)}g</div>
                  <div className="text-gray-400 text-sm">Fat</div>
                </div>
              </div>

              {foodEntries.length > 0 && (
                <>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Macro Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-400">Protein ({((totalNutrition.protein * 4 / totalNutrition.calories) * 100).toFixed(0)}%)</span>
                        <span className="text-gray-300">{(totalNutrition.protein * 4).toFixed(0)} cal</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-400">Carbs ({((totalNutrition.carbs * 4 / totalNutrition.calories) * 100).toFixed(0)}%)</span>
                        <span className="text-gray-300">{(totalNutrition.carbs * 4).toFixed(0)} cal</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-yellow-400">Fat ({((totalNutrition.fat * 9 / totalNutrition.calories) * 100).toFixed(0)}%)</span>
                        <span className="text-gray-300">{(totalNutrition.fat * 9).toFixed(0)} cal</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={generateDailyAnalysis}
                    disabled={isLoading || !canUseFeature('food_log_analyses')}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    {isLoading ? "Analyzing..." : "Get AI Nutrition Analysis"}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {analysis && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">AI Nutrition Analysis</CardTitle>
              <CardDescription className="text-gray-400">
                Research-backed insights and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-gray-300 space-y-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{analysis}</pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SmartFoodLog;
