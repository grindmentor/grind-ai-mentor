
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, User, Activity, Target, Calendar, Award, Flame, Trophy, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageTransition } from '@/components/ui/page-transition';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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

      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
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

  const getGoalDisplay = (goal) => {
    switch (goal) {
      case 'weight_loss': return 'Cut';
      case 'muscle_gain': return 'Bulk';
      case 'general_fitness': return 'Maintenance';
      case 'body_recomposition': return 'Recomp';
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

          {/* Profile Information */}
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
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Display Name</p>
                    <p className="text-white">{profile?.display_name || 'Not set'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Age</p>
                    <p className="text-white">
                      {profile?.birthday ? calculateAge(profile.birthday) : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Weight</p>
                    <p className="text-white">{profile?.weight ? `${profile.weight} lbs` : 'Not set'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Height</p>
                    <p className="text-white">{profile?.height ? `${profile.height}"` : 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Body Fat</p>
                    <p className="text-white">{profile?.body_fat_percentage ? `${profile.body_fat_percentage}%` : 'Not set'}</p>
                  </div>
                </div>
                <div className="pt-2">
                  <Link to="/settings">
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                      Edit Profile
                    </Button>
                  </Link>
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
                  <p className="text-gray-400 text-sm">Primary Goal</p>
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 mt-1">
                    {getGoalDisplay(profile?.goal)}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Experience Level</p>
                  <p className="text-white">{getExperienceDisplay(profile?.experience)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Activity Level</p>
                  <p className="text-white">{getActivityDisplay(profile?.activity)}</p>
                </div>
                <div className="pt-2">
                  <Link to="/settings">
                    <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800/50">
                      Update Fitness Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

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

          {/* Progress Chart Placeholder */}
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
              <Link to="/app">
                <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white">
                  Start Logging Data
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};

export default Profile;
