
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { ArrowLeft, TrendingUp, User, Activity, Target, Calendar, Award, Flame, Trophy, Zap, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageTransition } from '@/components/ui/page-transition';
import { toast } from 'sonner';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState({
    weight_unit: 'lbs',
    height_unit: 'ft-in'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editableProfile, setEditableProfile] = useState({
    display_name: '',
    weight: '',
    height: '',
    birthday: '',
    experience: '',
    activity: '',
    goal: '',
    body_fat_percentage: ''
  });

  // Dynamic progress stats
  const [progressStats, setProgressStats] = useState({
    workouts: 0,
    goals: 0,
    streak: 0,
    progress: 0
  });

  useEffect(() => {
    if (user) {
      loadProfile();
      loadPreferences();
      loadProgressStats();
    }
  }, [user]);

  const loadProgressStats = async () => {
    if (!user) return;

    try {
      // Get actual workout count for this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { data: workouts, error: workoutError } = await supabase
        .from('workout_sessions')
        .select('id')
        .eq('user_id', user.id)
        .gte('session_date', startOfMonth.toISOString().split('T')[0]);

      // Get actual goals count
      const { data: goals, error: goalsError } = await supabase
        .from('user_goals')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_completed', false);

      // Calculate streak (simplified - consecutive workout days)
      const { data: recentWorkouts, error: streakError } = await supabase
        .from('workout_sessions')
        .select('session_date')
        .eq('user_id', user.id)
        .order('session_date', { ascending: false })
        .limit(30);

      let streak = 0;
      if (recentWorkouts && recentWorkouts.length > 0) {
        const today = new Date();
        let checkDate = new Date(today);
        
        for (const workout of recentWorkouts) {
          const workoutDate = new Date(workout.session_date);
          if (workoutDate.toDateString() === checkDate.toDateString()) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      // Calculate progress percentage based on completed goals
      const { data: completedGoals, error: completedError } = await supabase
        .from('user_goals')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_completed', true);

      const totalGoals = (goals?.length || 0) + (completedGoals?.length || 0);
      const progressPercentage = totalGoals > 0 ? Math.round(((completedGoals?.length || 0) / totalGoals) * 100) : 0;

      setProgressStats({
        workouts: workouts?.length || 0,
        goals: goals?.length || 0,
        streak: streak,
        progress: progressPercentage
      });
    } catch (error) {
      console.error('Error loading progress stats:', error);
    }
  };

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

      setProfile(data);
      if (data) {
        setEditableProfile({
          display_name: data.display_name || '',
          weight: data.weight?.toString() || '',
          height: data.height?.toString() || '',
          birthday: data.birthday || '',
          experience: data.experience || '',
          activity: data.activity || '',
          goal: data.goal || '',
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
        email: user.email,
        display_name: editableProfile.display_name || null,
        weight: editableProfile.weight ? parseInt(editableProfile.weight) : null,
        height: editableProfile.height ? parseInt(editableProfile.height) : null,
        birthday: editableProfile.birthday || null,
        experience: editableProfile.experience || null,
        activity: editableProfile.activity || null,
        goal: editableProfile.goal || null,
        body_fat_percentage: editableProfile.body_fat_percentage ? parseFloat(editableProfile.body_fat_percentage) : null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (error) throw error;

      setProfile({ ...profile, ...profileData });
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
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

  const getWeightDisplay = (weight) => {
    if (!weight) return 'Not set';
    if (preferences.weight_unit === 'kg') {
      return `${(weight * 0.453592).toFixed(1)} kg`;
    }
    return `${weight} lbs`;
  };

  const getHeightDisplay = (height) => {
    if (!height) return 'Not set';
    if (preferences.height_unit === 'cm') {
      return `${(height * 2.54).toFixed(0)} cm`;
    }
    const feet = Math.floor(height / 12);
    const inches = height % 12;
    return `${feet}'${inches}"`;
  };

  const getGoalDisplay = (goal) => {
    switch (goal) {
      case 'cut': return 'Cut';
      case 'bulk': return 'Bulk';
      case 'maintain': return 'Maintain';
      default: return goal ? goal.charAt(0).toUpperCase() + goal.slice(1) : 'Not set';
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

  const getActivityDescription = (activity) => {
    switch (activity) {
      case 'sedentary': return 'Little to no exercise';
      case 'lightly_active': return 'Light exercise 1-3 days/week';
      case 'moderately_active': return 'Moderate exercise 3-5 days/week';
      case 'very_active': return 'Hard exercise 6-7 days/week';
      case 'extremely_active': return 'Very hard exercise, physical job';
      default: return '';
    }
  };

  const achievements = [
    { icon: Trophy, title: "First Workout", description: "Completed your first workout", earned: false },
    { icon: Flame, title: "Week Warrior", description: "Complete 5 workouts in a week", earned: false },
    { icon: Zap, title: "Consistency King", description: "7-day workout streak", earned: false },
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
            <Button 
              variant="ghost" 
              onClick={() => navigate('/app')}
              className="text-white hover:text-orange-400 hover:bg-gray-800/50 transition-colors w-fit"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Dashboard
            </Button>
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
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6 text-center">
                <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mx-auto mb-2 sm:mb-3" />
                <div className="text-xl sm:text-2xl font-bold text-white mb-1">{progressStats.workouts}</div>
                <p className="text-gray-400 text-xs sm:text-sm">This Month</p>
                <h3 className="text-white font-medium text-sm sm:text-base">Workouts</h3>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6 text-center">
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 mx-auto mb-2 sm:mb-3" />
                <div className="text-xl sm:text-2xl font-bold text-white mb-1">{progressStats.goals}</div>
                <p className="text-gray-400 text-xs sm:text-sm">Active</p>
                <h3 className="text-white font-medium text-sm sm:text-base">Goals</h3>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6 text-center">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400 mx-auto mb-2 sm:mb-3" />
                <div className="text-xl sm:text-2xl font-bold text-white mb-1">{progressStats.streak}</div>
                <p className="text-gray-400 text-xs sm:text-sm">Days</p>
                <h3 className="text-white font-medium text-sm sm:text-base">Streak</h3>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6 text-center">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 mx-auto mb-2 sm:mb-3" />
                <div className="text-xl sm:text-2xl font-bold text-white mb-1">{progressStats.progress}%</div>
                <p className="text-gray-400 text-xs sm:text-sm">This Month</p>
                <h3 className="text-white font-medium text-sm sm:text-base">Progress</h3>
              </CardContent>
            </Card>
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
                      value={editableProfile.display_name}
                      onChange={(e) => setEditableProfile(prev => ({ ...prev, display_name: e.target.value }))}
                      placeholder="Enter display name"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Email</label>
                    <Input
                      value={user?.email}
                      disabled
                      className="bg-gray-800 border-gray-700 text-gray-400"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Weight ({preferences.weight_unit})</label>
                    <Input
                      type="number"
                      value={editableProfile.weight}
                      onChange={(e) => setEditableProfile(prev => ({ ...prev, weight: e.target.value }))}
                      placeholder={`Enter weight in ${preferences.weight_unit}`}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Height ({preferences.height_unit === 'ft-in' ? 'inches' : 'cm'})</label>
                    <Input
                      type="number"
                      value={editableProfile.height}
                      onChange={(e) => setEditableProfile(prev => ({ ...prev, height: e.target.value }))}
                      placeholder={`Height in ${preferences.height_unit === 'ft-in' ? 'inches' : 'cm'}`}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Birthday</label>
                    <Input
                      type="date"
                      value={editableProfile.birthday}
                      onChange={(e) => setEditableProfile(prev => ({ ...prev, birthday: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Body Fat % <span className="text-gray-400">(optional)</span></label>
                    <Input
                      type="number"
                      step="0.1"
                      value={editableProfile.body_fat_percentage}
                      onChange={(e) => setEditableProfile(prev => ({ ...prev, body_fat_percentage: e.target.value }))}
                      placeholder="Body fat %"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
                <Button 
                  onClick={saveProfile}
                  disabled={saving}
                  className="bg-orange-500 hover:bg-orange-600 text-white w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
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
                  <Select value={editableProfile.goal} onValueChange={(value) => setEditableProfile(prev => ({ ...prev, goal: value }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select your primary goal" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="cut">Cut</SelectItem>
                      <SelectItem value="bulk">Bulk</SelectItem>
                      <SelectItem value="maintain">Maintain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Experience Level</label>
                  <Select value={editableProfile.experience} onValueChange={(value) => setEditableProfile(prev => ({ ...prev, experience: value }))}>
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
                  <Select value={editableProfile.activity} onValueChange={(value) => setEditableProfile(prev => ({ ...prev, activity: value }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="sedentary">
                        <div>
                          <div>Sedentary</div>
                          <div className="text-xs text-gray-400">Little to no exercise</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="lightly_active">
                        <div>
                          <div>Lightly Active</div>
                          <div className="text-xs text-gray-400">Light exercise 1-3 days/week</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="moderately_active">
                        <div>
                          <div>Moderately Active</div>
                          <div className="text-xs text-gray-400">Moderate exercise 3-5 days/week</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="very_active">
                        <div>
                          <div>Very Active</div>
                          <div className="text-xs text-gray-400">Hard exercise 6-7 days/week</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="extremely_active">
                        <div>
                          <div>Extremely Active</div>
                          <div className="text-xs text-gray-400">Very hard exercise, physical job</div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {editableProfile.activity && (
                    <p className="text-xs text-gray-400 mt-1">{getActivityDescription(editableProfile.activity)}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Values Display */}
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-lg sm:text-xl">Current Values</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Age</p>
                  <p className="text-white">{profile?.birthday ? calculateAge(profile.birthday) : 'Not set'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Weight</p>
                  <p className="text-white">{profile?.weight ? getWeightDisplay(profile.weight) : 'Not set'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Height</p>
                  <p className="text-white">{profile?.height ? getHeightDisplay(profile.height) : 'Not set'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Goal</p>
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 mt-1">
                    {getGoalDisplay(profile?.goal)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

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
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-lg sm:text-xl flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-orange-400" />
                Progress Tracking
              </CardTitle>
              <CardDescription>
                Your fitness journey progress over time
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Start Tracking Progress</h3>
              <p className="text-gray-400 mb-6">Begin logging your workouts and measurements to see your progress here</p>
              <Button 
                onClick={() => navigate('/app')}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
              >
                Start Logging Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};

export default Profile;
