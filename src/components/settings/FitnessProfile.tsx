
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dumbbell, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const FitnessProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    experience: '',
    activity: '',
    goal: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('experience, activity, goal')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
      } else if (data) {
        setProfile({
          experience: data.experience || '',
          activity: data.activity || '',
          goal: data.goal || ''
        });
      }
    } catch (error) {
      console.error('Error in loadProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email || '',
          experience: profile.experience || null,
          activity: profile.activity || null,
          goal: profile.goal || null
        });

      if (error) throw error;
      toast.success('Fitness profile updated successfully');
    } catch (error) {
      console.error('Error saving fitness profile:', error);
      toast.error('Failed to save fitness profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gray-900/40 border-gray-700/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            <div className="h-20 bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
          <Select value={profile.experience} onValueChange={(value) => handleInputChange('experience', value)}>
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
          <Select value={profile.activity} onValueChange={(value) => handleInputChange('activity', value)}>
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
          <Select value={profile.goal} onValueChange={(value) => handleInputChange('goal', value)}>
            <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
              <SelectValue placeholder="Select your primary goal" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="cut">Cut - Lose fat while preserving muscle mass</SelectItem>
              <SelectItem value="bulk">Bulk - Gain muscle mass with controlled weight gain</SelectItem>
              <SelectItem value="maintenance">Maintenance - Keep current weight and body composition</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FitnessProfile;
