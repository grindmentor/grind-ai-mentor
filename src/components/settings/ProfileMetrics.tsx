import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Scale, Ruler, Calendar, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { differenceInYears, parseISO, isValid, isFuture } from 'date-fns';

/**
 * DB CONTRACT:
 * - weight: stored in kg (integer)
 * - height: stored in cm (integer)  
 * - birthday: stored as date (YYYY-MM-DD)
 * 
 * DATA FLOW:
 * - localData stores values in STORAGE units (kg, cm)
 * - Display converts storage -> display units for rendering
 * - Input onChange converts display -> storage before updating localData
 * - Save sends localData directly (already in storage units)
 */

interface ProfileMetricsData {
  weight: number | null;  // Always in kg
  height: number | null;  // Always in cm
  birthday: string | null;
}

interface ValidationErrors {
  weight?: string;
  height?: string;
  birthday?: string;
}

const ProfileMetrics = () => {
  const { user } = useAuth();
  const { preferences } = usePreferences();
  const [savedData, setSavedData] = useState<ProfileMetricsData>({
    weight: null,
    height: null,
    birthday: null
  });
  const [localData, setLocalData] = useState<ProfileMetricsData>({
    weight: null,   // kg
    height: null,   // cm
    birthday: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const errorAnnouncerRef = useRef<HTMLDivElement>(null);

  // Load profile data from Supabase (stored in kg/cm)
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('weight, height, birthday')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading profile:', error);
          return;
        }

        if (profile) {
          // Data from DB is already in kg/cm - store as-is
          const profileData: ProfileMetricsData = {
            weight: profile.weight,   // kg
            height: profile.height,   // cm
            birthday: profile.birthday
          };
          setSavedData(profileData);
          setLocalData(profileData);
        }
      } catch (error) {
        console.error('Error in loadProfile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // Compute age from birthday
  const computeAge = (birthday: string | null): number | null => {
    if (!birthday) return null;
    try {
      const date = parseISO(birthday);
      if (!isValid(date)) return null;
      return differenceInYears(new Date(), date);
    } catch {
      return null;
    }
  };

  // Unit preference helpers
  const weightUnit = preferences.weight_unit || 'kg';
  const heightUnit = preferences.height_unit || 'cm';
  // For height: if preference is 'ft-in', we show a single field in inches
  const heightDisplayUnit = heightUnit === 'ft-in' ? 'inches' : 'cm';

  /**
   * Convert STORAGE value (kg/cm) to DISPLAY value based on user preference
   */
  const storageToDisplay = (value: number | null, field: 'weight' | 'height'): string => {
    if (value === null) return '';
    if (field === 'weight' && weightUnit === 'lbs') {
      return Math.round(value * 2.20462).toString();
    }
    if (field === 'height' && heightUnit === 'ft-in') {
      // Convert cm to inches
      return Math.round(value / 2.54).toString();
    }
    return value.toString();
  };

  /**
   * Convert DISPLAY value to STORAGE value (kg/cm) based on user preference
   */
  const displayToStorage = (displayValue: string, field: 'weight' | 'height'): number | null => {
    if (displayValue === '') return null;
    const num = parseFloat(displayValue);
    if (isNaN(num)) return null;
    
    if (field === 'weight' && weightUnit === 'lbs') {
      return Math.round(num / 2.20462); // lbs -> kg
    }
    if (field === 'height' && heightUnit === 'ft-in') {
      return Math.round(num * 2.54); // inches -> cm
    }
    return Math.round(num);
  };

  // Validation (validates storage units: kg, cm)
  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    // Weight validation: 30-250 kg
    if (localData.weight !== null) {
      if (localData.weight < 30 || localData.weight > 250) {
        // Show error in display units
        const minDisplay = weightUnit === 'lbs' ? 66 : 30;
        const maxDisplay = weightUnit === 'lbs' ? 551 : 250;
        newErrors.weight = `Weight must be between ${minDisplay} and ${maxDisplay} ${weightUnit}`;
      }
    }
    
    // Height validation: 120-230 cm
    if (localData.height !== null) {
      if (localData.height < 120 || localData.height > 230) {
        const minDisplay = heightUnit === 'ft-in' ? 47 : 120;
        const maxDisplay = heightUnit === 'ft-in' ? 91 : 230;
        newErrors.height = `Height must be between ${minDisplay} and ${maxDisplay} ${heightDisplayUnit}`;
      }
    }
    
    // Birthday validation
    if (localData.birthday) {
      const date = parseISO(localData.birthday);
      if (!isValid(date)) {
        newErrors.birthday = 'Please enter a valid date';
      } else if (isFuture(date)) {
        newErrors.birthday = 'Birthday must be in the past';
      } else {
        const age = computeAge(localData.birthday);
        if (age !== null && (age < 13 || age > 100)) {
          newErrors.birthday = 'Age must be between 13 and 100 years';
        }
      }
    }

    setErrors(newErrors);
    
    // Announce errors for screen readers
    if (Object.keys(newErrors).length > 0 && errorAnnouncerRef.current) {
      errorAnnouncerRef.current.textContent = Object.values(newErrors).join('. ');
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!user) return;
    if (!validate()) return;

    setIsSaving(true);
    try {
      const updates: Record<string, number | string | null> = {};
      
      // localData is already in storage units (kg, cm), compare directly
      if (localData.weight !== savedData.weight) {
        updates.weight = localData.weight;
      }
      if (localData.height !== savedData.height) {
        updates.height = localData.height;
      }
      if (localData.birthday !== savedData.birthday) {
        updates.birthday = localData.birthday;
      }

      if (Object.keys(updates).length === 0) {
        toast.info('No changes to save');
        setIsSaving(false);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Update saved state to reflect new DB values
      setSavedData({ ...localData });
      toast.success('Profile metrics updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile metrics');
    } finally {
      setIsSaving(false);
    }
  };

  // Compare storage values directly (both in kg/cm)
  const hasChanges = 
    localData.weight !== savedData.weight ||
    localData.height !== savedData.height ||
    localData.birthday !== savedData.birthday;

  const hasValidationErrors = Object.values(errors).some(e => !!e);
  const age = computeAge(localData.birthday);

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-foreground text-sm font-semibold flex items-center gap-2">
          <Scale className="w-4 h-4 text-primary" aria-hidden="true" />
          Body Metrics
        </CardTitle>
        <CardDescription className="text-muted-foreground text-xs">
          Your physical measurements for personalized calculations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error announcer for screen readers */}
        <div 
          ref={errorAnnouncerRef}
          aria-live="polite" 
          aria-atomic="true"
          className="sr-only"
        />

        {/* Weight - stored in kg, displayed in user preference */}
        <div className="space-y-1.5">
          <Label htmlFor="profile-weight" className="text-sm font-medium text-foreground flex items-center gap-2">
            <Scale className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
            Weight ({weightUnit})
          </Label>
          <Input
            id="profile-weight"
            type="number"
            inputMode="decimal"
            min={weightUnit === 'lbs' ? 66 : 30}
            max={weightUnit === 'lbs' ? 551 : 250}
            value={storageToDisplay(localData.weight, 'weight')}
            onChange={(e) => {
              const storageValue = displayToStorage(e.target.value, 'weight');
              setLocalData(prev => ({ ...prev, weight: storageValue }));
              if (errors.weight) setErrors(prev => ({ ...prev, weight: undefined }));
            }}
            placeholder={`Enter weight in ${weightUnit}`}
            aria-describedby={errors.weight ? 'weight-error' : undefined}
            aria-invalid={!!errors.weight}
            className="h-11 bg-background border-input focus:ring-2 focus:ring-ring focus:ring-offset-0"
          />
          {errors.weight && (
            <p id="weight-error" className="text-xs text-destructive" role="alert">
              {errors.weight}
            </p>
          )}
        </div>

        {/* Height - stored in cm, displayed in user preference */}
        <div className="space-y-1.5">
          <Label htmlFor="profile-height" className="text-sm font-medium text-foreground flex items-center gap-2">
            <Ruler className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
            Height ({heightDisplayUnit})
          </Label>
          <Input
            id="profile-height"
            type="number"
            inputMode="decimal"
            min={heightUnit === 'ft-in' ? 47 : 120}
            max={heightUnit === 'ft-in' ? 91 : 230}
            value={storageToDisplay(localData.height, 'height')}
            onChange={(e) => {
              const storageValue = displayToStorage(e.target.value, 'height');
              setLocalData(prev => ({ ...prev, height: storageValue }));
              if (errors.height) setErrors(prev => ({ ...prev, height: undefined }));
            }}
            placeholder={`Enter height in ${heightDisplayUnit}`}
            aria-describedby={errors.height ? 'height-error' : undefined}
            aria-invalid={!!errors.height}
            className="h-11 bg-background border-input focus:ring-2 focus:ring-ring focus:ring-offset-0"
          />
          {errors.height && (
            <p id="height-error" className="text-xs text-destructive" role="alert">
              {errors.height}
            </p>
          )}
        </div>

        {/* Birthday */}
        <div className="space-y-1.5">
          <Label htmlFor="profile-birthday" className="text-sm font-medium text-foreground flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
            Birthday
            {age !== null && (
              <span className="text-xs text-muted-foreground font-normal">
                (Age: {age})
              </span>
            )}
          </Label>
          <Input
            id="profile-birthday"
            type="date"
            value={localData.birthday || ''}
            onChange={(e) => {
              setLocalData(prev => ({ ...prev, birthday: e.target.value || null }));
              if (errors.birthday) setErrors(prev => ({ ...prev, birthday: undefined }));
            }}
            max={new Date().toISOString().split('T')[0]}
            aria-describedby={errors.birthday ? 'birthday-error' : undefined}
            aria-invalid={!!errors.birthday}
            className="h-11 bg-background border-input focus:ring-2 focus:ring-ring focus:ring-offset-0"
          />
          {errors.birthday && (
            <p id="birthday-error" className="text-xs text-destructive" role="alert">
              {errors.birthday}
            </p>
          )}
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving || !hasChanges || hasValidationErrors}
          className="w-full h-11 mt-2"
          aria-label="Save profile metrics"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" aria-hidden="true" />
              Save Changes
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileMetrics;
