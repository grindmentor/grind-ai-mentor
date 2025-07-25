
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dumbbell, Save } from 'lucide-react';
import { toast } from 'sonner';

interface FitnessProfileProps {
  profile: {
    experience: string;
    activity: string;
    goal: string;
  };
  onInputChange: (field: string, value: string) => Promise<void>;
}

const FitnessProfile: React.FC<FitnessProfileProps> = ({
  profile,
  onInputChange
}) => {
  const [localProfile, setLocalProfile] = useState(profile);
  const [isSaving, setIsSaving] = useState(false);

  const handleLocalChange = (field: string, value: string) => {
    setLocalProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save all changes
      for (const [field, value] of Object.entries(localProfile)) {
        if (value !== profile[field as keyof typeof profile]) {
          await onInputChange(field, value);
        }
      }
      toast.success('Fitness profile updated successfully');
    } catch (error) {
      console.error('Error saving fitness profile:', error);
      toast.error('Failed to save fitness profile');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = JSON.stringify(localProfile) !== JSON.stringify(profile);

  return (
    <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Dumbbell className="w-5 h-5 mr-2 text-orange-400" />
          Fitness Profile
        </CardTitle>
        <CardDescription className="text-gray-400">
          Configure your fitness experience and goals for personalized recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Experience Level */}
        <div className="space-y-2">
          <Label htmlFor="experience" className="text-white">Training Experience</Label>
          <Select value={localProfile.experience} onValueChange={(value) => handleLocalChange('experience', value)}>
            <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
              <SelectValue placeholder="Select your training experience" />
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
              <SelectValue placeholder="Select your activity level" />
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
        <div className="space-y-2">
          <Label htmlFor="goal" className="text-white">Primary Fitness Goal</Label>
          <Select value={localProfile.goal} onValueChange={(value) => handleLocalChange('goal', value)}>
            <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
              <SelectValue placeholder="Select your primary goal" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="cut">Cut - Lose fat while preserving muscle mass</SelectItem>
              <SelectItem value="bulk">Weight Gain/Bulk - Gain muscle mass with controlled weight gain</SelectItem>
              <SelectItem value="maintain">Maintain - Keep current weight and body composition</SelectItem>
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

export default FitnessProfile;
