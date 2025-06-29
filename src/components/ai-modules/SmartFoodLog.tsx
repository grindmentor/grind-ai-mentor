
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Utensils, Search, Plus, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SmartFoodLogEntry from './SmartFoodLogEntry';

interface FoodEntry {
  id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion_size: string;
  meal_type: string;
  isCustom?: boolean;
}

interface USDAFood {
  fdcId: number;
  description: string;
  foodNutrients: Array<{
    nutrientId: number;
    value: number;
  }>;
}

const SmartFoodLog = () => {
  const { user } = useAuth();
  const [todaysEntries, setTodaysEntries] = useState<FoodEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<USDAFood[]>([]);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [loading, setLoading] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    food_name: '',
    portion_size: '1 serving',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  useEffect(() => {
    if (user) {
      loadTodaysEntries();
    }
  }, [user]);

  const loadTodaysEntries = async () => {
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
      
      const entries: FoodEntry[] = (data || []).map(entry => ({
        id: entry.id,
        food_name: entry.food_name,
        calories: entry.calories || 0,
        protein: entry.protein || 0,
        carbs: entry.carbs || 0,
        fat: entry.fat || 0,
        portion_size: entry.portion_size || '1 serving',
        meal_type: entry.meal_type,
        isCustom: entry.portion_size?.includes('✏️') || false
      }));
      
      setTodaysEntries(entries);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const searchUSDAFoods = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Mock USDA search - in production, you'd use the actual USDA API
      const mockResults: USDAFood[] = [
        {
          fdcId: 1,
          description: `${query} (generic)`,
          foodNutrients: [
            { nutrientId: 1008, value: 250 }, // calories
            { nutrientId: 1003, value: 20 },  // protein
            { nutrientId: 1005, value: 30 },  // carbs
            { nutrientId: 1004, value: 8 }    // fat
          ]
        }
      ];
      setSearchResults(mockResults);
    } catch (error) {
      console.error('Error searching foods:', error);
      toast.error('Failed to search foods');
    } finally {
      setLoading(false);
    }
  };

  const addFoodEntry = async (food: USDAFood | null = null) => {
    if (!user) return;

    let entryData;
    if (food) {
      // From USDA search
      const calories = food.foodNutrients.find(n => n.nutrientId === 1008)?.value || 0;
      const protein = food.foodNutrients.find(n => n.nutrientId === 1003)?.value || 0;
      const carbs = food.foodNutrients.find(n => n.nutrientId === 1005)?.value || 0;
      const fat = food.foodNutrients.find(n => n.nutrientId === 1004)?.value || 0;

      entryData = {
        user_id: user.id,
        food_name: food.description,
        portion_size: '100g',
        calories: Math.round(calories),
        protein: Math.round(protein * 10) / 10,
        carbs: Math.round(carbs * 10) / 10,
        fat: Math.round(fat * 10) / 10,
        meal_type: selectedMealType,
        logged_date: new Date().toISOString().split('T')[0]
      };
    } else {
      // Manual entry
      entryData = {
        user_id: user.id,
        food_name: manualEntry.food_name,
        portion_size: `${manualEntry.portion_size} ✏️`,
        calories: manualEntry.calories,
        protein: manualEntry.protein,
        carbs: manualEntry.carbs,
        fat: manualEntry.fat,
        meal_type: selectedMealType,
        logged_date: new Date().toISOString().split('T')[0]
      };
    }

    try {
      const { data, error } = await supabase
        .from('food_log_entries')
        .insert([entryData])
        .select()
        .single();

      if (error) throw error;

      const newEntry: FoodEntry = {
        id: data.id,
        food_name: data.food_name,
        calories: data.calories || 0,
        protein: data.protein || 0,
        carbs: data.carbs || 0,
        fat: data.fat || 0,
        portion_size: data.portion_size || '1 serving',
        meal_type: data.meal_type,
        isCustom: data.portion_size?.includes('✏️') || false
      };

      setTodaysEntries(prev => [newEntry, ...prev]);
      toast.success('Food logged successfully');
      setSearchQuery('');
      setSearchResults([]);
      setShowManualEntry(false);
      setManualEntry({
        food_name: '',
        portion_size: '1 serving',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      });
    } catch (error) {
      console.error('Error adding food entry:', error);
      toast.error('Failed to log food');
    }
  };

  const updateFoodEntry = async (updatedEntry: FoodEntry) => {
    try {
      const { error } = await supabase
        .from('food_log_entries')
        .update({
          food_name: updatedEntry.food_name,
          portion_size: updatedEntry.portion_size,
          calories: updatedEntry.calories,
          protein: updatedEntry.protein,
          carbs: updatedEntry.carbs,
          fat: updatedEntry.fat
        })
        .eq('id', updatedEntry.id);

      if (error) throw error;

      setTodaysEntries(prev => 
        prev.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry)
      );
      toast.success('Food entry updated');
    } catch (error) {
      console.error('Error updating food entry:', error);
      toast.error('Failed to update food entry');
    }
  };

  const removeFoodEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('food_log_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      setTodaysEntries(prev => prev.filter(entry => entry.id !== entryId));
      toast.success('Food entry removed');
    } catch (error) {
      console.error('Error removing food entry:', error);
      toast.error('Failed to remove food entry');
    }
  };

  const addManualEntry = () => {
    if (!manualEntry.food_name.trim()) {
      toast.error('Please enter a food name');
      return;
    }
    addFoodEntry(null);
  };

  const totalNutrients = todaysEntries.reduce(
    (totals, entry) => ({
      calories: totals.calories + entry.calories,
      protein: totals.protein + entry.protein,
      carbs: totals.carbs + entry.carbs,
      fat: totals.fat + entry.fat
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-orange-900/20 to-red-900/30 backdrop-blur-sm border-orange-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Utensils className="w-5 h-5 mr-2 text-orange-400" />
            Smart Food Log
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Daily Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <div className="text-orange-400 font-bold text-lg">{Math.round(totalNutrients.calories)}</div>
              <div className="text-orange-300 text-sm">Calories</div>
            </div>
            <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="text-green-400 font-bold text-lg">{Math.round(totalNutrients.protein * 10) / 10}g</div>
              <div className="text-green-300 text-sm">Protein</div>
            </div>
            <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <div className="text-yellow-400 font-bold text-lg">{Math.round(totalNutrients.carbs * 10) / 10}g</div>
              <div className="text-yellow-300 text-sm">Carbs</div>
            </div>
            <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="text-purple-400 font-bold text-lg">{Math.round(totalNutrients.fat * 10) / 10}g</div>
              <div className="text-purple-300 text-sm">Fat</div>
            </div>
          </div>

          {/* Meal Type Selector */}
          <div>
            <Label className="text-gray-300 mb-2 block">Meal Type</Label>
            <Select value={selectedMealType} onValueChange={setSelectedMealType}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Food Search */}
          <div className="space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="Search for foods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      searchUSDAFoods(searchQuery);
                    }
                  }}
                />
              </div>
              <Button
                onClick={() => searchUSDAFoods(searchQuery)}
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Search className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setShowManualEntry(true)}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Manual
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-white font-medium">Search Results:</h4>
                {searchResults.map((food) => (
                  <Card key={food.fdcId} className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/70 transition-colors cursor-pointer" onClick={() => addFoodEntry(food)}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <h5 className="text-white font-medium">{food.description}</h5>
                          <p className="text-gray-400 text-sm">Per 100g</p>
                        </div>
                        <div className="flex space-x-4 text-sm">
                          <span className="text-orange-400">{Math.round(food.foodNutrients.find(n => n.nutrientId === 1008)?.value || 0)} cal</span>
                          <span className="text-green-400">{Math.round((food.foodNutrients.find(n => n.nutrientId === 1003)?.value || 0) * 10) / 10}g P</span>
                          <span className="text-yellow-400">{Math.round((food.foodNutrients.find(n => n.nutrientId === 1005)?.value || 0) * 10) / 10}g C</span>
                          <span className="text-purple-400">{Math.round((food.foodNutrients.find(n => n.nutrientId === 1004)?.value || 0) * 10) / 10}g F</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Manual Entry Form */}
            {showManualEntry && (
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardContent className="p-4">
                  <h4 className="text-white font-medium mb-3">Add Custom Food</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-gray-300">Food Name</Label>
                      <Input
                        value={manualEntry.food_name}
                        onChange={(e) => setManualEntry({...manualEntry, food_name: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="e.g., Homemade pasta"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-gray-300">Portion Size</Label>
                        <Input
                          value={manualEntry.portion_size}
                          onChange={(e) => setManualEntry({...manualEntry, portion_size: e.target.value})}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="e.g., 1 cup"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Calories</Label>
                        <Input
                          type="number"
                          value={manualEntry.calories}
                          onChange={(e) => setManualEntry({...manualEntry, calories: Number(e.target.value)})}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-gray-300">Protein (g)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={manualEntry.protein}
                          onChange={(e) => setManualEntry({...manualEntry, protein: Number(e.target.value)})}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Carbs (g)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={manualEntry.carbs}
                          onChange={(e) => setManualEntry({...manualEntry, carbs: Number(e.target.value)})}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Fat (g)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={manualEntry.fat}
                          onChange={(e) => setManualEntry({...manualEntry, fat: Number(e.target.value)})}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        onClick={addManualEntry}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Add Food
                      </Button>
                      <Button
                        onClick={() => setShowManualEntry(false)}
                        variant="outline"
                        className="border-gray-600 text-gray-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Today's Entries */}
          <div className="space-y-3">
            <h3 className="text-white font-medium">Today's Food Log</h3>
            {todaysEntries.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No food logged today</p>
                <p className="text-gray-500 text-sm">Search or add foods to start tracking</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysEntries.map((entry) => (
                  <SmartFoodLogEntry
                    key={entry.id}
                    entry={entry}
                    onUpdate={updateFoodEntry}
                    onRemove={removeFoodEntry}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartFoodLog;
