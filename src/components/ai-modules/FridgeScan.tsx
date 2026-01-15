import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, RefreshCw, Plus, Trash2, Clock, ChevronDown, AlertTriangle, Check, Sparkles, ChevronLeft, Bookmark, Heart, UtensilsCrossed, Package, WifiOff, ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useDietaryPreferences, dietTypeConfig, DietaryPreferences } from '@/hooks/useDietaryPreferences';
import { useSavedRecipes } from '@/hooks/useSavedRecipes';
import { useDailyTargets } from '@/hooks/useDietaryPreferences';
import { useFridgeScanOfflineQueue } from '@/hooks/useFridgeScanOfflineQueue';
import { compressImage } from '@/utils/imageCompression';
import DietaryPreferencesSetup from './DietaryPreferencesSetup';
import FridgeScanErrorState, { FridgeScanErrorCode } from './FridgeScanErrorState';
import { format } from 'date-fns';

// Types
interface DetectedIngredient {
  id: string;
  name: string;
  selected: boolean;
  confidence: 'high' | 'medium' | 'low';
}

interface MealCard {
  id: string;
  name: string;
  description: string;
  cookTime: string;
  protein: number;
  calories: number;
  carbs: number;
  fat: number;
  sodium?: number;
  fiber?: number;
  sugar?: number;
  ingredients: string[];
  instructions: string[];
  proteinMet: boolean;
  macroWarning?: string;
  saved?: boolean;
}

type MealIntent = keyof typeof dietTypeConfig;

interface FridgeScanProps {
  onBack: () => void;
}

// Helper to parse error code from Supabase function error
const parseErrorCode = (error: any): FridgeScanErrorCode => {
  if (!navigator.onLine) return 'offline';
  
  // Check for status in error context
  const status = error?.context?.status || error?.status;
  if (status === 401) return 401;
  if (status === 402) return 402;
  if (status === 429) return 429;
  if (status === 503) return 503;
  if (status >= 500) return 500;
  
  // Check error message for hints
  const message = (error?.message || '').toLowerCase();
  if (message.includes('unauthorized') || message.includes('authentication')) return 401;
  if (message.includes('credits') || message.includes('payment')) return 402;
  if (message.includes('rate limit') || message.includes('too many')) return 429;
  if (message.includes('offline') || message.includes('network')) return 'offline';
  
  return 'unknown';
};

const FridgeScan: React.FC<FridgeScanProps> = ({ onBack }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { userData } = useUserData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Hooks for dietary preferences and recipes
  const { preferences, isLoading: prefsLoading, needsSetup, getProteinMinimum } = useDietaryPreferences();
  const { saveRecipe } = useSavedRecipes();
  const dailyTargets = useDailyTargets();
  
  // Offline queue
  const { isOnline, queuedItems, enqueue, processQueue } = useFridgeScanOfflineQueue();

  // State
  const [showSetup, setShowSetup] = useState(false);
  const [step, setStep] = useState<'intent' | 'photo' | 'ingredients' | 'meals'>('intent');
  const [selectedIntent, setSelectedIntent] = useState<MealIntent | null>(null);
  const [quickMeals, setQuickMeals] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [pantryPreview, setPantryPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [ingredients, setIngredients] = useState<DetectedIngredient[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [meals, setMeals] = useState<MealCard[]>([]);
  const [expandedMicronutrients, setExpandedMicronutrients] = useState<Record<string, boolean>>({});
  const [savingRecipeId, setSavingRecipeId] = useState<string | null>(null);
  const [loggingMealId, setLoggingMealId] = useState<string | null>(null);
  const [todayConsumed, setTodayConsumed] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const pantryInputRef = useRef<HTMLInputElement>(null);
  
  // Error state
  const [errorState, setErrorState] = useState<{ code: FridgeScanErrorCode; context: 'detect' | 'generate' } | null>(null);

  // Fetch today's consumed macros from food log
  useEffect(() => {
    const fetchTodayConsumed = async () => {
      if (!user) return;
      
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('food_log_entries')
        .select('calories, protein, carbs, fat')
        .eq('user_id', user.id)
        .eq('logged_date', today);

      if (!error && data) {
        const totals = data.reduce((acc, entry) => ({
          calories: acc.calories + (entry.calories || 0),
          protein: acc.protein + (entry.protein || 0),
          carbs: acc.carbs + (entry.carbs || 0),
          fat: acc.fat + (entry.fat || 0),
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
        
        setTodayConsumed(totals);
      }
    };

    fetchTodayConsumed();
  }, [user]);

  // Check if setup needed on mount
  useEffect(() => {
    if (!prefsLoading && needsSetup) {
      setShowSetup(true);
    }
  }, [prefsLoading, needsSetup]);

  // Set default intent from preferences
  useEffect(() => {
    if (preferences.diet_type && !selectedIntent) {
      setSelectedIntent(preferences.diet_type as MealIntent);
    }
  }, [preferences.diet_type, selectedIntent]);
  
  // Clear error when coming back online
  useEffect(() => {
    if (isOnline && errorState?.code === 'offline') {
      setErrorState(null);
      // Auto-retry if we have queued items
      if (queuedItems.length > 0) {
        processQueue();
      }
    }
  }, [isOnline, errorState, queuedItems.length, processQueue]);

  // Calculate actual remaining macros based on today's consumption
  const dailyCaloriesTarget = dailyTargets.calories || userData.tdee || 2000;
  const dailyProteinTarget = dailyTargets.protein || Math.round(dailyCaloriesTarget * 0.3 / 4);
  const dailyCarbsTarget = dailyTargets.carbs || Math.round(dailyCaloriesTarget * 0.4 / 4);
  const dailyFatTarget = dailyTargets.fat || Math.round(dailyCaloriesTarget * 0.3 / 9);

  const remainingMacros = {
    calories: Math.max(0, dailyCaloriesTarget - todayConsumed.calories),
    protein: Math.max(0, dailyProteinTarget - todayConsumed.protein),
    carbs: Math.max(0, dailyCarbsTarget - todayConsumed.carbs),
    fat: Math.max(0, dailyFatTarget - todayConsumed.fat),
  };

  const proteinMinimum = getProteinMinimum();

  // Max image size for API (compress to ~2MB for reliability)
  const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
  const [isCompressing, setIsCompressing] = useState(false);

  // Compress and convert image to base64
  const processImage = async (file: File): Promise<string | null> => {
    console.log('[FridgeScan] Processing image:', { 
      name: file.name, 
      type: file.type, 
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB` 
    });

    // Validate file type - accept common image formats
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    const isValidType = validTypes.some(t => file.type.toLowerCase().includes(t.split('/')[1])) || 
                        file.type.startsWith('image/');
    
    if (!isValidType) {
      console.error('[FridgeScan] Invalid file type:', file.type);
      toast({ title: 'Invalid file', description: 'Please select a JPG, PNG, or WebP image', variant: 'destructive' });
      return null;
    }

    setIsCompressing(true);
    
    try {
      // Compress if needed
      let processedFile = file;
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        console.log('[FridgeScan] Compressing large image...');
        processedFile = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.7,
          outputFormat: 'jpeg'
        });
        console.log('[FridgeScan] Compressed:', `${(file.size / 1024 / 1024).toFixed(2)}MB → ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`);
      }

      // Convert to base64
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onerror = () => {
          console.error('[FridgeScan] FileReader error:', reader.error);
          toast({ title: 'Failed to read image', description: 'Could not load the selected image', variant: 'destructive' });
          resolve(null);
        };
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          console.log('[FridgeScan] Image loaded:', { 
            base64SizeMB: (base64.length / 1024 / 1024).toFixed(2),
          });
          resolve(base64);
        };
        reader.readAsDataURL(processedFile);
      });
    } catch (error) {
      console.error('[FridgeScan] Image processing error:', error);
      toast({ title: 'Image error', description: 'Could not process the image', variant: 'destructive' });
      return null;
    } finally {
      setIsCompressing(false);
    }
  };

  // Handle photo capture/upload for fridge
  const handlePhotoSelect = useCallback(async (file: File) => {
    const base64 = await processImage(file);
    if (base64) setPhotoPreview(base64);
  }, [toast]);

  // Handle pantry photo capture/upload
  const handlePantrySelect = useCallback(async (file: File) => {
    const base64 = await processImage(file);
    if (base64) setPantryPreview(base64);
  }, [toast]);

  // Analyze photos (at least one required)
  const analyzePhotos = async () => {
    console.log('[FridgeScan] analyzePhotos called:', {
      hasFridgePhoto: !!photoPreview,
      hasPantryPhoto: !!pantryPreview,
      fridgePhotoSize: photoPreview ? `${(photoPreview.length / 1024 / 1024).toFixed(2)}MB` : null,
      pantryPhotoSize: pantryPreview ? `${(pantryPreview.length / 1024 / 1024).toFixed(2)}MB` : null,
    });

    if (!photoPreview && !pantryPreview) {
      console.warn('[FridgeScan] No photos to analyze');
      return;
    }
    
    // Handle offline state
    if (!navigator.onLine) {
      console.log('[FridgeScan] Offline, queueing request');
      setErrorState({ code: 'offline', context: 'detect' });
      if (photoPreview) {
        enqueue('detect', { image: photoPreview, action: 'detect' });
      }
      toast({
        title: 'Request Queued',
        description: 'Your photo will be analyzed when you reconnect.',
      });
      return;
    }

    setIsAnalyzing(true);
    setErrorState(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('[FridgeScan] Session check:', { hasSession: !!session, hasToken: !!session?.access_token });
      
      if (!session?.access_token) {
        console.error('[FridgeScan] No session/token');
        setErrorState({ code: 401, context: 'detect' });
        setIsAnalyzing(false);
        return;
      }

      let allIngredients: DetectedIngredient[] = [];

      // Analyze fridge photo if present
      if (photoPreview) {
        console.log('[FridgeScan] Calling fridge-scan-ai for fridge photo...');
        const startTime = Date.now();
        
        const { data: fridgeData, error: fridgeError } = await supabase.functions.invoke('fridge-scan-ai', {
          body: { image: photoPreview, action: 'detect' },
        });

        console.log('[FridgeScan] Fridge photo response:', {
          duration: `${Date.now() - startTime}ms`,
          hasData: !!fridgeData,
          hasError: !!fridgeError,
          errorDetails: fridgeError,
          ingredientsCount: fridgeData?.ingredients?.length,
          rawError: fridgeError?.message || fridgeError?.context,
        });

        if (fridgeError) {
          console.error('[FridgeScan] Fridge analysis failed:', fridgeError);
          const code = parseErrorCode(fridgeError);
          setErrorState({ code, context: 'detect' });
          setIsAnalyzing(false);
          return;
        }

        allIngredients = (fridgeData.ingredients || []).map((ing: any, idx: number) => ({
          id: `fridge-${idx}`,
          name: ing.name || ing,
          selected: true,
          confidence: ing.confidence || 'medium',
        }));
        console.log('[FridgeScan] Fridge ingredients parsed:', allIngredients.length);
      }

      // Analyze pantry photo if present
      if (pantryPreview) {
        const { data: pantryData, error: pantryError } = await supabase.functions.invoke('fridge-scan-ai', {
          body: { image: pantryPreview, action: 'detect' },
        });

        if (!pantryError && pantryData.ingredients) {
          const pantryIngredients: DetectedIngredient[] = pantryData.ingredients.map((ing: any, idx: number) => ({
            id: `pantry-${idx}`,
            name: ing.name || ing,
            selected: true,
            confidence: ing.confidence || 'medium',
          }));
          allIngredients = [...allIngredients, ...pantryIngredients];
        }
      }

      // Remove duplicates (case-insensitive)
      const seen = new Set<string>();
      allIngredients = allIngredients.filter(ing => {
        const lower = ing.name.toLowerCase();
        if (seen.has(lower)) return false;
        seen.add(lower);
        return true;
      });

      // Filter out allergies automatically
      const filteredIngredients = allIngredients.filter(ing => {
        const ingLower = ing.name.toLowerCase();
        return !preferences.allergies.some(allergy => 
          ingLower.includes(allergy.toLowerCase())
        );
      });

      setIngredients(filteredIngredients);
      setStep('ingredients');
    } catch (error) {
      console.error('Photo analysis error:', error);
      const code = parseErrorCode(error);
      setErrorState({ code, context: 'detect' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzePhoto = async (imageData: string) => {
    setIsAnalyzing(true);
    setStep('ingredients');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('fridge-scan-ai', {
        body: { image: imageData, action: 'detect' },
      });

      if (error) throw error;

      const detected: DetectedIngredient[] = (data.ingredients || []).map((ing: any, idx: number) => ({
        id: `ing-${idx}`,
        name: ing.name || ing,
        selected: true,
        confidence: ing.confidence || 'medium',
      }));

      // Filter out allergies automatically
      const filteredIngredients = detected.filter(ing => {
        const ingLower = ing.name.toLowerCase();
        return !preferences.allergies.some(allergy => 
          ingLower.includes(allergy.toLowerCase())
        );
      });

      setIngredients(filteredIngredients);
    } catch (error) {
      console.error('Photo analysis error:', error);
      toast({
        title: 'Analysis failed',
        description: 'Could not analyze the photo. Please try again.',
        variant: 'destructive',
      });
      setStep('photo');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddIngredient = () => {
    if (!newIngredient.trim()) return;
    setIngredients(prev => [
      ...prev,
      { id: `custom-${Date.now()}`, name: newIngredient.trim(), selected: true, confidence: 'high' },
    ]);
    setNewIngredient('');
  };

  const toggleIngredient = (id: string) => {
    setIngredients(prev => prev.map(ing => 
      ing.id === id ? { ...ing, selected: !ing.selected } : ing
    ));
  };

  const removeIngredient = (id: string) => {
    setIngredients(prev => prev.filter(ing => ing.id !== id));
  };

  const generateMeals = async () => {
    const selectedIngredients = ingredients.filter(i => i.selected);
    if (selectedIngredients.length === 0) {
      toast({ title: 'No ingredients', description: 'Please select at least one ingredient', variant: 'destructive' });
      return;
    }

    const payload = {
      action: 'generate',
      ingredients: selectedIngredients.map(i => i.name),
      mealIntent: selectedIntent,
      quickMeals,
      remainingMacros,
      proteinMinimum,
      userGoal: userData.goal,
      allergies: preferences.allergies,
      dislikes: preferences.dislikes,
    };

    // Handle offline state
    if (!navigator.onLine) {
      setErrorState({ code: 'offline', context: 'generate' });
      enqueue('generate', payload);
      toast({
        title: 'Request Queued',
        description: 'Meals will be generated when you reconnect.',
      });
      return;
    }

    setIsGenerating(true);
    setStep('meals');
    setErrorState(null);

    try {
      const { data, error } = await supabase.functions.invoke('fridge-scan-ai', {
        body: payload,
      });

      if (error) {
        const code = parseErrorCode(error);
        setErrorState({ code, context: 'generate' });
        setIsGenerating(false);
        return;
      }

      setMeals((data.meals || []).map((m: MealCard) => ({ ...m, saved: false })));
    } catch (error) {
      console.error('Meal generation error:', error);
      const code = parseErrorCode(error);
      setErrorState({ code, context: 'generate' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRecipe = async (meal: MealCard) => {
    setSavingRecipeId(meal.id);
    const success = await saveRecipe({
      name: meal.name,
      description: meal.description,
      cook_time: meal.cookTime,
      protein: meal.protein,
      calories: meal.calories,
      carbs: meal.carbs,
      fat: meal.fat,
      sodium: meal.sodium,
      fiber: meal.fiber,
      sugar: meal.sugar,
      ingredients: meal.ingredients,
      instructions: meal.instructions,
      source: 'fridgescan',
      meal_type: selectedIntent || undefined,
    });

    if (success) {
      setMeals(prev => prev.map(m => m.id === meal.id ? { ...m, saved: true } : m));
    }
    setSavingRecipeId(null);
  };

  const handleLogToFoodLog = async (meal: MealCard) => {
    if (!user) return;
    
    setLoggingMealId(meal.id);
    try {
      const { error } = await supabase.from('food_log_entries').insert({
        user_id: user.id,
        food_name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        fiber: meal.fiber,
        meal_type: selectedIntent === 'post-workout' ? 'snack' : 'lunch',
        portion_size: '1 serving',
        logged_date: format(new Date(), 'yyyy-MM-dd'),
      });

      if (error) throw error;

      toast({
        title: 'Logged to Food Log!',
        description: `${meal.name} added to today's meals`,
      });
    } catch (error) {
      console.error('Food log error:', error);
      toast({
        title: 'Failed to log',
        description: 'Could not add to food log',
        variant: 'destructive',
      });
    } finally {
      setLoggingMealId(null);
    }
  };

  const rescan = () => {
    setPhotoPreview(null);
    setPantryPreview(null);
    setIngredients([]);
    setMeals([]);
    setStep('photo');
  };

  const startOver = () => {
    setQuickMeals(false);
    setPhotoPreview(null);
    setPantryPreview(null);
    setIngredients([]);
    setMeals([]);
    setStep('intent');
  };

  // Show setup if needed
  if (showSetup) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center gap-3 p-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Quick Setup</h1>
              <p className="text-xs text-muted-foreground">One-time preferences</p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <DietaryPreferencesSetup onComplete={() => setShowSetup(false)} />
        </div>
      </div>
    );
  }

  // Render intent selection
  const renderIntentStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">What kind of meal?</h2>
        <p className="text-sm text-muted-foreground mt-1">Choose your meal intent</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {(Object.entries(dietTypeConfig) as [MealIntent, typeof dietTypeConfig[MealIntent]][]).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setSelectedIntent(key)}
            className={cn(
              "flex items-center gap-3 p-4 rounded-xl border transition-all",
              selectedIntent === key
                ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                : "border-border/50 bg-card/50 hover:border-primary/50"
            )}
          >
            <span className="text-2xl">{config.icon}</span>
            <div className="text-left flex-1">
              <p className="font-medium text-foreground">{config.label}</p>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
            {selectedIntent === key && <Check className="w-5 h-5 text-primary" />}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card/50 mt-4">
        <Clock className="w-5 h-5 text-muted-foreground" />
        <div className="flex-1">
          <p className="font-medium text-foreground text-sm">Under 10 minutes</p>
          <p className="text-xs text-muted-foreground">Prioritize fastest meals</p>
        </div>
        <Checkbox
          checked={quickMeals}
          onCheckedChange={(checked) => setQuickMeals(checked === true)}
        />
      </div>

      {/* Show saved allergies */}
      {preferences.allergies.length > 0 && (
        <div className="p-3 rounded-xl border border-border/50 bg-card/30">
          <p className="text-xs text-muted-foreground mb-2">Avoiding:</p>
          <div className="flex flex-wrap gap-1">
            {preferences.allergies.map(allergy => (
              <Badge key={allergy} variant="outline" className="text-xs border-destructive/30 text-destructive">
                {allergy}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={() => setStep('photo')}
        disabled={!selectedIntent}
        className="w-full mt-6"
        size="lg"
      >
        Continue
      </Button>

      <Button
        variant="ghost"
        onClick={() => setShowSetup(true)}
        className="w-full text-muted-foreground text-sm"
      >
        Edit preferences
      </Button>
    </div>
  );

  // Render photo capture step
  const renderPhotoStep = () => {
    const hasAnyPhoto = photoPreview || pantryPreview;
    
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold text-foreground">Scan Your Kitchen</h2>
          <p className="text-sm text-muted-foreground mt-1">Add at least one photo — fridge, pantry, or both</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => e.target.files?.[0] && handlePhotoSelect(e.target.files[0])}
          className="hidden"
        />
        <input
          ref={pantryInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => e.target.files?.[0] && handlePantrySelect(e.target.files[0])}
          className="hidden"
        />

        {/* Fridge Photo */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">🧊 Fridge</span>
          </div>
          
          {photoPreview ? (
            <div className="relative rounded-xl overflow-hidden border border-border bg-muted/30">
              <img
                src={photoPreview}
                alt="Fridge contents"
                className="w-full max-h-64 object-contain"
              />
              <Button
                onClick={() => setPhotoPreview(null)}
                variant="secondary"
                size="sm"
                className="absolute bottom-2 right-2"
              >
                <RefreshCw className="w-3 h-3 mr-1" /> Change
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <Camera className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">Take Photo</span>
              </button>
              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handlePhotoSelect(file);
                  };
                  input.click();
                }}
                className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Upload</span>
              </button>
            </div>
          )}
        </div>

        {/* Pantry Photo */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">📦 Pantry / Shelves</span>
          </div>
          <p className="text-xs text-muted-foreground -mt-1">Pasta, rice, sauces, spices, condiments...</p>
          
          {pantryPreview ? (
            <div className="relative rounded-xl overflow-hidden border border-border bg-muted/30">
              <img
                src={pantryPreview}
                alt="Pantry contents"
                className="w-full max-h-64 object-contain"
              />
              <Button
                onClick={() => setPantryPreview(null)}
                variant="secondary"
                size="sm"
                className="absolute bottom-2 right-2"
              >
                <RefreshCw className="w-3 h-3 mr-1" /> Change
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => pantryInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
              >
                <Camera className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium text-amber-500">Take Photo</span>
              </button>
              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handlePantrySelect(file);
                  };
                  input.click();
                }}
                className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Upload</span>
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4 space-y-2">
          <Button 
            onClick={analyzePhotos} 
            disabled={!hasAnyPhoto}
            className="w-full"
            size="lg"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Analyze {photoPreview && pantryPreview ? 'Photos' : 'Photo'}
          </Button>
          
          <Button variant="ghost" onClick={() => setStep('intent')} className="w-full">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        </div>
      </div>
    );
  };

  // Render ingredients editing step
  const renderIngredientsStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold text-foreground">
          {isAnalyzing ? 'Analyzing...' : 'Detected Ingredients'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isAnalyzing ? 'Scanning your photo' : 'Select ingredients to use'}
        </p>
      </div>

      {isAnalyzing ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground">Identifying ingredients...</p>
        </div>
      ) : (
        <>
          <ScrollArea className="h-64 rounded-xl border border-border/50 bg-card/30 p-3">
            <div className="space-y-2">
              {ingredients.map((ing) => (
                <div
                  key={ing.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-colors",
                    ing.selected ? "bg-primary/10" : "bg-muted/30"
                  )}
                >
                  <Checkbox
                    checked={ing.selected}
                    onCheckedChange={() => toggleIngredient(ing.id)}
                  />
                  <span className={cn("flex-1", !ing.selected && "text-muted-foreground line-through")}>
                    {ing.name}
                  </span>
                  {ing.confidence === 'low' && (
                    <Badge variant="outline" className="text-xs">unsure</Badge>
                  )}
                  <button
                    onClick={() => removeIngredient(ing.id)}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              placeholder="Add ingredient..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()}
            />
            <Button onClick={handleAddIngredient} size="icon" variant="secondary">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={rescan} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-1" /> Rescan
            </Button>
            <Button onClick={generateMeals} disabled={ingredients.filter(i => i.selected).length === 0} className="flex-1">
              <Sparkles className="w-4 h-4 mr-1" /> Generate Meals
            </Button>
          </div>
        </>
      )}
    </div>
  );

  // Render meal cards
  const renderMealsStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold text-foreground">
          {isGenerating ? 'Creating Meals...' : 'Your Meals'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isGenerating 
            ? `Optimizing for ${dietTypeConfig[selectedIntent!]?.label}`
            : `${meals.length} meal${meals.length !== 1 ? 's' : ''} generated`
          }
        </p>
      </div>

      {isGenerating ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground">Crafting macro-optimized meals...</p>
        </div>
      ) : (
        <>
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-4 pr-2">
              {meals.map((meal) => (
                <Card key={meal.id} className="bg-card/60 border-border/50 overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{meal.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{meal.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {meal.cookTime && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {meal.cookTime}
                          </Badge>
                        )}
                        <Button
                          variant={meal.saved ? "default" : "outline"}
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleSaveRecipe(meal)}
                          disabled={meal.saved || savingRecipeId === meal.id}
                        >
                          {savingRecipeId === meal.id ? (
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : meal.saved ? (
                            <Heart className="w-4 h-4 fill-current" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Macro display - primary emphasis on protein */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                        <p className="text-lg font-bold text-green-400">{meal.protein}g</p>
                        <p className="text-xs text-muted-foreground">Protein</p>
                      </div>
                      <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <p className="text-lg font-bold text-orange-400">{meal.calories}</p>
                        <p className="text-xs text-muted-foreground">Calories</p>
                      </div>
                      <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <p className="text-lg font-bold text-blue-400">{meal.carbs}g</p>
                        <p className="text-xs text-muted-foreground">Carbs</p>
                      </div>
                      <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <p className="text-lg font-bold text-yellow-400">{meal.fat}g</p>
                        <p className="text-xs text-muted-foreground">Fat</p>
                      </div>
                    </div>

                    {/* Protein warning */}
                    {!meal.proteinMet && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <p className="text-xs text-amber-200">
                          You're short on protein. Add ONE of: whey, egg whites, skyr/cottage cheese, or lean meat.
                        </p>
                      </div>
                    )}

                    {/* Macro warning */}
                    {meal.macroWarning && (
                      <p className="text-xs text-muted-foreground italic">{meal.macroWarning}</p>
                    )}

                    {/* Micronutrients dropdown */}
                    {(meal.sodium || meal.fiber || meal.sugar) && (
                      <Collapsible
                        open={expandedMicronutrients[meal.id]}
                        onOpenChange={(open) => setExpandedMicronutrients(prev => ({ ...prev, [meal.id]: open }))}
                      >
                        <CollapsibleTrigger asChild>
                          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                            <ChevronDown className={cn("w-3 h-3 transition-transform", expandedMicronutrients[meal.id] && "rotate-180")} />
                            More nutritional info
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            {meal.sodium && <span>Sodium: {meal.sodium}mg</span>}
                            {meal.fiber && <span>Fiber: {meal.fiber}g</span>}
                            {meal.sugar && <span>Sugar: {meal.sugar}g</span>}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {/* Ingredients list */}
                    <div>
                      <p className="text-xs font-medium text-foreground mb-1">Ingredients:</p>
                      <p className="text-xs text-muted-foreground">{meal.ingredients.join(', ')}</p>
                    </div>

                    {/* Instructions */}
                    <div>
                      <p className="text-xs font-medium text-foreground mb-1">Quick Steps:</p>
                      <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                        {meal.instructions.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    {/* Log to Food Log button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => handleLogToFoodLog(meal)}
                      disabled={loggingMealId === meal.id}
                    >
                      {loggingMealId === meal.id ? (
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <UtensilsCrossed className="w-4 h-4 mr-2" />
                      )}
                      Log to Food Diary
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep('ingredients')} className="flex-1">
              Edit Ingredients
            </Button>
            <Button variant="outline" onClick={startOver} className="flex-1">
              Start Over
            </Button>
          </div>
        </>
      )}
    </div>
  );

  // Handle retry from error state
  const handleRetry = () => {
    setErrorState(null);
    if (errorState?.context === 'detect') {
      analyzePhotos();
    } else if (errorState?.context === 'generate') {
      generateMeals();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">FridgeScan</h1>
              <p className="text-xs text-muted-foreground">Photo → Meals</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isOnline && (
              <Badge variant="outline" className="flex items-center gap-1 border-amber-500/50 text-amber-500">
                <WifiOff className="w-3 h-3" />
                Offline
              </Badge>
            )}
            {selectedIntent && step !== 'intent' && (
              <Badge variant="outline">{dietTypeConfig[selectedIntent].label}</Badge>
            )}
          </div>
        </div>

        {/* Remaining macros bar */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Remaining:</span>
            <span className="text-green-400">{remainingMacros.protein}g P</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-orange-400">{remainingMacros.calories} cal</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-blue-400">{remainingMacros.carbs}g C</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-yellow-400">{remainingMacros.fat}g F</span>
          </div>
        </div>
        
        {/* Queued items indicator */}
        {queuedItems.length > 0 && (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs text-blue-400">
                {queuedItems.length} request{queuedItems.length !== 1 ? 's' : ''} queued — will retry when online
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="p-4">
        {/* Show error state if present */}
        {errorState && (
          <div className="mb-4">
            <FridgeScanErrorState
              errorCode={errorState.code}
              onRetry={handleRetry}
              onBack={() => {
                setErrorState(null);
                if (errorState.context === 'detect') setStep('photo');
                else setStep('ingredients');
              }}
              queuedCount={queuedItems.length}
            />
          </div>
        )}
        
        {/* Only show steps if no blocking error */}
        {!errorState && (
          <>
            {step === 'intent' && renderIntentStep()}
            {step === 'photo' && renderPhotoStep()}
            {step === 'ingredients' && renderIngredientsStep()}
            {step === 'meals' && renderMealsStep()}
          </>
        )}
      </div>
    </div>
  );
};

export default FridgeScan;
