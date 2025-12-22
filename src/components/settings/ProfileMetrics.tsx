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

interface ProfileMetricsData {
  weight: number | null;
  height: number | null;
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
  const [data, setData] = useState<ProfileMetricsData>({
    weight: null,
    height: null,
    birthday: null
  });
  const [localData, setLocalData] = useState<ProfileMetricsData>({
    weight: null,
    height: null,
    birthday: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const errorAnnouncerRef = useRef<HTMLDivElement>(null);

  // Load profile data
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
          const profileData: ProfileMetricsData = {
            weight: profile.weight,
            height: profile.height,
            birthday: profile.birthday
          };
          setData(profileData);
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

  // Convert display value to storage (kg, cm)
  const displayToStorage = (value: number | null, field: 'weight' | 'height'): number | null => {
    if (value === null) return null;
    if (field === 'weight' && preferences.weight_unit === 'lbs') {
      return Math.round(value / 2.20462);
    }
    if (field === 'height' && preferences.height_unit === 'ft-in') {
      // Input is in total inches when using ft-in
      return Math.round(value * 2.54);
    }
    return Math.round(value);
  };

  // Convert storage value (kg, cm) to display
  const storageToDisplay = (value: number | null, field: 'weight' | 'height'): number | null => {
    if (value === null) return null;
    if (field === 'weight' && preferences.weight_unit === 'lbs') {
      return Math.round(value * 2.20462);
    }
    if (field === 'height' && preferences.height_unit === 'ft-in') {
      // Convert cm to inches for display
      return Math.round(value / 2.54);
    }
    return value;
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    // Weight validation (in kg for storage: 30-250 kg)
    if (localData.weight !== null) {
      const weightInKg = displayToStorage(localData.weight, 'weight') ?? 0;
      if (weightInKg < 30 || weightInKg > 250) {
        const minDisplay = preferences.weight_unit === 'lbs' ? 66 : 30;
        const maxDisplay = preferences.weight_unit === 'lbs' ? 551 : 250;
        newErrors.weight = `Weight must be between ${minDisplay} and ${maxDisplay} ${preferences.weight_unit}`;
      }
    }
    
    // Height validation (in cm for storage: 120-230 cm)
    if (localData.height !== null) {
      const heightInCm = displayToStorage(localData.height, 'height') ?? 0;
      if (heightInCm < 120 || heightInCm > 230) {
        const minDisplay = preferences.height_unit === 'ft-in' ? 47 : 120;
        const maxDisplay = preferences.height_unit === 'ft-in' ? 91 : 230;
        const unit = preferences.height_unit === 'ft-in' ? 'inches' : 'cm';
        newErrors.height = `Height must be between ${minDisplay} and ${maxDisplay} ${unit}`;
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
      const updates: Record<string, any> = {};
      
      // Convert to storage units
      if (localData.weight !== data.weight) {
        updates.weight = displayToStorage(localData.weight, 'weight');
      }
      if (localData.height !== data.height) {
        updates.height = displayToStorage(localData.height, 'height');
      }
      if (localData.birthday !== data.birthday) {
        updates.birthday = localData.birthday;
      }

      if (Object.keys(updates).length === 0) {
        toast.info('No changes to save');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Update saved state
      setData({ ...data, ...localData });
      toast.success('Profile metrics updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile metrics');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = 
    localData.weight !== data.weight ||
    localData.height !== data.height ||
    localData.birthday !== data.birthday;

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

  const weightUnit = preferences.weight_unit || 'kg';
  const heightUnit = preferences.height_unit === 'ft-in' ? 'inches' : 'cm';

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-foreground text-sm font-semibold flex items-center gap-2">
          <Scale className="w-4 h-4 text-primary" />
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

        {/* Weight */}
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
            value={localData.weight !== null ? storageToDisplay(localData.weight, 'weight') ?? '' : ''}
            onChange={(e) => {
              const val = e.target.value;
              const numVal = val === '' ? null : parseFloat(val);
              // Store in display units, convert on save
              setLocalData(prev => ({ ...prev, weight: numVal }));
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

        {/* Height */}
        <div className="space-y-1.5">
          <Label htmlFor="profile-height" className="text-sm font-medium text-foreground flex items-center gap-2">
            <Ruler className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
            Height ({heightUnit})
          </Label>
          <Input
            id="profile-height"
            type="number"
            inputMode="decimal"
            min={heightUnit === 'inches' ? 47 : 120}
            max={heightUnit === 'inches' ? 91 : 230}
            value={localData.height !== null ? storageToDisplay(localData.height, 'height') ?? '' : ''}
            onChange={(e) => {
              const val = e.target.value;
              const numVal = val === '' ? null : parseFloat(val);
              setLocalData(prev => ({ ...prev, height: numVal }));
              if (errors.height) setErrors(prev => ({ ...prev, height: undefined }));
            }}
            placeholder={`Enter height in ${heightUnit}`}
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
          disabled={isSaving || !hasChanges || Object.keys(errors).some(k => errors[k as keyof ValidationErrors])}
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
