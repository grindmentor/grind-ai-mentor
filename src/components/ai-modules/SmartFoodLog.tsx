import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Utensils, Plus, Calendar, TrendingUp, Camera } from "lucide-react";
import { useState, useEffect } from "react";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import UsageIndicator from "@/components/UsageIndicator";
import { aiService } from "@/services/aiService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import FoodPhotoLogger from "./FoodPhotoLogger";

interface SmartFoodLogProps {
  onBack: () => void;
}

interface FoodEntry {
  id: string;
  food_name: string;
  meal_type: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  portion_size: string | null;
  logged_date: string;
}

const SmartFoodLog = ({ onBack }: SmartFoodLogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPhotoLogger, setShowPhotoLogger] = useState(false);
  const [foodName, setFoodName] = useState("");
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [portionSize, setPortionSize] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { canUseFeature, incrementUsage } = useUsageTracking();

  useEffect(() => {
    if (user) {
      loadFoodEntries();
    }
  }, [user, selectedDate]);

  const loadFoodEntries = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('food_log_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('logged_date', selectedDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFoodEntries(data || []);
    } catch (error) {
      console.error('Error loading food entries:', error);
    }
  };

  const handleAnalyzeFood = async () => {
    if (!foodName.trim() || !canUseFeature('food_log_analyses') || !user) return;
    
    setIsAnalyzing(true);
    
    try {
      const analysisPrompt = `Analyze this food item and provide detailed nutritional information: "${foodName}" (${portionSize || 'standard serving'}). 

Please provide EXACT numbers in this format:
Calories: [number]
Protein: [number]g
Carbs: [number]g
Fat: [number]g
Fiber: [number]g

Example response format:
Calories: 250
Protein: 25g
Carbs: 30g
Fat: 8g
Fiber: 5g

Additional notes about the food item and nutritional benefits.`;

      console.log('Analyzing food:', foodName, portionSize);
      const analysis = await aiService.getCoachingAdvice(analysisPrompt);
      console.log('AI Analysis result:', analysis);
      
      const success = await incrementUsage('food_log_analyses');
      if (!success) {
        toast({
          title: "Usage limit reached",
          description: "You've reached your limit for food analysis this month.",
          variant: "destructive",
        });
        setIsAnalyzing(false);
        return;
      }

      // Enhanced parsing with better patterns
      const calories = extractNutrientValue(analysis, 'calories') || 0;
      const protein = extractNutrientValue(analysis, 'protein') || 0;
      const carbs = extractNutrientValue(analysis, 'carbs') || extractNutrientValue(analysis, 'carbohydrates') || 0;
      const fat = extractNutrientValue(analysis, 'fat') || 0;
      const fiber = extractNutrientValue(analysis, 'fiber') || 0;

      console.log('Parsed nutrition values:', { calories, protein, carbs, fat, fiber });

      // Save to database
      const { error } = await supabase
        .from('food_log_entries')
        .insert({
          user_id: user.id,
          food_name: foodName,
          meal_type: mealType,
          portion_size: portionSize || null,
          calories: Math.round(calories),
          protein: Math.round(protein * 10) / 10,
          carbs: Math.round(carbs * 10) / 10,
          fat: Math.round(fat * 10) / 10,
          fiber: Math.round(fiber * 10) / 10,
          logged_date: selectedDate
        });

      if (error) throw error;

      toast({
        title: "Food logged successfully!",
        description: `${foodName} analyzed: ${Math.round(calories)} cal, ${Math.round(protein)}g protein, ${Math.round(carbs)}g carbs, ${Math.round(fat)}g fat`,
      });

      // Reset form and reload entries
      setFoodName("");
      setPortionSize("");
      setShowAddForm(false);
      await loadFoodEntries();
      
    } catch (error) {
      console.error('Food analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Enhanced function to extract nutrient values from AI response
  const extractNutrientValue = (text: string, nutrient: string): number | null => {
    console.log('Extracting', nutrient, 'from:', text.substring(0, 200));
    
    const patterns = [
      // Primary patterns for the specific format we request
      new RegExp(`${nutrient}[:\\s]*([0-9]+(?:\\.[0-9]+)?)`, 'i'),
      new RegExp(`([0-9]+(?:\\.[0-9]+)?)\\s*g?\\s*${nutrient}`, 'i'),
      new RegExp(`${nutrient}[:\\s]*([0-9]+(?:\\.[0-9]+)?)\\s*g`, 'i'),
      // Additional flexible patterns
      new RegExp(`${nutrient}[^0-9]*([0-9]+(?:\\.[0-9]+)?)`, 'i'),
      new RegExp(`([0-9]+(?:\\.[0-9]+)?)[^a-zA-Z]*${nutrient}`, 'i')
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const value = parseFloat(match[1]);
        console.log(`Found ${nutrient}: ${value} using pattern:`, pattern.source);
        return value;
      }
    }
    
    console.log(`Could not find ${nutrient} in text`);
    return null;
  };

  const getTotalNutrients = () => {
    return foodEntries.reduce((totals, entry) => ({
      calories: totals.calories + (entry.calories || 0),
      protein: totals.protein + (entry.protein || 0),
      carbs: totals.carbs + (entry.carbs || 0),
      fat: totals.fat + (entry.fat || 0),
      fiber: totals.fiber + (entry.fiber || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  };

  const totals = getTotalNutrients();

  const handlePhotoLoggerBack = () => {
    setShowPhotoLogger(false);
  };

  const handlePhotoLoggerFoodLogged = async () => {
    // Reload entries when food is logged from photo logger
    await loadFoodEntries();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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
            <h1 className="text-3xl font-bold text-white">Smart Food Log</h1>
            <p className="text-gray-400">AI-powered nutrition tracking and analysis</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          <TrendingUp className="w-3 h-3 mr-1" />
          AI Nutrition Analysis
        </Badge>
        <UsageIndicator featureKey="food_log_analyses" featureName="Food Analysis" compact />
        <UsageIndicator featureKey="food_photo_analyses" featureName="Photo Analysis" compact />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Daily Log</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Select date and view your food intake
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => setShowAddForm(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Food
              </Button>
              <Button
                onClick={() => setShowPhotoLogger(!showPhotoLogger)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Camera className="w-4 h-4 mr-2" />
                Photo Log
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Daily Totals</CardTitle>
            <CardDescription className="text-gray-400">
              Nutritional summary for {new Date(selectedDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-3 rounded">
                <p className="text-gray-400 text-sm">Calories</p>
                <p className="text-white text-xl font-bold">{Math.round(totals.calories)}</p>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <p className="text-gray-400 text-sm">Protein</p>
                <p className="text-white text-xl font-bold">{Math.round(totals.protein)}g</p>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <p className="text-gray-400 text-sm">Carbs</p>
                <p className="text-white text-xl font-bold">{Math.round(totals.carbs)}g</p>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <p className="text-gray-400 text-sm">Fat</p>
                <p className="text-white text-xl font-bold">{Math.round(totals.fat)}g</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showPhotoLogger && (
        <FoodPhotoLogger 
          onBack={handlePhotoLoggerBack} 
          onFoodLogged={handlePhotoLoggerFoodLogged} 
        />
      )}

      {showAddForm && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Add Food Item</CardTitle>
            <CardDescription className="text-gray-400">
              Enter food details for AI nutritional analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Food Name</label>
                <Input
                  placeholder="e.g., Grilled chicken breast"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Meal Type</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as any)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Portion Size (optional)</label>
              <Input
                placeholder="e.g., 1 cup, 200g, 1 piece"
                value={portionSize}
                onChange={(e) => setPortionSize(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleAnalyzeFood}
                disabled={isAnalyzing || !canUseFeature('food_log_analyses')}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze & Log"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Today's Food Log</CardTitle>
          <CardDescription className="text-gray-400">
            {foodEntries.length} items logged for {new Date(selectedDate).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {foodEntries.length > 0 ? (
            <div className="space-y-3">
              {foodEntries.map((entry) => (
                <div key={entry.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-white font-medium">{entry.food_name}</h3>
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                          {entry.meal_type}
                        </Badge>
                      </div>
                      {entry.portion_size && (
                        <p className="text-gray-400 text-sm mb-2">{entry.portion_size}</p>
                      )}
                      <div className="grid grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Calories</p>
                          <p className="text-white font-medium">{entry.calories || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Protein</p>
                          <p className="text-white font-medium">{entry.protein || 0}g</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Carbs</p>
                          <p className="text-white font-medium">{entry.carbs || 0}g</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Fat</p>
                          <p className="text-white font-medium">{entry.fat || 0}g</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Fiber</p>
                          <p className="text-white font-medium">{entry.fiber || 0}g</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Utensils className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500">No food entries for this date</p>
              <p className="text-gray-600 text-sm">Add food items or use photo logging to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartFoodLog;
