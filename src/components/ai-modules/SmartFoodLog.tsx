import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Calculator, ArrowLeft, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import FormattedAIResponse from '../FormattedAIResponse';

interface FoodEntry {
  id?: string;
  food_name: string;
  portion_size: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  meal_type: string;
}

interface SmartFoodLogProps {
  onBack: () => void;
}

const SmartFoodLog: React.FC<SmartFoodLogProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [newFood, setNewFood] = useState<FoodEntry>({
    food_name: '',
    portion_size: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    meal_type: 'breakfast'
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    fetchTodaysFoodEntries();
  }, [user]);

  const fetchTodaysFoodEntries = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('food_log_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('logged_date', today)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFoodEntries(data || []);
    } catch (error) {
      console.error('Error fetching food entries:', error);
      toast.error('Failed to load today\'s food entries');
    }
  };

  const searchFoodNutrition = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);

    try {
      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: {
          prompt: `Search for detailed nutrition information for "${searchQuery}" using the most recent 2024 USDA FoodData Central database, Matvaretabellen (Norwegian food database), or other verified scientific nutrition databases.

CRITICAL REQUIREMENTS:
- ONLY return results if the food exists in verified databases
- If the food is not found or doesn't exist, return: {"error": "Food not found"}
- Do NOT guess or estimate values for unknown foods
- Do NOT make up nutrition data

For verified foods, provide:
1. Exact food name from database
2. Standard serving size (e.g., "100g", "1 cup", "1 medium apple")
3. Verified calories per serving
4. Verified protein (grams)
5. Verified carbohydrates (grams)
6. Verified fat (grams)
7. Verified fiber (grams)

Respond in JSON format:
{
  "foods": [
    {
      "name": "Chicken Breast, Grilled",
      "serving_size": "100g",
      "calories": 165,
      "protein": 31,
      "carbs": 0,
      "fat": 3.6,
      "fiber": 0
    }
  ]
}

OR if not found:
{"error": "Food not found"}

Only use verified 2024 scientific nutrition databases. Never estimate or guess values.`,
          feature: 'food_log_analyses'
        }
      });

      if (error) throw error;

      // Try to parse JSON response
      let parsedResults;
      try {
        parsedResults = JSON.parse(data.response);
        
        if (parsedResults.error) {
          // Food not found
          toast.error('Sorry, food not found in nutrition database. Please try a different search term or add manually.');
          setSearchResults([]);
        } else {
          setSearchResults(parsedResults.foods || []);
        }
      } catch (parseError) {
        // If JSON parsing fails, treat as not found
        toast.error('Sorry, food not found in nutrition database. Please try a different search term or add manually.');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching food:', error);
      toast.error('Failed to search for food nutrition');
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (food: any) => {
    setNewFood({
      ...newFood,
      food_name: food.name,
      portion_size: food.serving_size,
      calories: food.calories || 0,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fat: food.fat || 0,
      fiber: food.fiber || 0
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  const addFoodEntry = async () => {
    if (!user || !newFood.food_name.trim()) {
      toast.error('Please enter a food name');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('food_log_entries')
        .insert({
          user_id: user.id,
          food_name: newFood.food_name,
          portion_size: newFood.portion_size,
          calories: newFood.calories,
          protein: newFood.protein,
          carbs: newFood.carbs,
          fat: newFood.fat,
          fiber: newFood.fiber,
          meal_type: newFood.meal_type,
          logged_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;

      setFoodEntries([data, ...foodEntries]);
      setNewFood({
        food_name: '',
        portion_size: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        meal_type: 'breakfast'
      });
      toast.success('Food added successfully!');
    } catch (error) {
      console.error('Error adding food entry:', error);
      toast.error('Failed to add food entry');
    }
  };

  const removeFoodEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('food_log_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setFoodEntries(foodEntries.filter(entry => entry.id !== entryId));
      toast.success('Food removed from log');
    } catch (error) {
      console.error('Error removing food entry:', error);
      toast.error('Failed to remove food entry');
    }
  };

  const analyzeNutrition = async () => {
    if (foodEntries.length === 0) {
      toast.error('No food entries to analyze');
      return;
    }

    setIsAnalyzing(true);

    try {
      const totalCalories = foodEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0);
      const totalProtein = foodEntries.reduce((sum, entry) => sum + (entry.protein || 0), 0);
      const totalCarbs = foodEntries.reduce((sum, entry) => sum + (entry.carbs || 0), 0);
      const totalFat = foodEntries.reduce((sum, entry) => sum + (entry.fat || 0), 0);
      const totalFiber = foodEntries.reduce((sum, entry) => sum + (entry.fiber || 0), 0);

      const foodList = foodEntries.map(entry => 
        `${entry.food_name} (${entry.portion_size}) - ${entry.meal_type}`
      ).join('\n');

      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: {
          prompt: `Analyze this daily food log using the latest 2024 nutritional science and research. Focus on evidence-based recommendations from recent peer-reviewed studies.

**Daily Totals:**
- Calories: ${totalCalories}
- Protein: ${totalProtein}g
- Carbohydrates: ${totalCarbs}g
- Fat: ${totalFat}g
- Fiber: ${totalFiber}g

**Foods Consumed:**
${foodList}

Provide a comprehensive analysis including:

## Nutritional Assessment
- Overall calorie balance and macronutrient distribution
- Protein adequacy for muscle protein synthesis (reference 2024 studies on optimal protein intake)
- Carbohydrate timing and quality assessment
- Fat sources and omega-3/omega-6 balance

## Micronutrient Analysis
- Likely vitamin and mineral gaps based on food choices
- Recommendations based on latest RDA updates and 2024 research

## Performance & Health Insights
- Energy levels and workout performance implications
- Digestive health considerations (fiber, probiotic foods)
- Anti-inflammatory potential of food choices

## Evidence-Based Recommendations
- Specific improvements backed by 2024 nutrition research
- Meal timing optimizations for goals
- Food swaps for better nutrient density

Base all recommendations on peer-reviewed research from 2023-2024, particularly focusing on sports nutrition, metabolic health, and longevity studies.`,
          feature: 'food_log_analyses'
        }
      });

      if (error) throw error;
      setAnalysis(data.response);
    } catch (error) {
      console.error('Error analyzing nutrition:', error);
      setAnalysis('Sorry, there was an error analyzing your nutrition. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const dailyTotals = {
    calories: foodEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0),
    protein: foodEntries.reduce((sum, entry) => sum + (entry.protein || 0), 0),
    carbs: foodEntries.reduce((sum, entry) => sum + (entry.carbs || 0), 0),
    fat: foodEntries.reduce((sum, entry) => sum + (entry.fat || 0), 0),
    fiber: foodEntries.reduce((sum, entry) => sum + (entry.fiber || 0), 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-white">Smart Food Log</h2>
            <p className="text-gray-400">Track and analyze your daily nutrition</p>
          </div>
        </div>
      </div>

      {/* Daily Totals */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Today's Totals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-orange-400">{dailyTotals.calories}</div>
              <div className="text-sm text-gray-400">Calories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{dailyTotals.protein.toFixed(1)}g</div>
              <div className="text-sm text-gray-400">Protein</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{dailyTotals.carbs.toFixed(1)}g</div>
              <div className="text-sm text-gray-400">Carbs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">{dailyTotals.fat.toFixed(1)}g</div>
              <div className="text-sm text-gray-400">Fat</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">{dailyTotals.fiber.toFixed(1)}g</div>
              <div className="text-sm text-gray-400">Fiber</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add New Food */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Add Food</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Food Search */}
          <div className="space-y-2">
            <Label className="text-white">Search Food Database</Label>
            <div className="flex space-x-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for food (e.g., chicken breast, apple, oats)"
                className="bg-gray-800 border-gray-700 text-white"
                onKeyPress={(e) => e.key === 'Enter' && searchFoodNutrition()}
              />
              <Button 
                onClick={searchFoodNutrition}
                disabled={isSearching}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isSearching ? <Search className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <Label className="text-white">Search Results</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {searchResults.map((food, index) => (
                  <div
                    key={index}
                    onClick={() => selectSearchResult(food)}
                    className="p-3 bg-gray-800 rounded cursor-pointer hover:bg-gray-700 border border-gray-700"
                  >
                    <div className="font-medium text-white">{food.name}</div>
                    <div className="text-sm text-gray-400">
                      {food.serving_size} • {food.calories} cal • {food.protein}g protein
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manual Entry */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Food Name</Label>
              <Input
                value={newFood.food_name}
                onChange={(e) => setNewFood({...newFood, food_name: e.target.value})}
                placeholder="e.g., Grilled Chicken Breast"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Portion Size</Label>
              <Input
                value={newFood.portion_size}
                onChange={(e) => setNewFood({...newFood, portion_size: e.target.value})}
                placeholder="e.g., 150g, 1 cup"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-white">Calories</Label>
              <Input
                type="number"
                value={newFood.calories}
                onChange={(e) => setNewFood({...newFood, calories: parseInt(e.target.value) || 0})}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Protein (g)</Label>
              <Input
                type="number"
                step="0.1"
                value={newFood.protein}
                onChange={(e) => setNewFood({...newFood, protein: parseFloat(e.target.value) || 0})}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Carbs (g)</Label>
              <Input
                type="number"
                step="0.1"
                value={newFood.carbs}
                onChange={(e) => setNewFood({...newFood, carbs: parseFloat(e.target.value) || 0})}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-white">Fat (g)</Label>
              <Input
                type="number"
                step="0.1"
                value={newFood.fat}
                onChange={(e) => setNewFood({...newFood, fat: parseFloat(e.target.value) || 0})}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Fiber (g)</Label>
              <Input
                type="number"
                step="0.1"
                value={newFood.fiber}
                onChange={(e) => setNewFood({...newFood, fiber: parseFloat(e.target.value) || 0})}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Meal</Label>
              <Select value={newFood.meal_type} onValueChange={(value) => setNewFood({...newFood, meal_type: value})}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={addFoodEntry} className="w-full bg-gradient-to-r from-orange-500 to-red-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Food
          </Button>
        </CardContent>
      </Card>

      {/* Food Entries List */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Today's Foods</CardTitle>
        </CardHeader>
        <CardContent>
          {foodEntries.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No foods logged today</p>
          ) : (
            <div className="space-y-3">
              {foodEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-white">{entry.food_name}</div>
                    <div className="text-sm text-gray-400">
                      {entry.portion_size} • {entry.meal_type} • {entry.calories} cal
                    </div>
                    <div className="text-xs text-gray-500">
                      P: {entry.protein}g | C: {entry.carbs}g | F: {entry.fat}g | Fiber: {entry.fiber}g
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFoodEntry(entry.id!)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analyze Button */}
      {foodEntries.length > 0 && (
        <Button
          onClick={analyzeNutrition}
          disabled={isAnalyzing}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
        >
          {isAnalyzing ? (
            <>
              <Calculator className="w-4 h-4 mr-2 animate-spin" />
              Analyzing nutrition...
            </>
          ) : (
            <>
              <Calculator className="w-4 h-4 mr-2" />
              Analyze Today's Nutrition
            </>
          )}
        </Button>
      )}

      {/* Analysis Results */}
      {analysis && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Nutrition Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <FormattedAIResponse content={analysis} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartFoodLog;
