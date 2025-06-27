
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, User, Dumbbell, Globe, Zap, Brain, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UnitPreferences from '@/components/settings/UnitPreferences';
import AppPreferences from '@/components/settings/AppPreferences';
import AIMemoryReset from '@/components/settings/AIMemoryReset';
import { useIsMobile } from '@/hooks/use-mobile';
import { PageTransition } from '@/components/ui/page-transition';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Settings = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    weight: '',
    birthday: '',
    height: '',
    heightFeet: '',
    heightInches: '',
    experience: '',
    activity: '',
    goal: '',
    display_name: '',
    email: '',
    body_fat_percentage: ''
  });
  
  const [preferences, setPreferences] = useState({
    weight_unit: 'lbs',
    height_unit: 'ft-in'
  });

  useEffect(() => {
    if (user) {
      loadProfile();
      loadPreferences();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setProfile({
          weight: data.weight?.toString() || '',
          birthday: data.birthday || '',
          height: data.height?.toString() || '',
          heightFeet: '',
          heightInches: '',
          experience: data.experience || '',
          activity: data.activity || '',
          goal: data.goal || '',
          display_name: data.display_name || '',
          email: data.email || user.email || '',
          body_fat_percentage: data.body_fat_percentage?.toString() || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('weight_unit, height_unit')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading preferences:', error);
        return;
      }

      if (data) {
        setPreferences({
          weight_unit: data.weight_unit || 'lbs',
          height_unit: data.height_unit || 'ft-in'
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const saveProfile = async () => {
    if (!user || saving) return;

    setSaving(true);
    try {
      const profileData = {
        id: user.id,
        email: profile.email,
        display_name: profile.display_name || null,
        weight: profile.weight ? parseInt(profile.weight) : null,
        height: profile.height ? parseInt(profile.height) : null,
        birthday: profile.birthday || null,
        experience: profile.experience || null,
        activity: profile.activity || null,
        goal: profile.goal || null,
        body_fat_percentage: profile.body_fat_percentage ? parseFloat(profile.body_fat_percentage) : null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (error) throw error;

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const onInputChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const onWeightChange = (value: string) => {
    setProfile(prev => ({
      ...prev,
      weight: value
    }));
  };

  const onHeightChange = (value: string) => {
    setProfile(prev => ({
      ...prev,
      height: value
    }));
  };

  const getWeightDisplay = () => {
    return profile.weight;
  };

  const getHeightDisplay = () => {
    return profile.height;
  };

  const calculateAge = (birthday: string) => {
    if (!birthday) return null;
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculatedAge = calculateAge(profile.birthday);

  const tabs = [
    { id: 'basic', label: 'Profile', icon: User },
    { id: 'fitness', label: 'Fitness', icon: Dumbbell },
    { id: 'units', label: 'Units', icon: Globe },
    { id: 'app', label: 'App', icon: Zap },
    { id: 'ai', label: 'AI Memory', icon: Brain }
  ];

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
        <div className="p-2 sm:p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6 px-2 sm:px-0">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/app')}
                className="text-white hover:bg-gray-800/50 backdrop-blur-sm hover:text-orange-400 transition-colors w-fit"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-gray-400 text-sm sm:text-base">Customize your fitness journey</p>
              </div>
            </div>

            {/* Settings Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
              <TabsList className={`grid w-full grid-cols-5 bg-gray-900/40 backdrop-blur-sm mx-2 sm:mx-0 ${isMobile ? 'text-xs' : ''}`}>
                {tabs.map((tab) => (
                  <TabsTrigger 
                    key={tab.id}
                    value={tab.id} 
                    className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 data-[state=active]:border-orange-500/30 p-2 sm:p-3"
                  >
                    <tab.icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {!isMobile && tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 sm:p-6 mx-2 sm:mx-0">
                <TabsContent value="basic" className="mt-0 space-y-6">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center text-lg sm:text-xl">
                        <User className="w-5 h-5 mr-2 text-orange-500" />
                        Basic Information
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base">
                        Your personal details for accurate fitness recommendations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="display_name" className="block text-sm font-medium text-white mb-2">
                            Display Name
                          </label>
                          <Input
                            id="display_name"
                            value={profile.display_name}
                            onChange={(e) => onInputChange('display_name', e.target.value)}
                            placeholder="Enter your display name"
                            className="bg-gray-800 border-gray-700 text-white min-h-[48px]"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                            Email
                          </label>
                          <Input
                            id="email"
                            value={profile.email}
                            onChange={(e) => onInputChange('email', e.target.value)}
                            placeholder="Enter your email"
                            className="bg-gray-800 border-gray-700 text-white min-h-[48px]"
                            disabled
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="weight" className="block text-sm font-medium text-white mb-2">
                            Weight ({preferences.weight_unit})
                          </label>
                          <Input
                            id="weight"
                            type="number"
                            value={getWeightDisplay()}
                            onChange={(e) => onWeightChange(e.target.value)}
                            placeholder={`Enter weight in ${preferences.weight_unit}`}
                            className="bg-gray-800 border-gray-700 text-white min-h-[48px]"
                          />
                        </div>
                        <div>
                          <label htmlFor="height" className="block text-sm font-medium text-white mb-2">
                            Height ({preferences.height_unit === 'ft-in' ? 'inches' : 'cm'})
                          </label>
                          <Input
                            id="height"
                            type="number"
                            value={getHeightDisplay()}
                            onChange={(e) => onHeightChange(e.target.value)}
                            placeholder={`Enter height in ${preferences.height_unit === 'ft-in' ? 'inches' : 'cm'}`}
                            className="bg-gray-800 border-gray-700 text-white min-h-[48px]"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="birthday" className="block text-sm font-medium text-white mb-2">
                          Birthday
                        </label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="birthday"
                            type="date"
                            value={profile.birthday}
                            onChange={(e) => onInputChange('birthday', e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white min-h-[48px]"
                          />
                          {calculatedAge && (
                            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              Age: {calculatedAge}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="body_fat_percentage" className="block text-sm font-medium text-white mb-2">
                          Body Fat Percentage (Optional)
                        </label>
                        <Input
                          id="body_fat_percentage"
                          type="number"
                          step="0.1"
                          min="5"
                          max="50"
                          value={profile.body_fat_percentage}
                          onChange={(e) => onInputChange('body_fat_percentage', e.target.value)}
                          placeholder="Enter body fat percentage"
                          className="bg-gray-800 border-gray-700 text-white min-h-[48px]"
                        />
                      </div>

                      <Button 
                        onClick={saveProfile}
                        disabled={saving}
                        className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto"
                      >
                        {saving ? 'Saving...' : 'Save Profile'}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="fitness" className="mt-0 space-y-6">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center text-lg sm:text-xl">
                        <Dumbbell className="w-5 h-5 mr-2 text-orange-500" />
                        Fitness Profile
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base">
                        Configure your fitness goals and experience level
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="experience" className="block text-sm font-medium text-white mb-2">
                            Experience Level
                          </label>
                          <Select value={profile.experience} onValueChange={(value) => onInputChange('experience', value)}>
                            <SelectTrigger className="bg-gray-800 border-gray-700 text-white min-h-[48px]">
                              <SelectValue placeholder="Select experience level" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                              <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                              <SelectItem value="advanced">Advanced (3+ years)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label htmlFor="activity" className="block text-sm font-medium text-white mb-2">
                            Activity Level
                          </label>
                          <Select value={profile.activity} onValueChange={(value) => onInputChange('activity', value)}>
                            <SelectTrigger className="bg-gray-800 border-gray-700 text-white min-h-[48px]">
                              <SelectValue placeholder="Select activity level" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                              <SelectItem value="lightly_active">Lightly Active (light exercise 1-3 days/week)</SelectItem>
                              <SelectItem value="moderately_active">Moderately Active (moderate exercise 3-5 days/week)</SelectItem>
                              <SelectItem value="very_active">Very Active (hard exercise 6-7 days/week)</SelectItem>
                              <SelectItem value="extremely_active">Extremely Active (very hard exercise, physical job)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="goal" className="block text-sm font-medium text-white mb-2">
                          Primary Goal
                        </label>
                        <Select value={profile.goal} onValueChange={(value) => onInputChange('goal', value)}>
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white min-h-[48px]">
                            <SelectValue placeholder="Select your primary goal" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="weight_loss">Weight Loss</SelectItem>
                            <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                            <SelectItem value="strength">Strength</SelectItem>
                            <SelectItem value="endurance">Endurance</SelectItem>
                            <SelectItem value="general_fitness">General Fitness</SelectItem>
                            <SelectItem value="body_recomposition">Body Recomposition</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button 
                        onClick={saveProfile}
                        disabled={saving}
                        className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto"
                      >
                        {saving ? 'Saving...' : 'Save Fitness Profile'}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="units" className="mt-0">
                  <UnitPreferences />
                </TabsContent>

                <TabsContent value="app" className="mt-0">
                  <AppPreferences />
                </TabsContent>

                <TabsContent value="ai" className="mt-0">
                  <AIMemoryReset />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Settings;
