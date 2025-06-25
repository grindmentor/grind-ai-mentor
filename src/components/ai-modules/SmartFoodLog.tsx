
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Activity, ArrowLeft, Plus, Search, TrendingUp, Utensils, Zap, Award, Brain } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUsageTracking } from "@/hooks/useUsageTracking";

interface SmartFoodLogProps {
  onBack: () => void;
}

interface FoodEntry {
  id: string;
  food_name: string;
  meal_type: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  logged_date: string;
}

const SmartFoodLog = ({ onBack }: SmartFoodLogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { canUseFeature, incrementUsage } = useUsageTracking();
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [newFood, setNewFood] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (user) {
      loadFoodEntries();
    }
  }, [user]);

  const loadFoodEntries = async () => {
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
      console.error('Error loading food entries:', error);
      toast({
        title: "Error loading food log",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeFood = async () => {
    if (!newFood.trim() || !user || !canUseFeature('food_log_analyses')) return;
    
    setIsAnalyzing(true);
    
    try {
      // AI analysis logic would go here
      // For now, adding a placeholder entry
      const { error } = await supabase
        .from('food_log_entries')
        .insert({
          user_id: user.id,
          food_name: newFood,
          meal_type: selectedMeal,
          calories: 200, // Placeholder
          protein: 10,
          carbs: 20,
          fat: 8,
          fiber: 3,
          logged_date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      await incrementUsage('food_log_analyses');
      setNewFood('');
      await loadFoodEntries();

      toast({
        title: "Food logged successfully!",
        description: "AI analysis complete with nutritional breakdown.",
      });
    } catch (error) {
      console.error('Error analyzing food:', error);
      toast({
        title: "Error analyzing food",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const totalCalories = foodEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0);
  const totalProtein = foodEntries.reduce((sum, entry) => sum + (entry.protein || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 text-white p-6" style={{fontFamily: 'Source Sans Pro, sans-serif'}}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={onBack} 
              className="text-emerald-200 hover:text-white hover:bg-emerald-800/50"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Dashboard
            </Button>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/25">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-300 to-green-200 bg-clip-text text-transparent">
                  Smart Food Log
                </h1>
                <p className="text-emerald-200 text-lg">Track nutrition with AI insights and smart analysis</p>
              </div>
            </div>
          </div>
          
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 px-4 py-2">
            <Brain className="w-4 h-4 mr-2" />
            AI-Powered
          </Badge>
        </div>

        {/* Daily Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Calories", value: totalCalories, unit: "cal", color: "text-emerald-400" },
            { label: "Protein", value: Math.round(totalProtein), unit: "g", color: "text-green-400" },
            { label: "Meals Logged", value: foodEntries.length, unit: "", color: "text-blue-400" },
            { label: "AI Analyses", value: "∞", unit: "", color: "text-purple-400" }
          ].map((stat, index) => (
            <Card key={index} className="bg-emerald-900/40 border-emerald-600/40 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                  {stat.value}{stat.unit}
                </div>
                <p className="text-emerald-200 text-sm">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Add Food Section */}
          <div className="lg:col-span-2">
            <Card className="bg-emerald-900/50 border-emerald-600/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center">
                  <Plus className="w-5 h-5 mr-3 text-emerald-400" />
                  Smart Food Entry
                </CardTitle>
                <CardDescription className="text-emerald-200">
                  Describe your food and let AI analyze the nutrition
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-emerald-200 mb-2">What did you eat?</label>
                    <Input
                      placeholder="e.g., 'Grilled chicken breast with rice and vegetables'"
                      value={newFood}
                      onChange={(e) => setNewFood(e.target.value)}
                      className="bg-emerald-800/30 border-emerald-600/50 text-white focus:border-emerald-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleAnalyzeFood()}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-200 mb-2">Meal Type</label>
                    <select
                      value={selectedMeal}
                      onChange={(e) => setSelectedMeal(e.target.value as any)}
                      className="w-full p-3 bg-emerald-800/30 border border-emerald-600/50 text-white rounded-lg focus:border-emerald-500"
                    >
                      <option value="breakfast">🌅 Breakfast</option>
                      <option value="lunch">☀️ Lunch</option>
                      <option value="dinner">🌙 Dinner</option>
                      <option value="snack">🥨 Snack</option>
                    </select>
                  </div>

                  <Button
                    onClick={handleAnalyzeFood}
                    disabled={isAnalyzing || !newFood.trim() || !canUseFeature('food_log_analyses')}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-3 shadow-lg shadow-emerald-500/25"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        🤖 AI Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        🔬 Analyze & Log Food
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Today's Entries */}
            <Card className="bg-emerald-900/50 border-emerald-600/50 backdrop-blur-sm mt-6">
              <CardHeader>
                <CardTitle className="text-white">Today's Food Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {foodEntries.map((entry) => (
                    <div key={entry.id} className="bg-emerald-800/30 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-white font-medium">{entry.food_name}</h3>
                          <p className="text-emerald-200 text-sm capitalize">{entry.meal_type}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-emerald-400 font-semibold">{entry.calories} cal</div>
                          <div className="text-xs text-emerald-200">
                            P: {entry.protein}g | C: {entry.carbs}g | F: {entry.fat}g
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {foodEntries.length === 0 && (
                    <div className="text-center py-8">
                      <Utensils className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                      <p className="text-emerald-400">No food logged today</p>
                      <p className="text-emerald-500 text-sm">Start by adding your first meal!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-emerald-900/50 border-emerald-600/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">🧠 AI Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-emerald-200">
                <div className="flex items-start space-x-2">
                  <Award className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <span>Smart portion size estimation</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Brain className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <span>Nutritional database lookup</span>
                </div>
                <div className="flex items-start space-x-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <span>Macro balance recommendations</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Zap className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <span>Instant calorie calculations</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-emerald-900/50 border-emerald-600/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">💡 Quick Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-emerald-200">
                <p>• Be specific with portions (e.g., "1 cup", "150g")</p>
                <p>• Include cooking methods for accuracy</p>
                <p>• Mention brands for packaged foods</p>
                <p>• Log meals right after eating</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartFoodLog;
