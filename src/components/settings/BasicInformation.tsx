
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Save, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const BasicInformation = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    weight: '',
    birthday: '',
    height: '',
    experience: '',
    activity: '',
    goal: ''
  });
  const [preferences, setPreferences] = useState({
    weight_unit: 'lbs',
    height_unit: 'ft-in'
  });
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalProfile, setOriginalProfile] = useState(profile);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  useEffect(() => {
    if (profile.birthday) {
      const birthDate = new Date(profile.birthday);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        setCalculatedAge(age - 1);
      } else {
        setCalculatedAge(age);
      }
    }
  }, [profile.birthday]);

  useEffect(() => {
    setHasChanges(JSON.stringify(profile) !== JSON.stringify(originalProfile));
  }, [profile, originalProfile]);

  const fetchUserData = async () => {
    try {
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Fetch preferences
      const { data: preferencesData, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (preferencesError && preferencesError.code !== 'PGRST116') {
        throw preferencesError;
      }

      const profileInfo = {
        weight: profileData?.weight?.toString() || '',
        birthday: profileData?.birthday || '',
        height: profileData?.height?.toString() || '',
        experience: profileData?.experience || '',
        activity: profileData?.activity || '',
        goal: profileData?.goal || ''
      };

      const preferencesInfo = {
        weight_unit: preferencesData?.weight_unit || 'lbs',
        height_unit: preferencesData?.height_unit || 'ft-in'
      };

      setProfile(profileInfo);
      setOriginalProfile(profileInfo);
      setPreferences(preferencesInfo);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load profile data');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Convert weight and height to proper units for database storage
      let weightValue = parseFloat(profile.weight) || 0;
      let heightValue = parseFloat(profile.height) || 0;

      // Convert to metric for storage
      if (preferences.weight_unit === 'lbs') {
        weightValue = weightValue / 2.20462; // Convert lbs to kg
      }
      if (preferences.height_unit === 'ft-in') {
        heightValue = heightValue * 2.54; // Convert inches to cm
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          weight: Math.round(weightValue),
          height: Math.round(heightValue),
          birthday: profile.birthday || null,
          experience: profile.experience || null,
          activity: profile.activity || null,
          goal: profile.goal || null,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setOriginalProfile(profile);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getWeightDisplay = () => {
    if (!profile.weight) return '';
    const weight = parseFloat(profile.weight);
    if (preferences.weight_unit === 'kg') {
      return `${weight} kg`;
    }
    return `${weight} lbs`;
  };

  const getHeightDisplay = () => {
    if (!profile.height) return '';
    const height = parseFloat(profile.height);
    if (preferences.height_unit === 'cm') {
      return `${height} cm`;
    }
    const feet = Math.floor(height / 12);
    const inches = height % 12;
    return `${feet}'${inches}"`;
  };

  return (
    <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <User className="w-5 h-5 mr-2 text-orange-400" />
          Basic Information
        </CardTitle>
        <CardDescription className="text-gray-400">
          Update your personal information and fitness profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weight */}
        <div className="space-y-2">
          <Label htmlFor="weight" className="text-white">
            Weight ({preferences.weight_unit})
          </Label>
          <Input
            id="weight"
            type="number"
            value={profile.weight}
            onChange={(e) => handleInputChange('weight', e.target.value)}
            placeholder={`Enter weight in ${preferences.weight_unit}`}
            className="bg-gray-800/50 border-gray-600 text-white"
          />
        </div>

        {/* Height */}
        <div className="space-y-2">
          <Label htmlFor="height" className="text-white">
            Height ({preferences.height_unit === 'cm' ? 'cm' : 'inches'})
          </Label>
          <Input
            id="height"
            type="number"
            value={profile.height}
            onChange={(e) => handleInputChange('height', e.target.value)}
            placeholder={`Enter height in ${preferences.height_unit === 'cm' ? 'cm' : 'inches'}`}
            className="bg-gray-800/50 border-gray-600 text-white"
          />
        </div>

        {/* Birthday */}
        <div className="space-y-2">
          <Label htmlFor="birthday" className="text-white flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Birthday
            {calculatedAge && (
              <span className="ml-2 text-sm text-gray-400">
                (Age: {calculatedAge})
              </span>
            )}
          </Label>
          <Input
            id="birthday"
            type="date"
            value={profile.birthday}
            onChange={(e) => handleInputChange('birthday', e.target.value)}
            className="bg-gray-800/50 border-gray-600 text-white"
          />
        </div>

        {/* Experience Level */}
        <div className="space-y-2">
          <Label htmlFor="experience" className="text-white">Experience Level</Label>
          <Select value={profile.experience} onValueChange={(value) => handleInputChange('experience', value)}>
            <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
              <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
              <SelectItem value="advanced">Advanced (3+ years)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Activity Level */}
        <div className="space-y-2">
          <Label htmlFor="activity" className="text-white">Activity Level</Label>
          <Select value={profile.activity} onValueChange={(value) => handleInputChange('activity', value)}>
            <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
              <SelectValue placeholder="Select activity level" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="sedentary">Sedentary (Little to no exercise)</SelectItem>
              <SelectItem value="lightly_active">Lightly Active (Light exercise 1-3 days/week)</SelectItem>
              <SelectItem value="moderately_active">Moderately Active (Moderate exercise 3-5 days/week)</SelectItem>
              <SelectItem value="very_active">Very Active (Hard exercise 6-7 days/week)</SelectItem>
              <SelectItem value="extra_active">Extra Active (Very hard exercise & physical job)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Primary Goal - Updated with Cut/Bulk/Maintenance */}
        <div className="space-y-2">
          <Label htmlFor="goal" className="text-white">Primary Goal</Label>
          <Select value={profile.goal} onValueChange={(value) => handleInputChange('goal', value)}>
            <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
              <SelectValue placeholder="Select primary goal" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="cut">Cut - Lose fat while preserving muscle mass</SelectItem>
              <SelectItem value="bulk">Bulk - Gain muscle mass with controlled weight gain</SelectItem>
              <SelectItem value="maintenance">Maintenance - Maintain current physique and strength</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default BasicInformation;
