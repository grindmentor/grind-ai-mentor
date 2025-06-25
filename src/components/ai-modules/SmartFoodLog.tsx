import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, UtensilsCrossed, Camera, Plus, Trash2, Save, Calendar, Clock, Target, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import UsageIndicator from "@/components/UsageIndicator";

interface SmartFoodLogProps {
  onBack: () => void;
}

interface FoodEntry {
  id?: string;
  food_name: string;
  quantity: number;
  unit: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  logged_at: string;
}

interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const SmartFoodLog = ({ onBack }: SmartFoodLogProps) => {
  const { user } = useAuth();
  const { canUseFeature, incrementUsage } = useUsageTracking();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [dailyTotals, setDailyTotals] = useState<DailyTotals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newEntry, setNewEntry] = useState<Partial<FoodEntry>>({
    food_name: '',
    quantity: 1,
    unit: 'serving',
    meal_type: 'breakfast',
    logged_at: new Date().toISOString()
  });

  useEffect(() => {
    if (user) {
      loadFoodEntries();
    }
  }, [user, selectedDate]);

  useEffect(() => {
    calculateDailyTotals();
  }, [foodEntries]);

  const loadFoodEntries = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const startOfDay = `${selectedDate}T00:00:00`;
      const endOfDay = `${selectedDate}T23:59:59`;

      const { data, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', startOfDay)
        .lte('logged_at', endOfDay)
        .order('logged_at', { ascending: true });

      if (error) throw error;
      setFoodEntries(data || []);
    } catch (error) {
      console.error('Error loading food entries:', error);
      toast.error('Failed to load food entries');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDailyTotals = () => {
    const totals = foodEntries.reduce(
      (acc, entry) => ({
        calories: acc.calories + (entry.calories || 0),
        protein: acc.protein + (entry.protein || 0),
        carbs: acc.carbs + (entry.carbs || 0),
        fat: acc.fat + (entry.fat || 0)
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    setDailyTotals(totals);
  };

  const estimateNutrition = (foodName: string, quantity: number, unit: string) => {
    // Simple nutrition estimation - in a real app, this would use a nutrition API
    const nutritionDb: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {
      'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
      'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
      'broccoli': { calories: 25, protein: 3, carbs: 5, fat: 0.3 },
      'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
      'apple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
      'oatmeal': { calories: 68, protein: 2.4, carbs: 12, fat: 1.4 },
      'egg': { calories: 78, protein: 6, carbs: 0.6, fat: 5 },
      'salmon': { calories: 208, protein: 20, carbs: 0, fat: 12 },
      'sweet potato': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1 }
    };

    const food = nutritionDb[foodName.toLowerCase()] || { calories: 100, protein: 5, carbs: 15, fat: 3 };
    const multiplier = unit === 'cup' ? 1.5 : unit === 'oz' ? 0.5 : 1;
    
    return {
      calories: Math.round(food.calories * quantity * multiplier),
      protein: Math.round(food.protein * quantity * multiplier * 10) / 10,
      carbs: Math.round(food.carbs * quantity * multiplier * 10) / 10,
      fat: Math.round(food.fat * quantity * multiplier * 10) / 10
    };
  };

  const handleAddEntry = async () => {
    if (!user || !newEntry.food_name || !canUseFeature('food_log_analyses')) return;

    const success = await incrementUsage('food_log_analyses');
    if (!success) return;

    try {
      const nutrition = estimateNutrition(newEntry.food_name, newEntry.quantity || 1, newEntry.unit || 'serving');
      
      const entryToSave = {
        user_id: user.id,
        food_name: newEntry.food_name,
        quantity: newEntry.quantity || 1,
        unit: newEntry.unit || 'serving',
        meal_type: newEntry.meal_type || 'breakfast',
        logged_at: `${selectedDate}T${new Date().toTimeString().slice(0, 5)}:00`,
        ...nutrition
      };

      const { data, error } = await supabase
        .from('food_logs')
        .insert(entryToSave)
        .select()
        .single();

      if (error) throw error;

      setFoodEntries(prev => [...prev, data]);
      setNewEntry({
        food_name: '',
        quantity: 1,
        unit: 'serving',
        meal_type: 'breakfast',
        logged_at: new Date().toISOString()
      });
      setShowAddForm(false);
      toast.success('Food entry added successfully!');
    } catch (error) {
      console.error('Error adding food entry:', error);
      toast.error('Failed to add food entry');
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('food_logs')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      setFoodEntries(prev => prev.filter(entry => entry.id !== entryId));
      toast.success('Food entry deleted');
    } catch (error) {
      console.error('Error deleting food entry:', error);
      toast.error('Failed to delete food entry');
    }
  };

  const getMealEntries = (mealType: string) => {
    return foodEntries.filter(entry => entry.meal_type === mealType);
  };

  const mealTypes = [
    { key: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { key: 'lunch', label: 'Lunch', icon: '☀️' },
    { key: 'dinner', label: 'Dinner', icon: '🌙' },
    { key: 'snack', label: 'Snacks', icon: '🍿' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-green-900/20 to-green-700 text-white animate-fade-in">
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="text-green-200 hover:text-white hover:bg-green-800/50"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Dashboard
              </Button>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500/20 to-green-700/40 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl shadow-green-500/25 border border-green-400/20">
                  <UtensilsCrossed className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
                    Smart Food Log
                  </h1>
                  <p className="text-green-200 text-lg">Track your nutrition with AI insights</p>
                </div>
              </div>
            </div>
            
            <UsageIndicator featureKey="food_log_analyses" featureName="Food Logs" compact />
          </div>

          {/* Date Selector and Daily Overview */}
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="bg-green-900/20 border-green-600/30 backdrop-blur-sm">
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
                  className="bg-green-800/30 border-green-600/50 text-white focus:border-green-500"
                />
              </CardContent>
            </Card>

            <Card className="bg-green-900/20 border-green-600/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-400" />
                  Daily Totals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{Math.round(dailyTotals.calories)}</div>
                    <div className="text-green-200">Calories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">{Math.round(dailyTotals.protein)}g</div>
                    <div className="text-green-200">Protein</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-400">{Math.round(dailyTotals.carbs)}g</div>
                    <div className="text-green-200">Carbs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-400">{Math.round(dailyTotals.fat)}g</div>
                    <div className="text-green-200">Fat</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-900/20 border-green-600/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-green-400" />
                  Quick Add
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="w-full bg-gradient-to-r from-green-500/80 to-green-700/80 hover:from-green-600/80 hover:to-green-800/80 text-white font-medium py-2 rounded-xl transition-all duration-200 shadow-lg shadow-green-500/25 backdrop-blur-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Food
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Add Food Form */}
          {showAddForm && (
            <Card className="bg-green-900/20 border-green-600/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Add Food Entry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-green-200 text-sm mb-1 block">Food Name</label>
                    <Input
                      placeholder="e.g., Chicken Breast"
                      value={newEntry.food_name || ''}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, food_name: e.target.value }))}
                      className="bg-green-800/30 border-green-600/50 text-white focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="text-green-200 text-sm mb-1 block">Quantity</label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="1"
                      value={newEntry.quantity || ''}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 1 }))}
                      className="bg-green-800/30 border-green-600/50 text-white focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="text-green-200 text-sm mb-1 block">Unit</label>
                    <Select value={newEntry.unit} onValueChange={(value) => setNewEntry(prev => ({ ...prev, unit: value }))}>
                      <SelectTrigger className="bg-green-800/30 border-green-600/50 text-white focus:border-green-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="serving">Serving</SelectItem>
                        <SelectItem value="cup">Cup</SelectItem>
                        <SelectItem value="oz">Ounce</SelectItem>
                        <SelectItem value="gram">Gram</SelectItem>
                        <SelectItem value="piece">Piece</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-green-200 text-sm mb-1 block">Meal</label>
                    <Select value={newEntry.meal_type} onValueChange={(value: any) => setNewEntry(prev => ({ ...prev, meal_type: value }))}>
                      <SelectTrigger className="bg-green-800/30 border-green-600/50 text-white focus:border-green-500">
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
                    onClick={handleAddEntry}
                    disabled={!newEntry.food_name || !canUseFeature('food_log_analyses')}
                    className="bg-gradient-to-r from-green-500/80 to-green-700/80 hover:from-green-600/80 hover:to-green-800/80 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-green-500/25 backdrop-blur-sm"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Add Entry
                  </Button>
                  <Button
                    onClick={() => setShowAddForm(false)}
                    variant="outline"
                    className="border-green-600/50 text-green-300 hover:bg-green-800/50"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Meals */}
          <div className="space-y-6">
            {mealTypes.map((meal) => {
              const mealEntries = getMealEntries(meal.key);
              const mealTotals = mealEntries.reduce(
                (acc, entry) => ({
                  calories: acc.calories + (entry.calories || 0),
                  protein: acc.protein + (entry.protein || 0)
                }),
                { calories: 0, protein: 0 }
              );

              return (
                <Card key={meal.key} className="bg-green-900/20 border-green-600/30 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center">
                        <span className="text-2xl mr-2">{meal.icon}</span>
                        {meal.label}
                      </CardTitle>
                      <div className="text-green-200 text-sm">
                        {mealTotals.calories} cal • {mealTotals.protein}g protein
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {mealEntries.length > 0 ? (
                      <div className="space-y-3">
                        {mealEntries.map((entry) => (
                          <div key={entry.id} className="flex items-center justify-between p-3 bg-green-800/20 rounded-lg">
                            <div className="flex-1">
                              <h4 className="text-white font-medium">{entry.food_name}</h4>
                              <p className="text-green-200 text-sm">
                                {entry.quantity} {entry.unit} • {entry.calories} cal • {entry.protein}g protein
                              </p>
                            </div>
                            <Button
                              onClick={() => entry.id && handleDeleteEntry(entry.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-green-300">
                        <UtensilsCrossed className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No entries for {meal.label.toLowerCase()}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartFoodLog;
