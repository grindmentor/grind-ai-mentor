import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Save } from 'lucide-react';
import { toast } from 'sonner';

interface BasicInformationProps {
  profile: {
    weight: string;
    birthday: string;
    height: string;
    heightFeet: string;
    heightInches: string;
    experience: string;
    activity: string;
    goal: string;
  };
  preferences: {
    weight_unit: string;
    height_unit: string;
  };
  calculatedAge: number | null;
  onInputChange: (field: string, value: string) => Promise<void>;
  onWeightChange: (value: string) => void;
  onHeightChange: (value: string) => void;
  getWeightDisplay: () => string;
  getHeightDisplay: () => string;
}

const BasicInformation: React.FC<BasicInformationProps> = ({
  profile,
  preferences,
  calculatedAge,
  onInputChange,
  onWeightChange,
  onHeightChange,
  getWeightDisplay,
  getHeightDisplay
}) => {
  const [localProfile, setLocalProfile] = useState(profile);
  const [isSaving, setIsSaving] = useState(false);

  const handleLocalChange = (field: string, value: string) => {
    setLocalProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Convert units properly before saving
      const updates: Record<string, any> = {};
      
      if (localProfile.weight !== profile.weight) {
        let weightValue = parseFloat(localProfile.weight);
        if (isNaN(weightValue)) weightValue = 0;
        
        // Convert to kg for storage (database stores in kg)
        if (preferences.weight_unit === 'lbs') {
          weightValue = weightValue / 2.20462; // Convert lbs to kg
        }
        // If unit is kg, store as is
        updates.weight = Math.round(weightValue);
      }
      
      if (localProfile.height !== profile.height) {
        let heightValue = parseFloat(localProfile.height);
        if (isNaN(heightValue)) heightValue = 0;
        
        // Convert to cm for storage (database stores in cm)
        if (preferences.height_unit === 'ft-in') {
          // Convert inches to cm
          heightValue = heightValue * 2.54;
        }
        // If unit is cm, store as is
        updates.height = Math.round(heightValue);
      }
      
      // Handle other fields
      Object.keys(localProfile).forEach(field => {
        if (field !== 'weight' && field !== 'height' && localProfile[field as keyof typeof localProfile] !== profile[field as keyof typeof profile]) {
          updates[field] = localProfile[field as keyof typeof localProfile];
        }
      });
      
      // Save all updates
      for (const [field, value] of Object.entries(updates)) {
        await onInputChange(field, value.toString());
      }
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = JSON.stringify(localProfile) !== JSON.stringify(profile);

  const goalOptions = [
    {
      value: 'cut',
      label: 'Cut',
      description: 'Lose fat while preserving muscle mass'
    },
    {
      value: 'bulk',
      label: 'Bulk',
      description: 'Gain muscle mass with controlled weight gain'
    },
    {
      value: 'maintenance',
      label: 'Maintenance',
      description: 'Maintain current weight and body composition'
    }
  ];

  return (
    <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white">Basic Information</CardTitle>
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
            value={localProfile.weight}
            onChange={(e) => handleLocalChange('weight', e.target.value)}
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
            value={localProfile.height}
            onChange={(e) => handleLocalChange('height', e.target.value)}
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
            value={localProfile.birthday}
            onChange={(e) => handleLocalChange('birthday', e.target.value)}
            className="bg-gray-800/50 border-gray-600 text-white"
          />
        </div>

        {/* Experience Level */}
        <div className="space-y-2">
          <Label htmlFor="experience" className="text-white">Experience Level</Label>
          <Select value={localProfile.experience} onValueChange={(value) => handleLocalChange('experience', value)}>
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
          <Select value={localProfile.activity} onValueChange={(value) => handleLocalChange('activity', value)}>
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

        {/* Primary Goal */}
        <div className="space-y-3">
          <Label htmlFor="goal" className="text-white">Primary Goal</Label>
          <Select value={localProfile.goal} onValueChange={(value) => handleLocalChange('goal', value)}>
            <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
              <SelectValue placeholder="Select primary goal" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {goalOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-gray-400">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {localProfile.goal && (
            <div className="text-xs text-gray-400 mt-1">
              {goalOptions.find(opt => opt.value === localProfile.goal)?.description}
            </div>
          )}
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
