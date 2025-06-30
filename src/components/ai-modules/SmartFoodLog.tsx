import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Utensils, BarChart3, Camera, Search, Database, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MobileHeader } from '@/components/MobileHeader';
import { Badge } from '@/components/ui/badge';
import FoodEntryModal from './FoodEntryModal';
import { Trash2 } from 'lucide-react';
import FooterLinks from '@/components/dashboard/FooterLinks';
import { usdaFoodService } from '@/services/usdaFoodService';

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

interface SmartFoodLogProps {
  onBack: () => void;
}

export const SmartFoodLog: React.FC<SmartFoodLogProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [portionSize, setPortionSize] = useState('100');
  const [showCustomFoodModal, setShowCustomFoodModal] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [noResultsMessage, setNoResultsMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadFoodEntries();
    }
  }, [user, selectedDate]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 3) {
        performUSDASearch(searchQuery);
      } else if (searchQuery.trim().length === 0) {
        setSearchResults([]);
        setSearchError(null);
        setNoResultsMessage(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

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

  const performUSDASearch = async (query: string) => {
    setIsSearching(true);
    setSearchError(null);
    setNoResultsMessage(null);
    
    try {
      const response = await usdaFoodService.searchFoods(query, 15);
      
      if (response.foods.length === 0) {
        setNoResultsMessage(`No exact match found for "${query}". Would you like to add this food manually?`);
        setSearchResults([]);
      } else {
        const formattedResults = response.foods.map(food => usdaFoodService.formatFoodDisplay(food));
        setSearchResults(formattedResults);
        setNoResultsMessage(null);
      }
    } catch (error) {
      console.error('USDA search error:', error);
      setSearchError(error instanceof Error ? error.message : 'Failed to search USDA database. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addFoodFromUSDA = async (foodItem: any) => {
    if (!user) return;

    try {
      // Calculate based on portion size
      const portionMultiplier = parseFloat(portionSize) / 100;

      const newEntry = {
        id: Date.now().toString(),
        user_id: user.id,
        food_name: `🥗 ${foodItem.name}${foodItem.brand ? ` (${foodItem.brand})` : ''}`,
        portion_size: `${portionSize}g`,
        meal_type: mealType,
        logged_date: selectedDate,
        calories: Math.round(foodItem.calories * portionMultiplier),
        protein: Math.round(foodItem.protein * portionMultiplier * 10) / 10,
        carbs: Math.round(foodItem.carbs * portionMultiplier * 10) / 10,
        fat: Math.round(foodItem.fat * portionMultiplier * 10) / 10,
        fiber: Math.round(foodItem.fiber * portionMultiplier * 10) / 10,
        created_at: new Date().toISOString()
      };

      setFoodEntries(prev => [...prev, newEntry]);
      setSearchQuery('');
      setSearchResults([]);
      setSearchError(null);
      setNoResultsMessage(null);
      
      toast({
        title: 'Food Added! 🥗',
        description: `${foodItem.name} added from USDA database.`
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

  const addCustomFood = async (foodData: any) => {
    if (!user) return;

    try {
      const newEntry = {
        id: Date.now().toString(),
        user_id: user.id,
        ...foodData,
        logged_date: selectedDate,
        created_at: new Date().toISOString()
      };

      setFoodEntries(prev => [...prev, newEntry]);
      
      toast({
        title: 'Custom Food Added! 📝',
        description: `${foodData.food_name.replace('📝 ', '')} added successfully.`
      });
    } catch (error) {
      console.error('Error adding custom food:', error);
      toast({
        title: 'Error',
        description: 'Failed to add custom food.',
        variant: 'destructive'
      });
    }
  };

  const removeFoodEntry = async (entryId: string) => {
    try {
      setFoodEntries(prev => prev.filter(entry => entry.id !== entryId));
      toast({
        title: 'Food Removed',
        description: 'Food entry has been deleted.'
      });
    } catch (error) {
      console.error('Error removing food entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove food entry.',
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
        const newEntry = {
          id: Date.now().toString() + Math.random(),
          user_id: user.id,
          food_name: `📸 ${ingredient.name}`,
          portion_size: ingredient.amount,
          meal_type: mealType,
          logged_date: selectedDate,
          calories: ingredient.calories,
          protein: ingredient.protein,
          carbs: ingredient.carbs,
          fat: ingredient.fat,
          fiber: ingredient.fiber,
          created_at: new Date().toISOString()
        };
        
        setFoodEntries(prev => [...prev, newEntry]);
      }

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
                    Search live USDA nutrition data
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

              {/* USDA Live Search */}
              <div className="space-y-4 p-4 bg-orange-900/20 rounded-lg border border-orange-500/20">
                <h3 className="text-lg font-semibold text-orange-200 flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  Live USDA Search
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-orange-200">Search Food (type 3+ characters)</Label>
                    <div className="relative">
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="e.g., semolina flour, chicken breast, apple"
                        className="bg-orange-800/50 border-orange-500/30 text-white placeholder:text-orange-300/50 pr-10"
                      />
                      {isSearching && (
                        <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-orange-400" />
                      )}
                    </div>
                  </div>

                  {/* Portion Size and Meal Type */}
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
                      <Select value={mealType} onValueChange={setMealType}>
                        <SelectTrigger className="bg-orange-800/50 border-orange-500/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-orange-800 border-orange-500/30 z-50">
                          <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
                          <SelectItem value="lunch">☀️ Lunch</SelectItem>
                          <SelectItem value="dinner">🌙 Dinner</SelectItem>
                          <SelectItem value="snack">🥨 Snack</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Error Messages */}
                  {searchError && (
                    <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-200 text-sm">{searchError}</p>
                        <Button
                          onClick={() => setShowCustomFoodModal(true)}
                          size="sm"
                          className="mt-2 bg-red-600 hover:bg-red-700"
                        >
                          Add Custom Food
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* No Results Message */}
                  {noResultsMessage && (
                    <div className="p-3 bg-yellow-900/30 border border-yellow-500/30 rounded-lg">
                      <p className="text-yellow-200 text-sm">{noResultsMessage}</p>
                      <Button
                        onClick={() => setShowCustomFoodModal(true)}
                        size="sm"
                        className="mt-2 bg-yellow-600 hover:bg-yellow-700"
                      >
                        Add Custom Food
                      </Button>
                    </div>
                  )}
                  
                  {/* USDA Search Results */}
                  {searchResults.length > 0 && (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      <Label className="text-orange-200">Live USDA Results</Label>
                      {searchResults.map((item) => (
                        <div key={item.fdcId} className="p-3 bg-orange-800/30 rounded-lg border border-orange-500/20 hover:bg-orange-800/40 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-white truncate">{item.name}</div>
                              {item.brand && (
                                <div className="text-sm text-orange-300 truncate">Brand: {item.brand}</div>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs border-green-400/30 text-green-300 bg-green-500/10">
                                  {item.dataType}
                                </Badge>
                              </div>
                              <div className="text-xs text-orange-400 mt-1">
                                Per 100g: {item.calories} cal, {item.protein}g protein, {item.carbs}g carbs, {item.fat}g fat
                              </div>
                              {item.householdServing && (
                                <div className="text-xs text-orange-400">
                                  Serving: {item.householdServing}
                                </div>
                              )}
                            </div>
                            <Button
                              onClick={() => addFoodFromUSDA(item)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 flex-shrink-0 ml-2"
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
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
                  <p className="text-sm mt-1">Search USDA database or add custom food!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {foodEntries.map((entry) => (
                    <div key={entry.id} className="p-3 bg-orange-900/30 rounded-lg border border-orange-500/20 group hover:bg-orange-900/40 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate">{entry.food_name}</div>
                          <div className="text-sm text-orange-300 truncate">{entry.portion_size}</div>
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
                            {entry.food_name.includes('📝') && (
                              <Badge variant="outline" className="text-xs border-blue-400/30 text-blue-300 bg-blue-500/10">
                                Custom Entry
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {entry.calories !== undefined && (
                            <div className="text-right min-w-[80px]">
                              <div className="text-orange-200 font-medium">{entry.calories} cal</div>
                              <div className="text-xs text-orange-300">
                                P: {entry.protein?.toFixed(1)}g | C: {entry.carbs?.toFixed(1)}g | F: {entry.fat?.toFixed(1)}g
                              </div>
                            </div>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFoodEntry(entry.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            aria-label={`Remove ${entry.food_name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <FoodEntryModal
        isOpen={showCustomFoodModal}
        onClose={() => {
          setShowCustomFoodModal(false);
          setNoResultsMessage(null);
        }}
        onAddFood={addCustomFood}
        mealType={mealType}
        initialFoodName={noResultsMessage ? searchQuery : ''}
      />

      {/* Legal Footer */}
      <FooterLinks />
    </div>
  );
};

export default SmartFoodLog;
