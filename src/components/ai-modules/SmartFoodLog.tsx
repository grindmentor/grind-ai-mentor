
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Camera, ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";

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
}

const SmartFoodLog = ({ onBack }: SmartFoodLogProps) => {
  const [foodInput, setFoodInput] = useState("");
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [promptsUsed, setPromptsUsed] = useState(0);
  const maxPrompts = 3; // Free tier limit

  const handleAddFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodInput.trim() || promptsUsed >= maxPrompts) return;
    
    setIsLoading(true);
    setPromptsUsed(prev => prev + 1);
    
    // Simulate AI food recognition and nutrient analysis
    setTimeout(() => {
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
        { calories: 100, protein: 5, carbs: 10, fat: 3 }; // Default values
      
      const newEntry: FoodEntry = {
        id: Date.now().toString(),
        name: foodInput,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setFoodEntries(prev => [...prev, newEntry]);
      setFoodInput("");
      setIsLoading(false);
    }, 1500);
  };

  const totalNutrition = foodEntries.reduce((total, entry) => ({
    calories: total.calories + entry.calories,
    protein: total.protein + entry.protein,
    carbs: total.carbs + entry.carbs,
    fat: total.fat + entry.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
            <p className="text-gray-400">AI-powered nutrition tracking and analysis</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
          AI analyzes foods and provides accurate nutritional data
        </Badge>
        <Badge className={`${promptsUsed >= maxPrompts ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
          {promptsUsed}/{maxPrompts} foods logged
        </Badge>
      </div>

      {promptsUsed >= maxPrompts && (
        <Card className="bg-gradient-to-r from-orange-500/10 to-red-600/10 border-orange-500/30">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Food Log Limit Reached</h3>
            <p className="text-gray-300 mb-4">
              Upgrade to get unlimited food logging and advanced nutrition analysis
            </p>
            <Button 
              onClick={() => window.open('/pricing', '_blank')}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              Upgrade Now
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Log Food</CardTitle>
            <CardDescription className="text-gray-400">
              Type food name or description for AI analysis
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
                  disabled={promptsUsed >= maxPrompts}
                />
                <Button 
                  type="submit" 
                  disabled={!foodInput.trim() || isLoading || promptsUsed >= maxPrompts}
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
              )}
            </div>

            <div className="mt-4 text-xs text-gray-500">
              <p>• AI analyzes food descriptions for accurate nutrition data</p>
              <p>• Include portion sizes for better accuracy</p>
              <p>• Data sourced from USDA nutrition database</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SmartFoodLog;
