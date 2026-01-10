import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, AlertTriangle, ThumbsDown, X, Plus, Loader2, Check } from 'lucide-react';
import { useDietaryPreferences, dietTypeConfig } from '@/hooks/useDietaryPreferences';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const commonAllergies = ['Dairy', 'Gluten', 'Nuts', 'Shellfish', 'Eggs', 'Soy', 'Fish', 'Peanuts'];
const commonDislikes = ['Spicy food', 'Mushrooms', 'Onions', 'Tomatoes', 'Seafood', 'Liver', 'Cilantro'];

const DietaryPreferencesSettings = () => {
  const { preferences, isLoading, isSaving, savePreferences } = useDietaryPreferences();
  
  const [allergies, setAllergies] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [dietType, setDietType] = useState('balanced');
  const [targetCalories, setTargetCalories] = useState<string>('');
  const [targetProtein, setTargetProtein] = useState<string>('');
  const [targetCarbs, setTargetCarbs] = useState<string>('');
  const [targetFat, setTargetFat] = useState<string>('');
  const [customAllergy, setCustomAllergy] = useState('');
  const [customDislike, setCustomDislike] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Sync state with loaded preferences
  useEffect(() => {
    if (!isLoading && preferences) {
      setAllergies(preferences.allergies || []);
      setDislikes(preferences.dislikes || []);
      setDietType(preferences.diet_type || 'balanced');
      setTargetCalories(preferences.target_calories?.toString() || '');
      setTargetProtein(preferences.target_protein?.toString() || '');
      setTargetCarbs(preferences.target_carbs?.toString() || '');
      setTargetFat(preferences.target_fat?.toString() || '');
    }
  }, [isLoading, preferences]);

  // Track changes
  useEffect(() => {
    if (isLoading) return;
    
    const currentState = {
      allergies: allergies.sort().join(','),
      dislikes: dislikes.sort().join(','),
      dietType,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat,
    };
    
    const savedState = {
      allergies: (preferences.allergies || []).sort().join(','),
      dislikes: (preferences.dislikes || []).sort().join(','),
      dietType: preferences.diet_type || 'balanced',
      targetCalories: preferences.target_calories?.toString() || '',
      targetProtein: preferences.target_protein?.toString() || '',
      targetCarbs: preferences.target_carbs?.toString() || '',
      targetFat: preferences.target_fat?.toString() || '',
    };
    
    setHasChanges(JSON.stringify(currentState) !== JSON.stringify(savedState));
  }, [allergies, dislikes, dietType, targetCalories, targetProtein, targetCarbs, targetFat, preferences, isLoading]);

  const toggleAllergy = (item: string) => {
    setAllergies(prev => 
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  const toggleDislike = (item: string) => {
    setDislikes(prev => 
      prev.includes(item) ? prev.filter(d => d !== item) : [...prev, item]
    );
  };

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !allergies.includes(customAllergy.trim())) {
      setAllergies(prev => [...prev, customAllergy.trim()]);
      setCustomAllergy('');
    }
  };

  const addCustomDislike = () => {
    if (customDislike.trim() && !dislikes.includes(customDislike.trim())) {
      setDislikes(prev => [...prev, customDislike.trim()]);
      setCustomDislike('');
    }
  };

  const handleSave = async () => {
    const success = await savePreferences({
      allergies,
      dislikes,
      diet_type: dietType,
      target_calories: targetCalories ? parseInt(targetCalories) : null,
      target_protein: targetProtein ? parseInt(targetProtein) : null,
      target_carbs: targetCarbs ? parseInt(targetCarbs) : null,
      target_fat: targetFat ? parseInt(targetFat) : null,
      setup_completed: true,
    });

    if (success) {
      toast.success('Dietary preferences saved');
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Diet Type */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Diet Focus</Label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(dietTypeConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setDietType(key)}
              className={cn(
                "p-3 rounded-lg border text-left transition-all",
                dietType === key
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{config.icon}</span>
                <span className="text-sm font-medium text-foreground">{config.label}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {config.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <Label className="text-sm font-medium text-foreground">Allergies</Label>
        </div>
        <p className="text-xs text-muted-foreground">
          These ingredients will be strictly excluded from all meal suggestions
        </p>
        <div className="flex flex-wrap gap-2">
          {commonAllergies.map((item) => (
            <Badge
              key={item}
              variant={allergies.includes(item) ? "destructive" : "outline"}
              className="cursor-pointer transition-colors"
              onClick={() => toggleAllergy(item)}
            >
              {item}
              {allergies.includes(item) && <X className="w-3 h-3 ml-1" />}
            </Badge>
          ))}
        </div>
        
        {/* Custom allergies */}
        {allergies.filter(a => !commonAllergies.includes(a)).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allergies.filter(a => !commonAllergies.includes(a)).map((item) => (
              <Badge
                key={item}
                variant="destructive"
                className="cursor-pointer"
                onClick={() => toggleAllergy(item)}
              >
                {item}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex gap-2">
          <Input
            value={customAllergy}
            onChange={(e) => setCustomAllergy(e.target.value)}
            placeholder="Add custom allergy..."
            className="flex-1 h-9 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && addCustomAllergy()}
          />
          <Button size="sm" variant="outline" onClick={addCustomAllergy}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Dislikes */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ThumbsDown className="w-4 h-4 text-muted-foreground" />
          <Label className="text-sm font-medium text-foreground">Dislikes</Label>
        </div>
        <p className="text-xs text-muted-foreground">
          Foods you prefer to avoid (AI will try to skip these)
        </p>
        <div className="flex flex-wrap gap-2">
          {commonDislikes.map((item) => (
            <Badge
              key={item}
              variant={dislikes.includes(item) ? "secondary" : "outline"}
              className="cursor-pointer transition-colors"
              onClick={() => toggleDislike(item)}
            >
              {item}
              {dislikes.includes(item) && <X className="w-3 h-3 ml-1" />}
            </Badge>
          ))}
        </div>
        
        {/* Custom dislikes */}
        {dislikes.filter(d => !commonDislikes.includes(d)).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {dislikes.filter(d => !commonDislikes.includes(d)).map((item) => (
              <Badge
                key={item}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => toggleDislike(item)}
              >
                {item}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex gap-2">
          <Input
            value={customDislike}
            onChange={(e) => setCustomDislike(e.target.value)}
            placeholder="Add custom dislike..."
            className="flex-1 h-9 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && addCustomDislike()}
          />
          <Button size="sm" variant="outline" onClick={addCustomDislike}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Optional Macro Targets */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Daily Targets (Optional)</Label>
        <p className="text-xs text-muted-foreground">
          Override the targets from TDEE calculator. Leave blank to use automatic values.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Calories</Label>
            <Input
              type="number"
              value={targetCalories}
              onChange={(e) => setTargetCalories(e.target.value)}
              placeholder="e.g. 2000"
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Protein (g)</Label>
            <Input
              type="number"
              value={targetProtein}
              onChange={(e) => setTargetProtein(e.target.value)}
              placeholder="e.g. 150"
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Carbs (g)</Label>
            <Input
              type="number"
              value={targetCarbs}
              onChange={(e) => setTargetCarbs(e.target.value)}
              placeholder="e.g. 200"
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Fat (g)</Label>
            <Input
              type="number"
              value={targetFat}
              onChange={(e) => setTargetFat(e.target.value)}
              placeholder="e.g. 65"
              className="h-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isSaving || !hasChanges}
        className="w-full"
      >
        {isSaving ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : hasChanges ? (
          <Check className="w-4 h-4 mr-2" />
        ) : null}
        {isSaving ? 'Saving...' : hasChanges ? 'Save Changes' : 'Saved'}
      </Button>
    </div>
  );
};

export default DietaryPreferencesSettings;
