import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, 
  Search, 
  Plus, 
  Utensils, 
  Zap,
  Target,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/ui/app-shell';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FoodItem {
  id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  portion_size: string;
  meal_type: string;
  logged_date: string;
}

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DailyNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

const SmartFoodLog = () => {
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [customFood, setCustomFood] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    portion: ''
  });
  const [dailyEntries, setDailyEntries] = useState<FoodItem[]>([]);
  const [dailyNutrition, setDailyNutrition] = useState<DailyNutrition>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0
  });
  const [nutritionGoals] = useState<NutritionGoals>({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 67
  });

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  useEffect(() => {
    loadTodayEntries();
  }, [user]);

  const loadTodayEntries = async () => {
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

      setDailyEntries(data || []);
      calculateDailyNutrition(data || []);
    } catch (error) {
      console.error('Error loading food entries:', error);
    }
  };

  const calculateDailyNutrition = (entries: FoodItem[]) => {
    const totals = entries.reduce(
      (acc, entry) => ({
        calories: acc.calories + (entry.calories || 0),
        protein: acc.protein + (entry.protein || 0),
        carbs: acc.carbs + (entry.carbs || 0),
        fat: acc.fat + (entry.fat || 0),
        fiber: acc.fiber + (entry.fiber || 0)
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );
    setDailyNutrition(totals);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const analyzeFood = async () => {
    if (!selectedFile || !user) return;

    setIsAnalyzing(true);
    
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          
          // Call AI analysis function
          const { data: analysisData, error: analysisError } = await supabase.functions.invoke('food-photo-ai', {
            body: { 
              image: base64,
              mealType: selectedMealType
            }
          });

          if (analysisError) throw analysisError;
          if (analysisData.error) throw new Error(analysisData.error);

          // Handle the response format - foodsDetected array
          const foodsDetected = analysisData.foodsDetected || [];
          
          if (foodsDetected.length === 0) {
            toast.error('No food detected. Try a clearer photo or add manually.');
            setIsAnalyzing(false);
            return;
          }

          // Add each detected food to entries
          for (const food of foodsDetected) {
            const foodEntry = {
              user_id: user.id,
              food_name: `📸 ${food.name}`,
              calories: Math.round(food.calories || 0),
              protein: Math.round((food.protein || 0) * 10) / 10,
              carbs: Math.round((food.carbs || 0) * 10) / 10,
              fat: Math.round((food.fat || 0) * 10) / 10,
              fiber: Math.round((food.fiber || 0) * 10) / 10,
              portion_size: food.quantity || '1 serving',
              meal_type: selectedMealType,
              logged_date: new Date().toISOString().split('T')[0]
            };

            const { error: dbError } = await supabase
              .from('food_log_entries')
              .insert(foodEntry);

            if (dbError) throw dbError;
          }

          toast.success(`Added ${foodsDetected.length} food(s) to your log! 📸`);
          loadTodayEntries();
          setSelectedFile(null);
          setPreviewUrl(null);
        } catch (err) {
          console.error('Analysis error:', err);
          toast.error(err instanceof Error ? err.message : 'Failed to analyze food. Please try again.');
        } finally {
          setIsAnalyzing(false);
        }
      };

      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze food. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const addCustomFood = async () => {
    if (!user || !customFood.name || !customFood.calories) {
      toast.error('Please fill in at least food name and calories');
      return;
    }

    try {
      const foodEntry = {
        user_id: user.id,
        food_name: customFood.name,
        calories: parseInt(customFood.calories) || 0,
        protein: parseFloat(customFood.protein) || 0,
        carbs: parseFloat(customFood.carbs) || 0,
        fat: parseFloat(customFood.fat) || 0,
        fiber: 0,
        portion_size: customFood.portion || '1 serving',
        meal_type: selectedMealType,
        logged_date: new Date().toISOString().split('T')[0]
      };

      const { error } = await supabase
        .from('food_log_entries')
        .insert(foodEntry);

      if (error) throw error;

      toast.success('Food added successfully!');
      setCustomFood({ name: '', calories: '', protein: '', carbs: '', fat: '', portion: '' });
      loadTodayEntries();
    } catch (error) {
      console.error('Error adding food:', error);
      toast.error('Failed to add food');
    }
  };

  const searchFood = async () => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      toast.error('Please enter at least 3 characters');
      return;
    }

    setIsSearching(true);
    setSearchResults([]);
    
    try {
      const { data, error } = await supabase.functions.invoke('usda-food-proxy', {
        body: { query: searchQuery, pageSize: 15 }
      });

      if (error) throw error;

      // Format USDA foods
      const foods = data?.foods || [];
      const formatted = foods.map((food: any) => {
        const nutrients = food.foodNutrients || [];
        const findNutrient = (ids: number[]) => {
          for (const id of ids) {
            const n = nutrients.find((n: any) => n.nutrientId === id);
            if (n) return n.value || 0;
          }
          return 0;
        };
        
        return {
          fdcId: food.fdcId,
          name: food.description,
          brand: food.brandOwner || food.brandName || null,
          dataType: food.dataType,
          calories: Math.round(findNutrient([1008])),
          protein: Math.round(findNutrient([1003]) * 10) / 10,
          carbs: Math.round(findNutrient([1005, 1050]) * 10) / 10,
          fat: Math.round(findNutrient([1004]) * 10) / 10,
          fiber: Math.round(findNutrient([1079]) * 10) / 10,
        };
      });
      
      setSearchResults(formatted);
      
      if (formatted.length === 0) {
        toast.info('No foods found. Try a different search term.');
      }
    } catch (error) {
      console.error('Food search error:', error);
      toast.error('Food search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const addFoodFromSearch = async (food: any) => {
    if (!user) return;
    
    try {
      const foodEntry = {
        user_id: user.id,
        food_name: `🥗 ${food.name}${food.brand ? ` (${food.brand})` : ''}`,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber,
        portion_size: '100g',
        meal_type: selectedMealType,
        logged_date: new Date().toISOString().split('T')[0]
      };

      const { error } = await supabase
        .from('food_log_entries')
        .insert(foodEntry);

      if (error) throw error;

      toast.success(`${food.name} added to your log! 🥗`);
      setSearchResults([]);
      setSearchQuery('');
      loadTodayEntries();
    } catch (error) {
      console.error('Error adding food:', error);
      toast.error('Failed to add food');
    }
  };

  const getNutritionProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getMacroColor = (type: string) => {
    switch (type) {
      case 'protein': return 'text-blue-400';
      case 'carbs': return 'text-green-400';
      case 'fat': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <AppShell title="Smart Food Log" showBackButton>
      <div className="min-h-screen bg-gradient-to-br from-background via-green-900/10 to-orange-900/20 p-4 space-y-6">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-orange-500">
              <Utensils className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-orange-400 bg-clip-text text-transparent">
              Smart Food Log
            </h1>
          </div>
        </motion.div>

        {/* Daily Nutrition Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-green-500/10 to-orange-500/10 border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Today's Nutrition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-orange-400">
                    {Math.round(dailyNutrition.calories)}
                  </div>
                  <div className="text-sm text-muted-foreground">Calories</div>
                  <Progress 
                    value={getNutritionProgress(dailyNutrition.calories, nutritionGoals.calories)} 
                    className="h-2" 
                  />
                  <div className="text-xs">{nutritionGoals.calories} goal</div>
                </div>

                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-blue-400">
                    {Math.round(dailyNutrition.protein)}g
                  </div>
                  <div className="text-sm text-muted-foreground">Protein</div>
                  <Progress 
                    value={getNutritionProgress(dailyNutrition.protein, nutritionGoals.protein)} 
                    className="h-2" 
                  />
                  <div className="text-xs">{nutritionGoals.protein}g goal</div>
                </div>

                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-green-400">
                    {Math.round(dailyNutrition.carbs)}g
                  </div>
                  <div className="text-sm text-muted-foreground">Carbs</div>
                  <Progress 
                    value={getNutritionProgress(dailyNutrition.carbs, nutritionGoals.carbs)} 
                    className="h-2" 
                  />
                  <div className="text-xs">{nutritionGoals.carbs}g goal</div>
                </div>

                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-yellow-400">
                    {Math.round(dailyNutrition.fat)}g
                  </div>
                  <div className="text-sm text-muted-foreground">Fat</div>
                  <Progress 
                    value={getNutritionProgress(dailyNutrition.fat, nutritionGoals.fat)} 
                    className="h-2" 
                  />
                  <div className="text-xs">{nutritionGoals.fat}g goal</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="photo" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="photo">Photo</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="history">Today</TabsTrigger>
          </TabsList>

          <TabsContent value="photo" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-card/50 backdrop-blur border-green-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    AI Photo Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select meal type" />
                    </SelectTrigger>
                    <SelectContent>
                      {mealTypes.map((meal) => (
                        <SelectItem key={meal} value={meal}>
                          {meal.charAt(0).toUpperCase() + meal.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-green-500/30 rounded-lg p-8 text-center hover:border-green-500/50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="food-photo-upload"
                        />
                        <label htmlFor="food-photo-upload" className="cursor-pointer space-y-4">
                          <Camera className="h-12 w-12 mx-auto text-green-500" />
                          <div>
                            <p className="font-medium">Take or upload food photo</p>
                            <p className="text-sm text-muted-foreground">
                              AI will analyze nutrition automatically
                            </p>
                          </div>
                        </label>
                      </div>
                      
                      {selectedFile && (
                        <Button 
                          onClick={analyzeFood}
                          disabled={isAnalyzing}
                          className="w-full bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
                        >
                          {isAnalyzing ? (
                            <>
                              <Zap className="h-4 w-4 mr-2 animate-pulse" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Zap className="h-4 w-4 mr-2" />
                              Analyze Food
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    
                    {previewUrl && (
                      <div className="space-y-2">
                        <p className="font-medium">Preview</p>
                        <img 
                          src={previewUrl} 
                          alt="Food preview" 
                          className="w-full h-64 object-cover rounded-lg border border-green-500/20"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Food Database Search
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    {mealTypes.map((meal) => (
                      <SelectItem key={meal} value={meal}>
                        {meal.charAt(0).toUpperCase() + meal.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for food (e.g., apple, chicken breast)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchFood()}
                    className="flex-1"
                  />
                  <Button onClick={searchFood} disabled={isSearching || searchQuery.length < 3}>
                    {isSearching ? (
                      <Zap className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {searchResults.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    <p className="text-sm text-muted-foreground">Found {searchResults.length} results (per 100g)</p>
                    {searchResults.map((food) => (
                      <div 
                        key={food.fdcId} 
                        className="p-3 bg-muted/50 hover:bg-muted rounded-lg border border-border/50 transition-colors"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{food.name}</div>
                            {food.brand && (
                              <div className="text-sm text-muted-foreground truncate">{food.brand}</div>
                            )}
                            <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                              <span className="text-orange-400">{food.calories} cal</span>
                              <span className="text-blue-400">{food.protein}g P</span>
                              <span className="text-green-400">{food.carbs}g C</span>
                              <span className="text-yellow-400">{food.fat}g F</span>
                            </div>
                          </div>
                          <Button
                            onClick={() => addFoodFromSearch(food)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 flex-shrink-0"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : isSearching ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Zap className="h-8 w-8 mx-auto animate-pulse mb-2 text-orange-400" />
                    Searching USDA database...
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Enter at least 3 characters and press Search
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Food Manually
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    {mealTypes.map((meal) => (
                      <SelectItem key={meal} value={meal}>
                        {meal.charAt(0).toUpperCase() + meal.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Food name"
                    value={customFood.name}
                    onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
                  />
                  <Input
                    placeholder="Portion size"
                    value={customFood.portion}
                    onChange={(e) => setCustomFood({ ...customFood, portion: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Input
                    type="number"
                    placeholder="Calories"
                    value={customFood.calories}
                    onChange={(e) => setCustomFood({ ...customFood, calories: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Protein (g)"
                    value={customFood.protein}
                    onChange={(e) => setCustomFood({ ...customFood, protein: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Carbs (g)"
                    value={customFood.carbs}
                    onChange={(e) => setCustomFood({ ...customFood, carbs: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Fat (g)"
                    value={customFood.fat}
                    onChange={(e) => setCustomFood({ ...customFood, fat: e.target.value })}
                  />
                </div>

                <Button onClick={addCustomFood} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Food
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Today's Food Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dailyEntries.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No food logged today. Start tracking your nutrition!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dailyEntries.map((entry) => (
                      <div key={entry.id} className="p-4 border rounded-lg bg-muted/30">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{entry.food_name}</h3>
                          <Badge variant="secondary">
                            {entry.meal_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {entry.portion_size}
                        </p>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">{entry.calories}</span>
                            <div className="text-xs text-muted-foreground">cal</div>
                          </div>
                          <div className={getMacroColor('protein')}>
                            <span className="font-medium">{entry.protein}g</span>
                            <div className="text-xs text-muted-foreground">protein</div>
                          </div>
                          <div className={getMacroColor('carbs')}>
                            <span className="font-medium">{entry.carbs}g</span>
                            <div className="text-xs text-muted-foreground">carbs</div>
                          </div>
                          <div className={getMacroColor('fat')}>
                            <span className="font-medium">{entry.fat}g</span>
                            <div className="text-xs text-muted-foreground">fat</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
};

export default SmartFoodLog;