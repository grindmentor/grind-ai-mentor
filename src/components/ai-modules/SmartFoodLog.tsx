
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Utensils, BarChart3, Camera, Search, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MobileHeader } from '@/components/MobileHeader';
import { Badge } from '@/components/ui/badge';

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
  logged_date: string;
}

interface USDAFoodItem {
  fdcId: number;
  description: string;
  dataType: string;
  foodNutrients: Array<{
    nutrientId: number;
    nutrientName: string;
    value: number;
    unitName: string;
  }>;
}

interface SmartFoodLogProps {
  onBack: () => void;
}

export const SmartFoodLog: React.FC<SmartFoodLogProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<USDAFoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [portionSize, setPortionSize] = useState('100');

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
      toast({
        title: 'Error',
        description: 'Failed to load food entries.',
        variant: 'destructive'
      });
    }
  };

  const searchUSDADatabase = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      // Mock USDA API call - replace with actual USDA API
      const mockResults: USDAFoodItem[] = [
        {
          fdcId: 123456,
          description: `${query} - Fresh`,
          dataType: 'Survey (FNDDS)',
          foodNutrients: [
            { nutrientId: 1008, nutrientName: 'Energy', value: 89, unitName: 'KCAL' },
            { nutrientId: 1003, nutrientName: 'Protein', value: 0.9, unitName: 'G' },
            { nutrientId: 1005, nutrientName: 'Carbohydrate, by difference', value: 22.8, unitName: 'G' },
            { nutrientId: 1004, nutrientName: 'Total lipid (fat)', value: 0.3, unitName: 'G' },
            { nutrientId: 1079, nutrientName: 'Fiber, total dietary', value: 2.4, unitName: 'G' }
          ]
        }
      ];

      setSearchResults(mockResults);
    } catch (error) {
      console.error('USDA search error:', error);
      toast({
        title: 'Search Error',
        description: 'Failed to search USDA database.',
        variant: 'destructive'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const addFoodFromUSDA = async (foodItem: USDAFoodItem) => {
    if (!user) return;

    try {
      const nutrients = foodItem.foodNutrients;
      const calories = nutrients.find(n => n.nutrientId === 1008)?.value || 0;
      const protein = nutrients.find(n => n.nutrientId === 1003)?.value || 0;
      const carbs = nutrients.find(n => n.nutrientId === 1005)?.value || 0;
      const fat = nutrients.find(n => n.nutrientId === 1004)?.value || 0;
      const fiber = nutrients.find(n => n.nutrientId === 1079)?.value || 0;

      // Calculate based on portion size
      const portionMultiplier = parseFloat(portionSize) / 100;

      const { data, error } = await supabase
        .from('food_log_entries')
        .insert({
          user_id: user.id,
          food_name: `🥗 ${foodItem.description}`,
          portion_size: `${portionSize}g`,
          meal_type: mealType,
          logged_date: selectedDate,
          calories: Math.round(calories * portionMultiplier),
          protein: Math.round(protein * portionMultiplier * 10) / 10,
          carbs: Math.round(carbs * portionMultiplier * 10) / 10,
          fat: Math.round(fat * portionMultiplier * 10) / 10,
          fiber: Math.round(fiber * portionMultiplier * 10) / 10
        })
        .select()
        .single();

      if (error) throw error;

      setFoodEntries(prev => [...prev, data]);
      setSearchQuery('');
      setSearchResults([]);
      
      toast({
        title: 'Food Added! 🥗',
        description: `${foodItem.description} added from USDA database.`
      });
    } catch (error) {
      console.error('Error adding food from USDA:', error);
      toast({
        title: 'Error',
        description: 'Failed to add food from USDA database.',
        variant: 'destructive'
      });
    }
  };

  const analyzePhotoIngredients = async () => {
    if (!selectedPhoto || !user) return;

    setIsAnalyzing(true);
    try {
      // Create FormData for photo upload
      const formData = new FormData();
      formData.append('photo', selectedPhoto);

      // Mock photo analysis - replace with actual AI service
      const mockIngredients = [
        { name: 'Chicken Breast', amount: '150g', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
        { name: 'White Rice', amount: '80g', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
        { name: 'Broccoli', amount: '100g', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 }
      ];

      // Add each ingredient as separate entry
      for (const ingredient of mockIngredients) {
        await supabase
          .from('food_log_entries')
          .insert({
            user_id: user.id,
            food_name: `📸 ${ingredient.name}`,
            portion_size: ingredient.amount,
            meal_type: mealType,
            logged_date: selectedDate,
            calories: ingredient.calories,
            protein: ingredient.protein,
            carbs: ingredient.carbs,
            fat: ingredient.fat,
            fiber: ingredient.fiber
          });
      }

      await loadFoodEntries();
      setSelectedPhoto(null);
      
      toast({
        title: 'Photo Analyzed! 📸',
        description: `Identified ${mockIngredients.length} ingredients and added them separately.`
      });
    } catch (error) {
      console.error('Photo analysis error:', error);
      toast({
        title: 'Analysis Error',
        description: 'Failed to analyze photo.',
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
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-950/50 to-amber-900/30">
      <MobileHeader 
        title="Smart Food Log" 
        onBack={onBack}
      />
      
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* USDA Search & Photo Analysis */}
          <Card className="bg-gradient-to-br from-orange-900/20 to-amber-900/30 backdrop-blur-sm border-orange-500/30">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500/30 to-amber-500/40 rounded-xl flex items-center justify-center border border-orange-500/30">
                  <Database className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-xl">USDA Food Database</CardTitle>
                  <CardDescription className="text-orange-200/80">
                    Search official USDA nutrition data
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

              {/* USDA Search */}
              <div className="space-y-4 p-4 bg-orange-900/20 rounded-lg border border-orange-500/20">
                <h3 className="text-lg font-semibold text-orange-200 flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  USDA Database Search
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-orange-200">Search Food</Label>
                    <div className="flex gap-2">
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="e.g., apple, chicken breast, rice"
                        className="bg-orange-800/50 border-orange-500/30 text-white placeholder:text-orange-300/50"
                        onKeyPress={(e) => e.key === 'Enter' && searchUSDADatabase(searchQuery)}
                      />
                      <Button
                        onClick={() => searchUSDADatabase(searchQuery)}
                        disabled={isSearching}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        {isSearching ? '...' : 'Search'}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-orange-200">Portion (grams)</Label>
                      <Input
                        type="number"
                        value={portionSize}
                        onChange={(e) => setPortionSize(e.target.value)}
                        className="bg-orange-800/50 border-orange-500/30 text-white"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-orange-200">Meal Type</Label>
                      <Select value={mealType} onValueChange={(value: any) => setMealType(value)}>
                        <SelectTrigger className="bg-orange-800/50 border-orange-500/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-orange-800 border-orange-500/30">
                          <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
                          <SelectItem value="lunch">☀️ Lunch</SelectItem>
                          <SelectItem value="dinner">🌙 Dinner</SelectItem>
                          <SelectItem value="snack">🥨 Snack</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-orange-200">USDA Results</Label>
                    {searchResults.map((item) => (
                      <div key={item.fdcId} className="p-3 bg-orange-800/30 rounded-lg border border-orange-500/20">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-white">{item.description}</div>
                            <div className="text-sm text-orange-300">{item.dataType}</div>
                            <div className="text-xs text-orange-400 mt-1">
                              Per 100g: {item.foodNutrients.find(n => n.nutrientId === 1008)?.value || 0} cal
                            </div>
                          </div>
                          <Button
                            onClick={() => addFoodFromUSDA(item)}
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Photo Analysis */}
              <div className="space-y-4 p-4 bg-orange-900/20 rounded-lg border border-orange-500/20">
                <h3 className="text-lg font-semibold text-orange-200 flex items-center">
                  <Camera className="w-5 h-5 mr-2" />
                  Photo Ingredient Analysis
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-orange-200">Upload Food Photo</Label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedPhoto(e.target.files?.[0] || null)}
                      className="w-full p-2 bg-orange-800/50 border border-orange-500/30 rounded text-white"
                    />
                  </div>
                  
                  {selectedPhoto && (
                    <div className="space-y-2">
                      <div className="text-sm text-orange-300">
                        📸 {selectedPhoto.name} ({(selectedPhoto.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                      <Button
                        onClick={analyzePhotoIngredients}
                        disabled={isAnalyzing}
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Analyzing Ingredients...
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4 mr-2" />
                            Analyze & Separate Ingredients
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Food Entries & Daily Summary */}
          <Card className="bg-gradient-to-br from-orange-900/20 to-amber-900/30 backdrop-blur-sm border-orange-500/30">
            <CardHeader>
              <CardTitle className="text-white">Daily Food Log</CardTitle>
              <CardDescription className="text-orange-200/80">
                Your meals for {new Date(selectedDate).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Daily Totals */}
              {foodEntries.length > 0 && (
                <div className="space-y-4 p-4 bg-orange-900/20 rounded-lg border border-orange-500/20">
                  <h3 className="text-lg font-semibold text-orange-200 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Daily Totals
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">{totals.calories}</div>
                      <div className="text-sm text-orange-300">Calories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">{totals.protein.toFixed(1)}g</div>
                      <div className="text-sm text-orange-300">Protein</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">{totals.carbs.toFixed(1)}g</div>
                      <div className="text-sm text-orange-300">Carbs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">{totals.fat.toFixed(1)}g</div>
                      <div className="text-sm text-orange-300">Fat</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">{totals.fiber.toFixed(1)}g</div>
                      <div className="text-sm text-orange-300">Fiber</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Food Entries List */}
              {foodEntries.length === 0 ? (
                <div className="text-center py-8 text-orange-300/70">
                  <Utensils className="w-12 h-12 mx-auto mb-3 text-orange-400/50" />
                  <p>No food entries for this date yet.</p>
                  <p className="text-sm mt-1">Search USDA database or upload a photo!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {foodEntries.map((entry) => (
                    <div key={entry.id} className="p-3 bg-orange-900/30 rounded-lg border border-orange-500/20">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-white">{entry.food_name}</div>
                          <div className="text-sm text-orange-300">{entry.portion_size}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs border-orange-400/30 text-orange-300 bg-orange-500/10 capitalize">
                              {entry.meal_type}
                            </Badge>
                            {entry.food_name.includes('📸') && (
                              <Badge variant="outline" className="text-xs border-pink-400/30 text-pink-300 bg-pink-500/10">
                                Photo Analysis
                              </Badge>
                            )}
                            {entry.food_name.includes('🥗') && (
                              <Badge variant="outline" className="text-xs border-green-400/30 text-green-300 bg-green-500/10">
                                USDA Database
                              </Badge>
                            )}
                          </div>
                        </div>
                        {entry.calories && (
                          <div className="text-right">
                            <div className="text-orange-200 font-medium">{entry.calories} cal</div>
                            <div className="text-xs text-orange-300">
                              P: {entry.protein?.toFixed(1)}g | C: {entry.carbs?.toFixed(1)}g | F: {entry.fat?.toFixed(1)}g
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SmartFoodLog;
