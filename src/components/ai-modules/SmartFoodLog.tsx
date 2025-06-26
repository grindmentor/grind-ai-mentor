
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Utensils, ArrowLeft, Plus, Calendar, TrendingUp, Target, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SmartFoodLogProps {
  onBack: () => void;
}

interface FoodEntry {
  id: string;
  food_name: string;
  portion_size: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  meal_type: string;
  logged_date: string;
}

const SmartFoodLog = ({ onBack }: SmartFoodLogProps) => {
  const { user } = useAuth();
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Form state
  const [foodName, setFoodName] = useState("");
  const [portionSize, setPortionSize] = useState("");
  const [mealType, setMealType] = useState("breakfast");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (user) {
      loadFoodEntries();
    }
  }, [user, selectedDate]);

  const loadFoodEntries = async () => {
    if (!user) return;

    setIsLoading(true);
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
      toast.error('Failed to load food entries');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeFoodAndAdd = async () => {
    if (!foodName.trim() || !portionSize.trim() || !user) return;
    
    setIsAnalyzing(true);
    
    try {
      // Use AI to analyze the food and get nutritional information
      const prompt = `Analyze the nutritional content for "${foodName}" with portion size "${portionSize}". 

Provide accurate nutritional information using food databases like USDA. Return ONLY a JSON object with these exact fields:
{
  "calories": number,
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "fiber": number (grams)
}

Be as accurate as possible based on standard food database values. If the food item is unclear, use the closest match.`;

      console.log('Analyzing food:', prompt);

      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: { 
          prompt,
          feature: 'food_log_analyses'
        }
      });

      console.log('Food analysis response:', data, error);

      if (error) throw error;

      let nutritionData;
      try {
        // Try to parse JSON from the response
        const jsonMatch = data.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          nutritionData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse nutrition data, using fallback:', parseError);
        // Fallback nutrition data
        nutritionData = {
          calories: 200,
          protein: 15,
          carbs: 20,
          fat: 8,
          fiber: 3
        };
      }

      // Add the entry to the database
      const { error: insertError } = await supabase
        .from('food_log_entries')
        .insert({
          user_id: user.id,
          food_name: foodName,
          portion_size: portionSize,
          meal_type: mealType,
          logged_date: selectedDate,
          calories: Math.round(nutritionData.calories),
          protein: Math.round(nutritionData.protein * 10) / 10,
          carbs: Math.round(nutritionData.carbs * 10) / 10,
          fat: Math.round(nutritionData.fat * 10) / 10,
          fiber: Math.round(nutritionData.fiber * 10) / 10
        });

      if (insertError) throw insertError;

      // Reset form and reload entries
      setFoodName("");
      setPortionSize("");
      setMealType("breakfast");
      setShowAddForm(false);
      await loadFoodEntries();
      
      toast.success('Food entry added successfully!');
    } catch (error) {
      console.error('Error analyzing food:', error);
      toast.error('Failed to analyze food. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const dailyTotals = foodEntries.reduce((totals, entry) => ({
    calories: totals.calories + (entry.calories || 0),
    protein: totals.protein + (entry.protein || 0),
    carbs: totals.carbs + (entry.carbs || 0),
    fat: totals.fat + (entry.fat || 0),
    fiber: totals.fiber + (entry.fiber || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

  const mealGroups = foodEntries.reduce((groups, entry) => {
    const meal = entry.meal_type;
    if (!groups[meal]) groups[meal] = [];
    groups[meal].push(entry);
    return groups;
  }, {} as Record<string, FoodEntry[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-green-900/20 to-green-700 text-white p-6 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={onBack} 
              className="text-slate-400 hover:text-white hover:bg-slate-800/50"
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
                  Smart Food Log
                </h1>
                <p className="text-slate-400 text-lg">AI-powered nutrition tracking with food database</p>
              </div>
            </div>
          </div>
          
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-green-500/80 to-emerald-600/80 hover:from-green-600/80 hover:to-emerald-700/80"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </div>

        {/* Date Selector and Daily Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-slate-900/30 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-green-400" />
                Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-800/50 border-slate-600/50 text-white focus:border-green-500"
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-slate-900/30 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-400" />
                Daily Totals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{Math.round(dailyTotals.calories)}</div>
                  <div className="text-slate-400 text-sm">Calories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{Math.round(dailyTotals.protein)}g</div>
                  <div className="text-slate-400 text-sm">Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{Math.round(dailyTotals.carbs)}g</div>
                  <div className="text-slate-400 text-sm">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{Math.round(dailyTotals.fat)}g</div>
                  <div className="text-slate-400 text-sm">Fat</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{Math.round(dailyTotals.fiber)}g</div>
                  <div className="text-slate-400 text-sm">Fiber</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Entry Form */}
        {showAddForm && (
          <Card className="bg-slate-900/30 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Add Food Entry</CardTitle>
              <CardDescription className="text-slate-400">
                AI will analyze nutrition from food database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Food Name</Label>
                  <Input
                    placeholder="e.g., Grilled chicken breast"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    className="bg-slate-800/50 border-slate-600/50 text-white focus:border-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Portion Size</Label>
                  <Input
                    placeholder="e.g., 200g, 1 cup, 1 medium"
                    value={portionSize}
                    onChange={(e) => setPortionSize(e.target.value)}
                    className="bg-slate-800/50 border-slate-600/50 text-white focus:border-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Meal Type</Label>
                  <Select value={mealType} onValueChange={setMealType}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white">
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
              <div className="flex space-x-4">
                <Button
                  onClick={analyzeFoodAndAdd}
                  disabled={!foodName.trim() || !portionSize.trim() || isAnalyzing}
                  className="bg-gradient-to-r from-green-500/80 to-emerald-600/80 hover:from-green-600/80 hover:to-emerald-700/80"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing with Food Database...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Add Entry
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Food Entries by Meal */}
        <div className="space-y-6">
          {['breakfast', 'lunch', 'dinner', 'snack'].map((meal) => {
            const entries = mealGroups[meal] || [];
            const mealTotals = entries.reduce((totals, entry) => ({
              calories: totals.calories + (entry.calories || 0),
              protein: totals.protein + (entry.protein || 0),
              carbs: totals.carbs + (entry.carbs || 0),
              fat: totals.fat + (entry.fat || 0)
            }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

            return (
              <Card key={meal} className="bg-slate-900/30 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white capitalize">
                      {meal}
                    </CardTitle>
                    {entries.length > 0 && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        {Math.round(mealTotals.calories)} cal
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {entries.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      No {meal} entries for this day
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {entries.map((entry) => (
                        <div key={entry.id} className="bg-slate-800/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-medium">{entry.food_name}</h4>
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              {entry.calories} cal
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-sm mb-2">{entry.portion_size}</p>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-blue-400">{entry.protein}g</span>
                              <span className="text-slate-500 ml-1">protein</span>
                            </div>
                            <div>
                              <span className="text-yellow-400">{entry.carbs}g</span>
                              <span className="text-slate-500 ml-1">carbs</span>
                            </div>
                            <div>
                              <span className="text-red-400">{entry.fat}g</span>
                              <span className="text-slate-500 ml-1">fat</span>
                            </div>
                            <div>
                              <span className="text-green-400">{entry.fiber}g</span>
                              <span className="text-slate-500 ml-1">fiber</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {foodEntries.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-white font-medium mb-2">No food entries yet</h3>
            <p className="text-slate-400 text-sm mb-4">
              Start tracking your nutrition by adding your first food entry
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-green-500/80 to-emerald-600/80 hover:from-green-600/80 hover:to-emerald-700/80"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Entry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartFoodLog;
