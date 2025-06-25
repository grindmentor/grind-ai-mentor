
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Activity, ArrowLeft, Plus, Search, Utensils, TrendingUp, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import UsageIndicator from '@/components/UsageIndicator';

interface SmartFoodLogProps {
  onBack: () => void;
}

interface FoodEntry {
  id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: string;
  meal_type: string;
  logged_at: string;
}

const SmartFoodLog: React.FC<SmartFoodLogProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { canUseFeature, incrementUsage } = useUsageTracking();
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [newEntry, setNewEntry] = useState({
    food_name: '',
    quantity: '',
    meal_type: 'breakfast'
  });
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', `${today}T00:00:00.000Z`)
        .order('logged_at', { ascending: false });

      if (error) throw error;
      setFoodEntries(data || []);
    } catch (error) {
      console.error('Error loading food entries:', error);
    }
  };

  const addFoodEntry = async () => {
    if (!newEntry.food_name.trim() || !newEntry.quantity.trim() || !user) return;
    if (!canUseFeature('food_log_analyses')) return;
    
    const success = await incrementUsage('food_log_analyses');
    if (!success) return;

    setIsLoading(true);

    try {
      // Use AI to analyze the food and estimate nutrition
      const { data: aiData, error: aiError } = await supabase.functions.invoke('fitness-ai', {
        body: {
          prompt: `Analyze this food item and provide nutrition information: "${newEntry.food_name}" - ${newEntry.quantity}
          
          Please respond ONLY with a JSON object in this exact format:
          {
            "calories": 200,
            "protein": 25,
            "carbs": 15,
            "fat": 8
          }
          
          Base your estimates on standard nutritional databases and portion sizes.`,
          feature: 'food_log_analyses'
        }
      });

      if (aiError) throw aiError;

      let nutritionData = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      
      try {
        // Try to parse JSON from AI response
        const cleanResponse = aiData.response.replace(/```json|```/g, '').trim();
        nutritionData = JSON.parse(cleanResponse);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // Fallback to default values
        nutritionData = { calories: 100, protein: 5, carbs: 15, fat: 3 };
      }

      // Save to database
      const { data, error } = await supabase
        .from('food_logs')
        .insert({
          user_id: user.id,
          food_name: newEntry.food_name,
          quantity: newEntry.quantity,
          meal_type: newEntry.meal_type,
          calories: nutritionData.calories,
          protein: nutritionData.protein,
          carbs: nutritionData.carbs,
          fat: nutritionData.fat
        })
        .select()
        .single();

      if (error) throw error;

      setFoodEntries(prev => [data, ...prev]);
      setNewEntry({ food_name: '', quantity: '', meal_type: 'breakfast' });
      toast.success('Food logged successfully!');
      
    } catch (error) {
      console.error('Error adding food entry:', error);
      toast.error('Failed to log food item');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAnalysis = async () => {
    if (foodEntries.length === 0 || !canUseFeature('food_log_analyses')) return;
    
    const success = await incrementUsage('food_log_analyses');
    if (!success) return;

    setIsAnalyzing(true);

    try {
      const todaysEntries = foodEntries.map(entry => 
        `${entry.food_name} (${entry.quantity}) - ${entry.calories} cal, ${entry.protein}g protein, ${entry.carbs}g carbs, ${entry.fat}g fat`
      ).join('\n');

      const totalCalories = foodEntries.reduce((sum, entry) => sum + entry.calories, 0);
      const totalProtein = foodEntries.reduce((sum, entry) => sum + entry.protein, 0);
      const totalCarbs = foodEntries.reduce((sum, entry) => sum + entry.carbs, 0);
      const totalFat = foodEntries.reduce((sum, entry) => sum + entry.fat, 0);

      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: {
          prompt: `Analyze today's food intake and provide insights:

Today's Food Log:
${todaysEntries}

Daily Totals:
- Calories: ${totalCalories}
- Protein: ${totalProtein}g
- Carbs: ${totalCarbs}g  
- Fat: ${totalFat}g

Please provide:
1. Overall nutrition assessment
2. Macro balance analysis
3. Suggestions for improvement
4. Missing nutrients or food groups
5. Recommendations for remaining meals

Base your analysis on current nutrition science and evidence-based guidelines.`,
          feature: 'food_log_analyses'
        }
      });

      if (error) throw error;
      setAiAnalysis(data.response);
      toast.success('Analysis generated successfully!');
      
    } catch (error) {
      console.error('Error generating analysis:', error);
      toast.error('Failed to generate analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const totalCalories = foodEntries.reduce((sum, entry) => sum + entry.calories, 0);
  const totalProtein = foodEntries.reduce((sum, entry) => sum + entry.protein, 0);
  const totalCarbs = foodEntries.reduce((sum, entry) => sum + entry.carbs, 0);
  const totalFat = foodEntries.reduce((sum, entry) => sum + entry.fat, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-emerald-900/20 to-emerald-700 text-white animate-fade-in">
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
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
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500/20 to-emerald-700/40 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/25 border border-emerald-400/20">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-300 to-emerald-100 bg-clip-text text-transparent">
                    Smart Food Log
                  </h1>
                  <p className="text-emerald-200 text-lg">AI-powered nutrition tracking with insights</p>
                </div>
              </div>
            </div>
            
            <UsageIndicator featureKey="food_log_analyses" featureName="Food Analyses" compact />
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-powered nutrition analysis and insights
            </Badge>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Add Food Entry */}
            <Card className="bg-emerald-900/20 border-emerald-600/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center">
                  <Plus className="w-5 h-5 mr-3 text-emerald-400" />
                  Log Food
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-emerald-200 text-sm font-medium">Food Item</label>
                  <Input
                    placeholder="e.g., Grilled chicken breast"
                    value={newEntry.food_name}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, food_name: e.target.value }))}
                    className="bg-emerald-800/20 border-emerald-600/50 text-white focus:border-emerald-500 backdrop-blur-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-emerald-200 text-sm font-medium">Quantity</label>
                  <Input
                    placeholder="e.g., 150g, 1 cup, 2 slices"
                    value={newEntry.quantity}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, quantity: e.target.value }))}
                    className="bg-emerald-800/20 border-emerald-600/50 text-white focus:border-emerald-500 backdrop-blur-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-emerald-200 text-sm font-medium">Meal Type</label>
                  <select
                    value={newEntry.meal_type}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, meal_type: e.target.value }))}
                    className="w-full p-3 bg-emerald-800/20 border border-emerald-600/50 text-white rounded-lg focus:border-emerald-500 backdrop-blur-sm"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>

                <Button
                  onClick={addFoodEntry}
                  disabled={isLoading || !newEntry.food_name.trim() || !newEntry.quantity.trim() || !canUseFeature('food_log_analyses')}
                  className="w-full bg-gradient-to-r from-emerald-500/80 to-emerald-700/80 hover:from-emerald-600/80 hover:to-emerald-800/80 backdrop-blur-sm"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Log Food
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Daily Summary */}
            <Card className="bg-emerald-900/20 border-emerald-600/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center">
                  <TrendingUp className="w-5 h-5 mr-3 text-emerald-400" />
                  Today's Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-800/20 backdrop-blur-sm rounded-xl p-3 border border-emerald-600/30">
                    <h3 className="text-emerald-300 text-sm font-medium">Calories</h3>
                    <p className="text-xl font-bold text-white">{totalCalories}</p>
                  </div>
                  <div className="bg-emerald-800/20 backdrop-blur-sm rounded-xl p-3 border border-emerald-600/30">
                    <h3 className="text-emerald-300 text-sm font-medium">Protein</h3>
                    <p className="text-xl font-bold text-white">{totalProtein}g</p>
                  </div>
                  <div className="bg-emerald-800/20 backdrop-blur-sm rounded-xl p-3 border border-emerald-600/30">
                    <h3 className="text-emerald-300 text-sm font-medium">Carbs</h3>
                    <p className="text-xl font-bold text-white">{totalCarbs}g</p>
                  </div>
                  <div className="bg-emerald-800/20 backdrop-blur-sm rounded-xl p-3 border border-emerald-600/30">
                    <h3 className="text-emerald-300 text-sm font-medium">Fat</h3>
                    <p className="text-xl font-bold text-white">{totalFat}g</p>
                  </div>
                </div>

                <Button
                  onClick={generateAnalysis}
                  disabled={isAnalyzing || foodEntries.length === 0 || !canUseFeature('food_log_analyses')}
                  className="w-full bg-emerald-600/20 hover:bg-emerald-700/30 border border-emerald-500/30 backdrop-blur-sm"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get AI Analysis
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* AI Analysis */}
            <Card className="bg-emerald-900/20 border-emerald-600/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center">
                  <Sparkles className="w-5 h-5 mr-3 text-emerald-400" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {aiAnalysis ? (
                  <div className="bg-emerald-800/20 backdrop-blur-sm rounded-xl p-4 border border-emerald-600/30 max-h-80 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-emerald-100 text-sm leading-relaxed">{aiAnalysis}</pre>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-emerald-800/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h3 className="text-white font-medium mb-2">No Analysis Yet</h3>
                    <p className="text-emerald-200 text-sm">
                      Log some food items and click "Get AI Analysis" for personalized insights
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Food Entries List */}
          {foodEntries.length > 0 && (
            <Card className="bg-emerald-900/20 border-emerald-600/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center">
                  <Utensils className="w-5 h-5 mr-3 text-emerald-400" />
                  Today's Food Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {foodEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 bg-emerald-800/20 backdrop-blur-sm rounded-xl border border-emerald-600/30">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-emerald-600/20 text-emerald-300 border-emerald-500/30 text-xs">
                            {entry.meal_type}
                          </Badge>
                          <h3 className="text-white font-medium">{entry.food_name}</h3>
                        </div>
                        <p className="text-emerald-200 text-sm mt-1">{entry.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{entry.calories} cal</p>
                        <p className="text-emerald-200 text-xs">
                          P: {entry.protein}g • C: {entry.carbs}g • F: {entry.fat}g
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartFoodLog;
