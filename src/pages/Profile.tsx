
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, TrendingUp, User, Activity, Target, Calendar, Award, Flame, Trophy, Zap, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { supabase } from '@/integrations/supabase/client';
import { PageTransition } from '@/components/ui/page-transition';
import { toast } from 'sonner';

const Profile = () => {
  const { user } = useAuth();
  const { preferences } = usePreferences();
  const [profile, setProfile] = useState(null);
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
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      setProfile(data || {
        display_name: '',
        email: user?.email || '',
        weight: '',
        height: '',
        birthday: '',
        body_fat_percentage: '',
        experience: '',
        activity: '',
        goal: ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
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

  const calculateAge = (birthday) => {
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

  const getWeightDisplay = () => {
    if (!profile?.weight) return 'Not set';
    return `${profile.weight} ${preferences.weight_unit}`;
  };

  const getHeightDisplay = () => {
    if (!profile?.height) return 'Not set';
    if (preferences.height_unit === 'ft-in') {
      const totalInches = profile.height;
      const feet = Math.floor(totalInches / 12);
      const inches = totalInches % 12;
      return `${feet}'${inches}"`;
    } else {
      return `${profile.height} cm`;
    }
  };

  const getGoalDisplay = (goal) => {
    switch (goal) {
      case 'weight_loss': return 'Weight Loss';
      case 'muscle_gain': return 'Muscle Gain';
      case 'strength': return 'Strength';
      case 'endurance': return 'Endurance';
      case 'general_fitness': return 'General Fitness';
      case 'body_recomposition': return 'Body Recomposition';
      default: return goal ? goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not set';
    }
  };

  const getExperienceDisplay = (experience) => {
    switch (experience) {
      case 'beginner': return 'Beginner (0-1 years)';
      case 'intermediate': return 'Intermediate (1-3 years)';
      case 'advanced': return 'Advanced (3+ years)';
      default: return experience ? experience.charAt(0).toUpperCase() + experience.slice(1) : 'Not set';
    }
  };

  const getActivityDisplay = (activity) => {
    switch (activity) {
      case 'sedentary': return 'Sedentary';
      case 'lightly_active': return 'Lightly Active';
      case 'moderately_active': return 'Moderately Active';
      case 'very_active': return 'Very Active';
      case 'extremely_active': return 'Extremely Active';
      default: return activity ? activity.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not set';
    }
  };

  // Mock progress data - in real app this would come from user's actual progress
  const progressStats = [
    { icon: Activity, title: "Workouts", value: "12", subtitle: "This Month", color: "text-green-400" },
    { icon: Target, title: "Goals", value: "3", subtitle: "Active", color: "text-blue-400" },
    { icon: Calendar, title: "Streak", value: "8", subtitle: "Days", color: "text-orange-400" },
    { icon: TrendingUp, title: "Progress", value: "85%", subtitle: "This Month", color: "text-purple-400" }
  ];

  const achievements = [
    { icon: Trophy, title: "First Workout", description: "Completed your first workout", earned: true },
    { icon: Flame, title: "Week Warrior", description: "Complete 5 workouts in a week", earned: true },
    { icon: Zap, title: "Consistency King", description: "7-day workout streak", earned: true },
    { icon: Award, title: "Goal Crusher", description: "Achieve your first goal", earned: false }
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
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white p-4 sm:p-6">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/app">
              <Button 
                variant="ghost" 
                className="text-white hover:text-orange-400 hover:bg-gray-800/50 transition-colors w-fit"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/25">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  {profile?.display_name || user?.user_metadata?.name || 'Your Profile'}
                </h1>
                <p className="text-gray-400 text-sm sm:text-base">Personal data and fitness progress</p>
              </div>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {progressStats.map((stat, index) => (
              <Card key={index} className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6 text-center">
                  <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${stat.color} mx-auto mb-2 sm:mb-3`} />
                  <div className="text-xl sm:text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <p className="text-gray-400 text-xs sm:text-sm">{stat.subtitle}</p>
                  <h3 className="text-white font-medium text-sm sm:text-base">{stat.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Editable Profile Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg sm:text-xl flex items-center">
                  <User className="w-5 h-5 mr-2 text-orange-400" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Display Name</label>
                    <Input
                      value={profile?.display_name || ''}
                      onChange={(e) => onInputChange('display_name', e.target.value)}
                      placeholder="Enter display name"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Email</label>
                    <Input
                      value={profile?.email || user?.email || ''}
                      disabled
                      className="bg-gray-800 border-gray-700 text-gray-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Weight ({preferences.weight_unit})
                    </label>
                    <Input
                      type="number"
                      value={profile?.weight || ''}
                      onChange={(e) => onInputChange('weight', e.target.value)}
                      placeholder={`Weight in ${preferences.weight_unit}`}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Height ({preferences.height_unit === 'ft-in' ? 'inches' : 'cm'})
                    </label>
                    <Input
                      type="number"
                      value={profile?.height || ''}
                      onChange={(e) => onInputChange('height', e.target.value)}
                      placeholder={`Height in ${preferences.height_unit === 'ft-in' ? 'total inches' : 'cm'}`}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Birthday</label>
                    <Input
                      type="date"
                      value={profile?.birthday || ''}
                      onChange={(e) => onInputChange('birthday', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    {profile?.birthday && (
                      <p className="text-sm text-gray-400 mt-1">Age: {calculateAge(profile.birthday)}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Body Fat %</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={profile?.body_fat_percentage || ''}
                      onChange={(e) => onInputChange('body_fat_percentage', e.target.value)}
                      placeholder="Optional"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg sm:text-xl flex items-center">
                  <Target className="w-5 h-5 mr-2 text-orange-400" />
                  Fitness Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Primary Goal</label>
                  <Select value={profile?.goal || ''} onValueChange={(value) => onInputChange('goal', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
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

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Experience Level</label>
                  <Select value={profile?.experience || ''} onValueChange={(value) => onInputChange('experience', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
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
                  <label className="block text-sm font-medium text-white mb-2">Activity Level</label>
                  <Select value={profile?.activity || ''} onValueChange={(value) => onInputChange('activity', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="sedentary">Sedentary</SelectItem>
                      <SelectItem value="lightly_active">Lightly Active</SelectItem>
                      <SelectItem value="moderately_active">Moderately Active</SelectItem>
                      <SelectItem value="very_active">Very Active</SelectItem>
                      <SelectItem value="extremely_active">Extremely Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={saveProfile}
                  disabled={saving}
                  className="bg-orange-500 hover:bg-orange-600 text-white w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Current Profile Display */}
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-lg sm:text-xl">Current Profile Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Weight</p>
                  <p className="text-white font-medium">{getWeightDisplay()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Height</p>
                  <p className="text-white font-medium">{getHeightDisplay()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Goal</p>
                  <p className="text-white font-medium">{getGoalDisplay(profile?.goal)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Experience</p>
                  <p className="text-white font-medium">{getExperienceDisplay(profile?.experience)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-lg sm:text-xl flex items-center">
                <Award className="w-5 h-5 mr-2 text-orange-400" />
                Achievements
              </CardTitle>
              <CardDescription>
                Your fitness milestones and accomplishments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border transition-all ${
                      achievement.earned 
                        ? 'bg-orange-500/10 border-orange-500/30' 
                        : 'bg-gray-800/50 border-gray-700/50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <achievement.icon className={`w-6 h-6 ${
                        achievement.earned ? 'text-orange-400' : 'text-gray-500'
                      }`} />
                      <div>
                        <h4 className={`font-semibold ${
                          achievement.earned ? 'text-white' : 'text-gray-400'
                        }`}>
                          {achievement.title}
                        </h4>
                        <p className={`text-sm ${
                          achievement.earned ? 'text-orange-200' : 'text-gray-500'
                        }`}>
                          {achievement.description}
                        </p>
                      </div>
                      {achievement.earned && (
                        <Badge className="bg-orange-500 text-white ml-auto">
                          Earned
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};

export default Profile;
