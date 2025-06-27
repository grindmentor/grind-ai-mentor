
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Utensils, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import FoodLogEntry from "./FoodLogEntry";
import { PageTransition } from "@/components/ui/page-transition";
import { useIsMobile } from "@/hooks/use-mobile";

interface SmartFoodLogProps {
  onBack: () => void;
}

interface FoodEntry {
  id: string;
  food_name: string;
  meal_type: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  portion_size?: string;
  logged_date: string;
}

const SmartFoodLog = ({ onBack }: SmartFoodLogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    food_name: '',
    meal_type: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    portion_size: ''
  });

  useEffect(() => {
    if (user) {
      loadEntries();
    }
  }, [user]);

  const loadEntries = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('food_log_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_date', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading food entries:', error);
      toast({
        title: "Error loading entries",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async () => {
    if (!user || !newEntry.food_name || !newEntry.meal_type) {
      toast({
        title: "Missing information",
        description: "Please fill in at least food name and meal type.",
        variant: "destructive",
      });
      return;
    }

    try {
      const entryData = {
        user_id: user.id,
        food_name: newEntry.food_name,
        meal_type: newEntry.meal_type,
        calories: newEntry.calories ? parseInt(newEntry.calories) : null,
        protein: newEntry.protein ? parseFloat(newEntry.protein) : null,
        carbs: newEntry.carbs ? parseFloat(newEntry.carbs) : null,
        fat: newEntry.fat ? parseFloat(newEntry.fat) : null,
        fiber: newEntry.fiber ? parseFloat(newEntry.fiber) : null,
        portion_size: newEntry.portion_size || null,
        logged_date: new Date().toISOString()
      };

      const { error } = await supabase
        .from('food_log_entries')
        .insert([entryData]);

      if (error) throw error;

      toast({
        title: "Food logged!",
        description: `${newEntry.food_name} has been added to your log.`,
      });

      // Reset form and reload entries
      setNewEntry({
        food_name: '',
        meal_type: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        fiber: '',
        portion_size: ''
      });
      setShowAddForm(false);
      loadEntries();
    } catch (error) {
      console.error('Error adding food entry:', error);
      toast({
        title: "Error adding food",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const todaysEntries = entries.filter(entry => {
    const entryDate = new Date(entry.logged_date).toDateString();
    const today = new Date().toDateString();
    return entryDate === today;
  });

  const totalCalories = todaysEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0);
  const totalProtein = todaysEntries.reduce((sum, entry) => sum + (entry.protein || 0), 0);

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
        <div className="p-3 sm:p-4 md:p-6">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="text-white hover:bg-gray-800/50 backdrop-blur-sm w-fit"
                size={isMobile ? "sm" : "default"}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {isMobile ? "Back" : "Back to Dashboard"}
              </Button>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500/20 to-emerald-600/40 backdrop-blur-sm rounded-xl flex items-center justify-center border border-green-400/20">
                  <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    Smart Food Log
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-400">Track your nutrition intake</p>
                </div>
              </div>
            </div>

            {/* Today's Summary */}
            <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center text-lg sm:text-xl">
                  <Clock className="w-5 h-5 mr-2 text-green-500" />
                  Today's Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-white">{totalCalories}</div>
                    <div className="text-xs sm:text-sm text-gray-400">Calories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-white">{totalProtein.toFixed(1)}g</div>
                    <div className="text-xs sm:text-sm text-gray-400">Protein</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-white">{todaysEntries.length}</div>
                    <div className="text-xs sm:text-sm text-gray-400">Foods</div>
                  </div>
                  <div className="text-center">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Entry Button */}
            <div className="flex justify-center sm:justify-start">
              <Button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto"
                size={isMobile ? "default" : "lg"}
              >
                <Plus className="w-4 h-4 mr-2" />
                {showAddForm ? 'Cancel' : 'Add Entry'}
              </Button>
            </div>

            {/* Add Entry Form */}
            {showAddForm && (
              <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white text-lg sm:text-xl">Add Food Entry</CardTitle>
                  <CardDescription>Log your food intake with nutritional details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Food Name</label>
                      <Input
                        value={newEntry.food_name}
                        onChange={(e) => setNewEntry({...newEntry, food_name: e.target.value})}
                        placeholder="e.g., Grilled Chicken"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Meal Type</label>
                      <Select value={newEntry.meal_type} onValueChange={(value) => setNewEntry({...newEntry, meal_type: value})}>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Select meal type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="breakfast">Breakfast</SelectItem>
                          <SelectItem value="lunch">Lunch</SelectItem>
                          <SelectItem value="dinner">Dinner</SelectItem>
                          <SelectItem value="snack">Snack</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Calories</label>
                      <Input
                        type="number"
                        value={newEntry.calories}
                        onChange={(e) => setNewEntry({...newEntry, calories: e.target.value})}
                        placeholder="0"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Protein (g)</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newEntry.protein}
                        onChange={(e) => setNewEntry({...newEntry, protein: e.target.value})}
                        placeholder="0"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Carbs (g)</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newEntry.carbs}
                        onChange={(e) => setNewEntry({...newEntry, carbs: e.target.value})}
                        placeholder="0"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Fat (g)</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newEntry.fat}
                        onChange={(e) => setNewEntry({...newEntry, fat: e.target.value})}
                        placeholder="0"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Portion Size</label>
                      <Input
                        value={newEntry.portion_size}
                        onChange={(e) => setNewEntry({...newEntry, portion_size: e.target.value})}
                        placeholder="e.g., 1 cup, 100g"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleAddEntry}
                    className="bg-green-500 hover:bg-green-600 text-white w-full"
                  >
                    Add Food Entry
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Food Entries */}
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold text-white">Recent Entries</h2>
              {entries.length === 0 ? (
                <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
                  <CardContent className="p-6 sm:p-8 text-center">
                    <Utensils className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-sm sm:text-base">No food entries yet. Start logging your meals!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {entries.map((entry) => (
                    <FoodLogEntry 
                      key={entry.id} 
                      entry={entry} 
                      onDelete={handleDeleteEntry}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SmartFoodLog;
