import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Utensils, BarChart3, Camera, Search, Database, Loader2, AlertCircle, Refrigerator, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MobileHeader } from '@/components/MobileHeader';
import { Badge } from '@/components/ui/badge';
import { RateLimitBadge, RateLimitWarning } from '@/components/ui/rate-limit-badge';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import FoodEntryModal from './FoodEntryModal';
import { Trash2 } from 'lucide-react';
import FooterLinks from '@/components/dashboard/FooterLinks';
import { usdaFoodService } from '@/services/usdaFoodService';
import { useGlobalState } from '@/contexts/GlobalStateContext';
import { handleAsync } from '@/utils/errorHandler';
import { useAppSync } from '@/utils/appSynchronization';
import { triggerHapticFeedback } from '@/hooks/useOptimisticUpdate';

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
  const navigate = useNavigate();
  const { user } = useAuth();
  const { actions } = useGlobalState();
  const { getCache, setCache, invalidateCache, emit } = useAppSync();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [portionSize, setPortionSize] = useState('100');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [noResultsMessage, setNoResultsMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadFoodEntries();
    }
  }, [user, selectedDate]);

  // Check for new food entries from AddFood page
  useEffect(() => {
    const checkForNewFood = () => {
      const newFoodData = sessionStorage.getItem('newFoodEntry');
      if (newFoodData) {
        const foodData = JSON.parse(newFoodData);
        sessionStorage.removeItem('newFoodEntry');
        
        // Add the food entry
        const addEntry = async () => {
          try {
            const { error } = await supabase.from('food_log').insert([{
              user_id: user?.id,
              food_name: foodData.name,
              calories: foodData.calories,
              protein: foodData.protein,
              carbs: foodData.carbs,
              fat: foodData.fat,
              fiber: foodData.fiber || 0,
              portion_size: foodData.portion_size,
              meal_type: foodData.meal_type,
              logged_at: foodData.timestamp
            }]);
            
            if (error) throw error;
            loadFoodEntries();
          } catch (error) {
            console.error('Error adding food:', error);
          }
        };
        addEntry();
      }
    };

    window.addEventListener('focus', checkForNewFood);
    return () => window.removeEventListener('focus', checkForNewFood);
  }, [user]);

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

    setIsLoadingEntries(true);
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
      toast.error('Failed to load food entries');
    } finally {
      setIsLoadingEntries(false);
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

    // Calculate based on portion size
    const portionMultiplier = parseFloat(portionSize) / 100;
    
    // Create temp ID for optimistic update
    const tempId = `temp-${Date.now()}`;

    const newEntry = {
      id: tempId,
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
    };

    // Optimistic update - add immediately
    setFoodEntries(prev => [...prev, newEntry as FoodEntry]);
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
    setNoResultsMessage(null);
    
    toast.success(`${foodItem.name} saved to your food log 🥗`);

    try {
      // Save to database
      const { data, error } = await supabase
        .from('food_log_entries')
        .insert([{ ...newEntry, id: undefined }])
        .select()
        .single();

      if (error) throw error;

      // Replace temp entry with real one
      setFoodEntries(prev => prev.map(e => e.id === tempId ? data : e));
      
      // Invalidate related caches
      invalidateCache(`food-log-${user.id}`);
      emit('nutrition:updated', user.id);
    } catch (error) {
      // Rollback on error
      setFoodEntries(prev => prev.filter(e => e.id !== tempId));
      console.error('Error saving food from USDA:', error);
      toast.error('Failed to save food from USDA database');
    }
  };

  const addCustomFood = async (foodData: any) => {
    if (!user) return;

    try {
      const newEntry = {
        user_id: user.id,
        ...foodData,
        logged_date: selectedDate,
      };

      // Save to database
      const { data, error } = await supabase
        .from('food_log_entries')
        .insert([newEntry])
        .select()
        .single();

      if (error) throw error;

      // Add to local state with database ID
      setFoodEntries(prev => [...prev, data]);
      
      toast.success(`${foodData.food_name.replace('📝 ', '')} saved to your food log 📝`);
    } catch (error) {
      console.error('Error saving custom food:', error);
      toast.error('Failed to save custom food');
    }
  };

  const removeFoodEntry = async (entryId: string) => {
    // Store for rollback
    const previousEntries = [...foodEntries];
    const removedEntry = foodEntries.find(e => e.id === entryId);
    
    // Trigger haptic feedback
    triggerHapticFeedback('medium');
    
    // Optimistic update - remove immediately
    setFoodEntries(prev => prev.filter(entry => entry.id !== entryId));

    // Show toast with undo action
    toast.success('Food entry removed', {
      action: {
        label: 'Undo',
        onClick: async () => {
          // Trigger haptic for undo
          triggerHapticFeedback('light');
          
          // Restore locally first
          if (removedEntry) {
            setFoodEntries(prev => [...prev, removedEntry]);
          }
          
          // Re-insert to database if it was already deleted
          if (removedEntry && !removedEntry.id.startsWith('temp-')) {
            try {
              const { error } = await supabase
                .from('food_log_entries')
                .insert([{
                  user_id: user?.id,
                  food_name: removedEntry.food_name,
                  portion_size: removedEntry.portion_size,
                  meal_type: removedEntry.meal_type,
                  logged_date: removedEntry.logged_date,
                  calories: removedEntry.calories,
                  protein: removedEntry.protein,
                  carbs: removedEntry.carbs,
                  fat: removedEntry.fat,
                  fiber: removedEntry.fiber,
                }]);
              
              if (error) throw error;
              toast.success('Food entry restored');
              loadFoodEntries(); // Refresh to get new ID
            } catch (error) {
              console.error('Failed to restore food entry:', error);
              setFoodEntries(prev => prev.filter(e => e.id !== removedEntry.id));
              toast.error('Failed to restore food entry');
            }
          }
        }
      },
      duration: 5000,
    });

    try {
      // Remove from database
      const { error } = await supabase
        .from('food_log_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;
      
      // Haptic success feedback
      triggerHapticFeedback('success');
    } catch (error) {
      // Rollback on error
      setFoodEntries(previousEntries);
      triggerHapticFeedback('error');
      console.error('Error removing food entry:', error);
      toast.error('Failed to remove food entry');
    }
  };

  const compressImage = (file: File, maxSizeMB: number = 2): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 1024px)
        let { width, height } = img;
        const maxSize = 1024;
        
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Try different quality levels until under size limit
        let quality = 0.8;
        const tryCompress = () => {
          const base64 = canvas.toDataURL('image/jpeg', quality);
          const sizeInMB = (base64.length * 0.75) / (1024 * 1024);
          
          if (sizeInMB <= maxSizeMB || quality <= 0.1) {
            resolve(base64);
          } else {
            quality -= 0.1;
            tryCompress();
          }
        };
        
        tryCompress();
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const analyzePhotoIngredients = async () => {
    if (!selectedPhoto || !user) return;

    setIsAnalyzing(true);
    setSearchError(null);
    
    try {
      // Compress image if needed
      const base64Image = await compressImage(selectedPhoto, 2);
      
      const { data, error } = await supabase.functions.invoke('food-photo-ai', {
        body: {
          image: base64Image,
          mealType: mealType
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const analysis = data;
      
      if (analysis.confidence === 'low' || !analysis.foodsDetected?.length) {
        // Navigate to manual entry
        setSearchError('Could not identify foods clearly from photo');
        setNoResultsMessage('Photo unclear - add foods manually for best accuracy');
        navigate(`/add-food?meal=${mealType}`);
        return;
      }

      // Process detected foods
      const entries = analysis.foodsDetected.map((food: any) => ({
        user_id: user.id,
        food_name: `📸 ${food.name}`,
        portion_size: food.quantity || '1 serving',
        meal_type: mealType,
        logged_date: selectedDate,
        calories: Math.round(food.calories || 0),
        protein: Math.round((food.protein || 0) * 10) / 10,
        carbs: Math.round((food.carbs || 0) * 10) / 10,
        fat: Math.round((food.fat || 0) * 10) / 10,
        fiber: Math.round((food.fiber || 0) * 10) / 10,
      }));

      const { data: savedEntries, error: saveError } = await supabase
        .from('food_log_entries')
        .insert(entries)
        .select();

      if (saveError) throw saveError;

      setFoodEntries(prev => [...prev, ...savedEntries]);
      setSelectedPhoto(null);
      
      toast.success(`Added ${entries.length} foods to your log 📸`);
      
    } catch (error) {
      console.error('Photo analysis error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Analysis failed';
      
      setSearchError(errorMsg.includes('too large') ? 
        'Image too large - please use a smaller photo' : 
        'Analysis failed - try a clearer, well-lit photo'
      );
      setNoResultsMessage('Manual entry recommended for accuracy');
      
      toast.error('Analysis failed - try manual entry or better lighting');
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

  const handleMealTypeChange = (value: string) => {
    setMealType(value as 'breakfast' | 'lunch' | 'dinner' | 'snack');
  };

  const totals = getTotalNutrition();

  // MobileHeader handles returnTo state from location.state automatically
  const handleBackNavigation = useCallback(() => {
    const state = (window.history.state?.usr as { returnTo?: string } | null);
    if (state?.returnTo) {
      navigate(state.returnTo);
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/modules');
    }
  }, [navigate]);

  const handleRefresh = async () => {
    await loadFoodEntries();
  };

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader 
        title="Smart Food Log" 
        onBack={handleBackNavigation}
      />
      
      <PullToRefresh onRefresh={handleRefresh} skeletonVariant="list">
        <div className="px-4 pb-28">
        {/* Hero */}
        <div className="text-center py-6">
          <div className="w-14 h-14 mx-auto bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-2xl flex items-center justify-center mb-3 border border-orange-500/20">
            <Utensils className="w-7 h-7 text-orange-400" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-1">Smart Food Log</h2>
          <p className="text-sm text-muted-foreground">AI-powered nutrition tracking</p>
          <div className="flex justify-center mt-3">
            <RateLimitBadge 
              featureKey="food_log_analyses" 
              featureName="Food analyses"
              showProgress
            />
          </div>
        </div>

        {/* Date Selection */}
        <div className="mb-4">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-muted/30 border-border h-11 rounded-xl"
            aria-label="Select date"
          />
        </div>

        {/* Daily Summary */}
        {foodEntries.length > 0 && (
          <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20 mb-4">
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground text-sm flex items-center mb-3">
                <BarChart3 className="w-4 h-4 mr-2 text-orange-400" />
                Daily Totals
              </h3>
              <div className="grid grid-cols-5 gap-2">
                <div className="text-center p-2 bg-background/50 rounded-lg">
                  <div className="text-lg font-bold text-foreground">{totals.calories}</div>
                  <div className="text-[10px] text-muted-foreground">Cal</div>
                </div>
                <div className="text-center p-2 bg-background/50 rounded-lg">
                  <div className="text-lg font-bold text-foreground">{totals.protein.toFixed(0)}g</div>
                  <div className="text-[10px] text-muted-foreground">Protein</div>
                </div>
                <div className="text-center p-2 bg-background/50 rounded-lg">
                  <div className="text-lg font-bold text-foreground">{totals.carbs.toFixed(0)}g</div>
                  <div className="text-[10px] text-muted-foreground">Carbs</div>
                </div>
                <div className="text-center p-2 bg-background/50 rounded-lg">
                  <div className="text-lg font-bold text-foreground">{totals.fat.toFixed(0)}g</div>
                  <div className="text-[10px] text-muted-foreground">Fat</div>
                </div>
                <div className="text-center p-2 bg-background/50 rounded-lg">
                  <div className="text-lg font-bold text-foreground">{totals.fiber.toFixed(0)}g</div>
                  <div className="text-[10px] text-muted-foreground">Fiber</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button
            onClick={() => navigate(`/add-food?meal=${mealType}`)}
            className="h-12 bg-primary hover:bg-primary/90 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Food
          </Button>
          <Select value={mealType} onValueChange={handleMealTypeChange}>
            <SelectTrigger className="h-12 bg-muted/30 border-border rounded-xl" aria-label="Select meal type">
              <SelectValue placeholder="Meal type" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border rounded-xl">
              <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
              <SelectItem value="lunch">☀️ Lunch</SelectItem>
              <SelectItem value="dinner">🌙 Dinner</SelectItem>
              <SelectItem value="snack">🥨 Snack</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* FridgeScan Promo */}
        <button
          onClick={() => navigate('/fridge-scan')}
          className="w-full mb-4 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl flex items-center gap-3 hover:from-cyan-500/15 hover:to-blue-500/15 transition-colors text-left"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Refrigerator className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-foreground text-sm flex items-center gap-2">
              FridgeScan
              <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full font-medium">New</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Snap your fridge → Get macro-fit meals
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </button>

        {/* USDA Search */}
        <Card className="bg-card/50 border-border/50 mb-4">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground text-sm">USDA Database Search</span>
            </div>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search foods..."
                  className="bg-muted/30 border-border h-11 rounded-xl pr-10"
                  aria-label="Search USDA database"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.length >= 3) {
                      performUSDASearch(searchQuery);
                    }
                  }}
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-3.5 w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>
              <Button
                onClick={() => performUSDASearch(searchQuery)}
                disabled={searchQuery.length < 3 || isSearching}
                className="h-11 px-4 bg-primary hover:bg-primary/90 rounded-xl"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                value={portionSize}
                onChange={(e) => setPortionSize(e.target.value)}
                placeholder="Portion (g)"
                className="bg-muted/30 border-border h-10 rounded-xl text-sm"
                aria-label="Portion size in grams"
              />
            </div>

            {/* Error Message */}
            {searchError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-destructive text-xs">{searchError}</p>
              </div>
            )}

            {/* No Results */}
            {noResultsMessage && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <p className="text-amber-500 text-xs">{noResultsMessage}</p>
                <Button
                  onClick={() => navigate(`/add-food?meal=${mealType}&name=${searchQuery}`)}
                  size="sm"
                  className="mt-2 h-8 text-xs"
                >
                  Add Custom
                </Button>
              </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-muted/30 rounded-xl border border-border/50 max-h-64 overflow-y-auto">
                {searchResults.map((item) => (
                  <div 
                    key={item.fdcId} 
                    className="p-3 border-b border-border/30 last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground text-sm truncate">{item.name}</div>
                        {item.brand && (
                          <div className="text-xs text-muted-foreground truncate">{item.brand}</div>
                        )}
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {item.calories} cal | P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g
                        </div>
                      </div>
                      <Button
                        onClick={() => addFoodFromUSDA(item)}
                        size="sm"
                        className="h-8 px-3 bg-green-600 hover:bg-green-700 rounded-lg flex-shrink-0"
                        aria-label={`Add ${item.name}`}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Photo Analysis */}
        <Card className="bg-card/50 border-border/50 mb-4">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Camera className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground text-sm">Photo Analysis</span>
              <Badge variant="secondary" className="text-[10px]">BETA</Badge>
            </div>
            
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedPhoto(e.target.files?.[0] || null)}
              className="w-full text-sm bg-muted/30 border border-border rounded-xl p-2 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-primary file:text-primary-foreground"
              aria-label="Upload food photo"
            />
            
            {selectedPhoto && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  📸 {selectedPhoto.name} ({(selectedPhoto.size / 1024 / 1024).toFixed(2)} MB)
                </div>
                <Button
                  onClick={analyzePhotoIngredients}
                  disabled={isAnalyzing}
                  className="w-full h-11 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      Analyze Photo
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Food Entries List */}
        <div className="space-y-2">
          <h3 className="caption-premium px-1 mb-2">Today's Entries</h3>
          
          {isLoadingEntries ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted/30 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : foodEntries.length === 0 ? (
            <div className="empty-state-premium">
              <div className="empty-state-icon">
                <Utensils className="w-7 h-7" />
              </div>
              <h3 className="text-foreground font-semibold mb-2">No food logged yet</h3>
              <p className="text-muted-foreground text-sm">
                Search the USDA database or add custom food
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {foodEntries.map((entry) => (
                <div 
                  key={entry.id} 
                  className="p-3 bg-card/50 border border-border/50 rounded-xl group hover:bg-card transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground text-sm truncate">{entry.food_name}</div>
                      <div className="text-xs text-muted-foreground">{entry.portion_size}</div>
                      <Badge className="mt-1 text-[10px] capitalize bg-muted/50 text-muted-foreground border-border/50">
                        {entry.meal_type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {entry.calories !== undefined && (
                        <div className="text-right">
                          <div className="font-medium text-foreground text-sm">{entry.calories} cal</div>
                          <div className="text-[10px] text-muted-foreground">
                            P: {entry.protein?.toFixed(0)}g C: {entry.carbs?.toFixed(0)}g F: {entry.fat?.toFixed(0)}g
                          </div>
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFoodEntry(entry.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0 rounded-lg"
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
        </div>
        </div>
      </PullToRefresh>
    </div>
  );
};

export default SmartFoodLog;
