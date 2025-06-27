
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Plus, Utensils, BarChart3, Save, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UsageLimitGuard } from '@/components/subscription/UsageLimitGuard';
import { MobileHeader } from '@/components/MobileHeader';
import FormattedAIResponse from '@/components/FormattedAIResponse';

interface FoodEntry {
  id: string;
  food_name: string;
  portion_size: string;
  meal_type: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

interface SmartFoodLogProps {
  onBack: () => void;
}

export const SmartFoodLog: React.FC<SmartFoodLogProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [newEntry, setNewEntry] = useState({
    food_name: '',
    portion_size: '',
    meal_type: 'breakfast'
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

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
        .order('created_at', { ascending: true });

      if (error) throw error;

      setFoodEntries(data || []);
    } catch (error) {
      console.error('Error loading food entries:', error);
    }
  };

  const addFoodEntry = async () => {
    if (!user || !newEntry.food_name.trim()) return;

    setIsLoading(true);
    try {
      // Get nutritional analysis from AI
      const { data: aiData, error: aiError } = await supabase.functions.invoke('fitness-ai', {
        body: {
          prompt: `Analyze this food item and provide nutritional information in JSON format:
          
          Food: ${newEntry.food_name}
          Portion: ${newEntry.portion_size || '1 serving'}
          
          Return ONLY a JSON object with these exact keys:
          {
            "calories": number,
            "protein": number,
            "carbs": number,
            "fat": number,
            "fiber": number
          }
          
          Provide realistic estimates based on common portion sizes.`,
          type: 'nutrition_analysis',
          maxTokens: 200
        }
      });

      let nutritionData = {};
      if (!aiError && aiData?.response) {
        try {
          const cleanResponse = aiData.response.replace(/```json|```/g, '').trim();
          nutritionData = JSON.parse(cleanResponse);
        } catch (parseError) {
          console.warn('Could not parse AI nutrition response:', parseError);
        }
      }

      const { data, error } = await supabase
        .from('food_log_entries')
        .insert({
          user_id: user.id,
          food_name: newEntry.food_name,
          portion_size: newEntry.portion_size || '1 serving',
          meal_type: newEntry.meal_type,
          logged_date: selectedDate,
          ...nutritionData
        })
        .select()
        .single();

      if (error) throw error;

      setFoodEntries(prev => [...prev, data]);
      setNewEntry({ food_name: '', portion_size: '', meal_type: 'breakfast' });
      
      toast({
        title: 'Food Added! 🍽️',
        description: 'Food entry logged successfully.'
      });
    } catch (error) {
      console.error('Error adding food entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to add food entry.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeDailyIntake = async () => {
    if (!user || foodEntries.length === 0) {
      toast({
        title: 'No Data',
        description: 'Add some food entries first to get an analysis.',
        variant: 'destructive'
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const totalCalories = foodEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0);
      const totalProtein = foodEntries.reduce((sum, entry) => sum + (entry.protein || 0), 0);
      const totalCarbs = foodEntries.reduce((sum, entry) => sum + (entry.carbs || 0), 0);
      const totalFat = foodEntries.reduce((sum, entry) => sum + (entry.fat || 0), 0);

      const foodList = foodEntries.map(entry => 
        `${entry.meal_type}: ${entry.food_name} (${entry.portion_size})`
      ).join('\n');

      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: {
          prompt: `As a nutrition expert, analyze this daily food intake and provide insights:

**Daily Summary:**
- Total Calories: ${totalCalories}
- Protein: ${totalProtein}g
- Carbs: ${totalCarbs}g  
- Fat: ${totalFat}g

**Foods Consumed:**
${foodList}

Please provide:
1. **Overall Assessment** of the nutritional quality
2. **Macro Balance** analysis (protein/carbs/fat ratios)
3. **Recommendations** for improvement
4. **Missing Nutrients** that should be considered
5. **Meal Timing** observations

Keep the response practical and actionable. Use headings and bullet points for clarity.`,
          type: 'nutrition_analysis',
          maxTokens: 400
        }
      });

      if (error) throw error;

      setAnalysis(data?.response || 'Analysis not available at the moment.');
    } catch (error) {
      console.error('Error analyzing intake:', error);
      toast({
        title: 'Analysis Error',
        description: 'Failed to analyze your food intake.',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTotalNutrition = () => {
    return {
      calories: foodEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0),
      protein: foodEntries.reduce((sum, entry) => sum + (entry.protein || 0), 0),
      carbs: foodEntries.reduce((sum, entry) => sum + (entry.carbs || 0), 0),
      fat: foodEntries.reduce((sum, entry) => sum + (entry.fat || 0), 0),
      fiber: foodEntries.reduce((sum, entry) => sum + (entry.fiber || 0), 0)
    };
  };

  const totals = getTotalNutrition();

  return (
    <UsageLimitGuard featureKey="food_log_analyses" featureName="Smart Food Log">
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-950/50 to-amber-900/30">
        <MobileHeader 
          title="Smart Food Log" 
          onBack={onBack}
        />
        
        <div className="p-4 sm:p-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Food Entry Section */}
            <Card className="bg-gradient-to-br from-orange-900/20 to-amber-900/30 backdrop-blur-sm border-orange-500/30">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500/30 to-amber-500/40 rounded-xl flex items-center justify-center border border-orange-500/30">
                    <Utensils className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-xl">Smart Food Log</CardTitle>
                    <CardDescription className="text-orange-200/80">
                      Track your meals with AI-powered nutrition analysis
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Date Selection */}
                <div className="space-y-2">
                  <Label className="text-orange-200 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Date
                  </Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-orange-900/30 border-orange-500/50 text-white"
                  />
                </div>

                {/* New Entry Form */}
                <div className="space-y-4 p-4 bg-orange-900/20 rounded-lg border border-orange-500/20">
                  <h3 className="text-lg font-semibold text-orange-200">Add Food Entry</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label className="text-orange-200">Food Item</Label>
                      <Input
                        value={newEntry.food_name}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, food_name: e.target.value }))}
                        placeholder="e.g., Grilled chicken breast"
                        className="bg-orange-800/50 border-orange-500/30 text-white placeholder:text-orange-300/50"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-orange-200">Portion Size</Label>
                      <Input
                        value={newEntry.portion_size}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, portion_size: e.target.value }))}
                        placeholder="e.g., 6 oz, 1 cup, 2 slices"
                        className="bg-orange-800/50 border-orange-500/30 text-white placeholder:text-orange-300/50"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-orange-200">Meal Type</Label>
                      <Select value={newEntry.meal_type} onValueChange={(value) => setNewEntry(prev => ({ ...prev, meal_type: value }))}>
                        <SelectTrigger className="bg-orange-800/50 border-orange-500/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-orange-800 border-orange-500/30">
                          <SelectItem value="breakfast">Breakfast</SelectItem>
                          <SelectItem value="lunch">Lunch</SelectItem>
                          <SelectItem value="dinner">Dinner</SelectItem>
                          <SelectItem value="snack">Snack</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button
                    onClick={addFoodEntry}
                    disabled={!newEntry.food_name.trim() || isLoading}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Food
                      </>
                    )}
                  </Button>
                </div>

                {/* Daily Summary */}
                {foodEntries.length > 0 && (
                  <div className="space-y-4 p-4 bg-orange-900/20 rounded-lg border border-orange-500/20">
                    <h3 className="text-lg font-semibold text-orange-200">Daily Totals</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-400">{totals.calories}</div>
                        <div className="text-sm text-orange-300">Calories</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-400">{totals.protein}g</div>
                        <div className="text-sm text-orange-300">Protein</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-400">{totals.carbs}g</div>
                        <div className="text-sm text-orange-300">Carbs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-400">{totals.fat}g</div>
                        <div className="text-sm text-orange-300">Fat</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-400">{totals.fiber}g</div>
                        <div className="text-sm text-orange-300">Fiber</div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={analyzeDailyIntake}
                      disabled={isAnalyzing}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Analyze Daily Intake
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Food Entries & Analysis Section */}
            <Card className="bg-gradient-to-br from-orange-900/20 to-amber-900/30 backdrop-blur-sm border-orange-500/30">
              <CardHeader>
                <CardTitle className="text-white">Food Entries & Analysis</CardTitle>
                <CardDescription className="text-orange-200/80">
                  Your meals for {new Date(selectedDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {foodEntries.length === 0 ? (
                  <div className="text-center py-8 text-orange-300/70">
                    <Utensils className="w-12 h-12 mx-auto mb-3 text-orange-400/50" />
                    <p>No food entries for this date yet.</p>
                    <p className="text-sm mt-1">Start by adding your meals!</p>
                  </div>
                ) : (
                  <>
                    {/* Food Entries List */}
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {foodEntries.map((entry) => (
                        <div key={entry.id} className="p-3 bg-orange-900/30 rounded-lg border border-orange-500/20">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-white">{entry.food_name}</div>
                              <div className="text-sm text-orange-300">{entry.portion_size}</div>
                              <div className="text-xs text-orange-400 capitalize">{entry.meal_type}</div>
                            </div>
                            {entry.calories && (
                              <div className="text-right">
                                <div className="text-orange-200 font-medium">{entry.calories} cal</div>
                                <div className="text-xs text-orange-300">
                                  P: {entry.protein}g | C: {entry.carbs}g | F: {entry.fat}g
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* AI Analysis */}
                    {analysis && (
                      <div className="p-4 bg-orange-900/30 rounded-lg border border-orange-500/20">
                        <h4 className="text-lg font-semibold text-orange-200 mb-3">AI Nutrition Analysis</h4>
                        <FormattedAIResponse content={analysis} moduleType="food-log" />
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </UsageLimitGuard>
  );
};

export default SmartFoodLog;
