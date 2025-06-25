
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Target, Activity, Calendar, Award, Zap } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import PremiumLoader from "@/components/PremiumLoader";
import { PageTransition } from "@/components/ui/page-transition";
import { AnimatedCard } from "@/components/ui/animated-card";

interface ProfileStats {
  strengthPercentile: number;
  bodyFatPercentage: number;
  strength: number; // Weight lifted performance
  endurance: number; // Cardio and stamina
  consistency: number; // Workout frequency
  recovery: number; // Sleep and recovery metrics
  nutrition: number; // Food logging and diet adherence
  aesthetics: number; // Body composition and visual progress
  dedication: number; // Overall commitment score
  totalWorkouts: number;
  daysActive: number;
  avgSleep: number;
  goalsAchieved: number;
}

interface UserProfile {
  weight: number | null;
  height: number | null;
  age: number | null;
  experience: string | null;
  activity: string | null;
  goal: string | null;
  body_fat_percentage: number | null;
  birthday: string | null;
  display_name: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    } else {
      setLoading(false);
      setError("User not authenticated");
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log('Loading profile for user:', user.id);
      
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.warn('Error fetching profile:', profileError);
      }

      let userProfileData: UserProfile = {
        weight: null,
        height: null,
        age: null,
        experience: null,
        activity: null,
        goal: null,
        body_fat_percentage: null,
        birthday: null,
        display_name: null
      };

      if (profile) {
        // Calculate age from birthday
        let age = null;
        if (profile.birthday) {
          const today = new Date();
          const birthDate = new Date(profile.birthday);
          age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
        }

        userProfileData = {
          weight: profile.weight || null,
          height: profile.height || null,
          age,
          experience: profile.experience || null,
          activity: profile.activity || null,
          goal: profile.goal || null,
          body_fat_percentage: profile.body_fat_percentage || null,
          birthday: profile.birthday || null,
          display_name: profile.display_name || null
        };
      }

      setUserProfile(userProfileData);
      await loadProfileStats(userProfileData);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setError('Failed to load profile data');
      setLoading(false);
    }
  };

  const loadProfileStats = async (userData: UserProfile) => {
    if (!user) return;

    try {
      // Get workout sessions with error handling
      const { data: workoutSessions, error: workoutError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id);

      if (workoutError) {
        console.warn('Error fetching workout sessions:', workoutError);
      }

      // Get recovery data with error handling
      const { data: recoveryData, error: recoveryError } = await supabase
        .from('recovery_data')
        .select('*')
        .eq('user_id', user.id);

      if (recoveryError) {
        console.warn('Error fetching recovery data:', recoveryError);
      }

      // Get habit completions with error handling
      const { data: habitCompletions, error: habitError } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id);

      if (habitError) {
        console.warn('Error fetching habit completions:', habitError);
      }

      // Get progressive overload data for strength metrics
      const { data: strengthData, error: strengthError } = await supabase
        .from('progressive_overload_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (strengthError) {
        console.warn('Error fetching strength data:', strengthError);
      }

      // Get food log entries for nutrition score
      const { data: foodLogData, error: foodLogError } = await supabase
        .from('food_log_entries')
        .select('*')
        .eq('user_id', user.id);

      if (foodLogError) {
        console.warn('Error fetching food log data:', foodLogError);
      }

      // Get progress photos for aesthetics score
      const { data: progressPhotos, error: photoError } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', user.id);

      if (photoError) {
        console.warn('Error fetching progress photos:', photoError);
      }

      // Get TDEE data
      const { data: tdeeData, error: tdeeError } = await supabase
        .from('tdee_calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (tdeeError) {
        console.warn('Error fetching TDEE data:', tdeeError);
      }

      console.log('Data loaded:', { 
        workouts: workoutSessions?.length || 0, 
        recovery: recoveryData?.length || 0, 
        habits: habitCompletions?.length || 0,
        strength: strengthData?.length || 0,
        foodLog: foodLogData?.length || 0,
        photos: progressPhotos?.length || 0,
        tdee: tdeeData ? 'available' : 'none'
      });

      // Calculate comprehensive stats with safe defaults
      const totalWorkouts = workoutSessions?.length || 0;
      const daysActive = workoutSessions?.length ? new Set(workoutSessions.map(w => w.session_date)).size : 0;
      const avgSleep = recoveryData?.length 
        ? recoveryData.reduce((sum, r) => sum + (r.sleep_hours || 0), 0) / recoveryData.length
        : 7.5; // Default average sleep

      // Calculate advanced fitness metrics
      const experienceBonus = userData?.experience === 'advanced' ? 30 : userData?.experience === 'intermediate' ? 15 : 0;
      const strengthPercentile = Math.min(95, Math.max(5, totalWorkouts * 2 + experienceBonus));
      
      // Body fat percentage for aesthetics calculation
      const bodyFatPercentage = userData?.body_fat_percentage || 15;

      // Calculate comprehensive trait scores (0-100)
      
      // Strength: Based on progressive overload entries and weight progression
      const strengthScore = Math.min(100, 
        (strengthData?.length || 0) * 3 + 
        experienceBonus + 
        Math.min(30, totalWorkouts)
      );

      // Endurance: Based on cardio sessions and workout duration
      const cardioWorkouts = workoutSessions?.filter(w => 
        w.workout_type?.toLowerCase().includes('cardio') || 
        w.workout_name?.toLowerCase().includes('cardio') ||
        w.workout_name?.toLowerCase().includes('run') ||
        w.workout_name?.toLowerCase().includes('bike')
      )?.length || 0;
      const enduranceScore = Math.min(100, cardioWorkouts * 8 + totalWorkouts * 2);

      // Consistency: Workout frequency and habit completion
      const consistencyScore = Math.min(100, daysActive * 3 + (habitCompletions?.length || 0) * 2);

      // Recovery: Sleep quality and recovery data tracking
      const recoveryScore = Math.min(100, 
        avgSleep * 12 + 
        (recoveryData?.length || 0) * 4 +
        (recoveryData?.filter(r => (r.sleep_quality || 0) >= 4)?.length || 0) * 3
      );

      // Nutrition: Food logging consistency and quality
      const nutritionScore = Math.min(100, 
        (foodLogData?.length || 0) * 2 + 
        (foodLogData?.filter(f => f.protein && f.protein > 0)?.length || 0) * 3
      );

      // Aesthetics: Body composition progress and photo tracking
      const aestheticsScore = Math.min(100,
        (progressPhotos?.length || 0) * 10 +
        (bodyFatPercentage <= 15 ? 40 : bodyFatPercentage <= 20 ? 25 : 10) +
        (userData?.goal === 'lose_weight' && totalWorkouts > 10 ? 20 : 0) +
        (userData?.goal === 'build_muscle' && strengthScore > 50 ? 20 : 0)
      );

      // Overall dedication: Combined engagement score
      const dedicationScore = Math.min(100, 
        (habitCompletions?.length || 0) * 4 + 
        daysActive * 2 + 
        (totalWorkouts > 20 ? 30 : totalWorkouts) +
        (foodLogData && foodLogData.length > 50 ? 20 : (foodLogData?.length || 0) / 3)
      );

      const stats = {
        strengthPercentile,
        bodyFatPercentage,
        strength: strengthScore,
        endurance: enduranceScore,
        consistency: consistencyScore,
        recovery: recoveryScore,
        nutrition: nutritionScore,
        aesthetics: aestheticsScore,
        dedication: dedicationScore,
        totalWorkouts,
        daysActive,
        avgSleep,
        goalsAchieved: Math.floor(totalWorkouts / 10) + Math.floor((foodLogData?.length || 0) / 30)
      };

      console.log('Calculated comprehensive stats:', stats);
      setProfileStats(stats);
    } catch (error) {
      console.error('Error loading profile stats:', error);
      setError('Failed to load profile statistics');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <PremiumLoader variant="minimal" message="Loading your profile..." />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-black text-white p-4">
          <div className="max-w-md mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate('/app')}
              className="mb-6 text-white hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-8 text-center">
                <p className="text-red-400 mb-4">Error: {error}</p>
                <Button 
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    loadUserProfile();
                  }}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Show no data state
  if (!profileStats) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-black text-white p-4">
          <div className="max-w-md mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate('/app')}
              className="mb-6 text-white hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-8 text-center">
                <p className="text-gray-400 mb-4">No profile data available yet.</p>
                <p className="text-sm text-gray-500">Start using the app to build your profile!</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Prepare enhanced radar chart data with 7 key fitness variables
  const radarData = [
    { trait: 'Strength', value: Math.max(0, Math.min(100, profileStats.strength || 0)) },
    { trait: 'Endurance', value: Math.max(0, Math.min(100, profileStats.endurance || 0)) },
    { trait: 'Consistency', value: Math.max(0, Math.min(100, profileStats.consistency || 0)) },
    { trait: 'Recovery', value: Math.max(0, Math.min(100, profileStats.recovery || 0)) },
    { trait: 'Nutrition', value: Math.max(0, Math.min(100, profileStats.nutrition || 0)) },
    { trait: 'Aesthetics', value: Math.max(0, Math.min(100, profileStats.aesthetics || 0)) },
    { trait: 'Dedication', value: Math.max(0, Math.min(100, profileStats.dedication || 0)) },
  ];

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 90) return 'from-yellow-400 to-orange-500';
    if (percentile >= 75) return 'from-green-400 to-emerald-500';
    if (percentile >= 50) return 'from-blue-400 to-cyan-500';
    return 'from-gray-400 to-gray-500';
  };

  const getBodyFatCategory = (bf: number) => {
    if (bf < 10) return { category: 'Elite Athlete', color: 'text-yellow-400' };
    if (bf < 15) return { category: 'Athletic', color: 'text-green-400' };
    if (bf < 20) return { category: 'Fit', color: 'text-blue-400' };
    if (bf < 25) return { category: 'Average', color: 'text-orange-400' };
    return { category: 'Above Average', color: 'text-red-400' };
  };

  const bodyFatInfo = getBodyFatCategory(profileStats.bodyFatPercentage);

  return (
    <PageTransition>
      <div className="min-h-screen bg-black text-white pb-20">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-gray-800">
          <div className="max-w-md mx-auto p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => navigate('/app')}
                className="text-white hover:bg-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-lg font-semibold">Progress Hub</h1>
              <div className="w-16"></div>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto p-4 space-y-6">
          {/* Hero Stats */}
          <div className="grid grid-cols-2 gap-4">
            <AnimatedCard className="bg-gradient-to-br from-gray-900 to-black border border-gray-800">
              <CardContent className="p-6 text-center">
                <div className={`text-3xl font-bold bg-gradient-to-r ${getPercentileColor(profileStats.strengthPercentile)} bg-clip-text text-transparent mb-2`}>
                  {Math.round(profileStats.strengthPercentile)}%
                </div>
                <p className="text-gray-400 text-sm">Strength Percentile</p>
                <Badge className="mt-2 bg-orange-500/20 text-orange-400 border-orange-500/30">
                  <Award className="w-3 h-3 mr-1" />
                  Top {100 - Math.round(profileStats.strengthPercentile)}%
                </Badge>
              </CardContent>
            </AnimatedCard>

            <AnimatedCard delay={100} className="bg-gradient-to-br from-gray-900 to-black border border-gray-800">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {profileStats.bodyFatPercentage.toFixed(1)}%
                </div>
                <p className="text-gray-400 text-sm">Body Fat</p>
                <Badge className={`mt-2 ${bodyFatInfo.color}`}>
                  {bodyFatInfo.category}
                </Badge>
              </CardContent>
            </AnimatedCard>
          </div>

          {/* Enhanced Radar Chart with 7 Variables */}
          <AnimatedCard delay={200} className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-center text-white">Fitness Profile</CardTitle>
              <p className="text-center text-sm text-gray-400">Complete athletic performance overview</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid gridType="polygon" stroke="#374151" />
                    <PolarAngleAxis 
                      dataKey="trait" 
                      tick={{ fill: '#9CA3AF', fontSize: 11 }}
                      className="text-xs"
                    />
                    <PolarRadiusAxis 
                      domain={[0, 100]} 
                      tick={false}
                      axisLine={false}
                    />
                    <Radar
                      name="Performance"
                      dataKey="value"
                      stroke="#F97316"
                      fill="#F97316"
                      fillOpacity={0.2}
                      strokeWidth={2}
                      dot={{ fill: '#F97316', strokeWidth: 2, r: 4 }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </AnimatedCard>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <AnimatedCard delay={300} className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="w-5 h-5 text-blue-400 mr-2" />
                  <span className="text-2xl font-bold text-white">{profileStats.totalWorkouts}</span>
                </div>
                <p className="text-gray-400 text-sm">Total Workouts</p>
              </CardContent>
            </AnimatedCard>

            <AnimatedCard delay={350} className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="w-5 h-5 text-green-400 mr-2" />
                  <span className="text-2xl font-bold text-white">{profileStats.daysActive}</span>
                </div>
                <p className="text-gray-400 text-sm">Active Days</p>
              </CardContent>
            </AnimatedCard>

            <AnimatedCard delay={400} className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-400 mr-2" />
                  <span className="text-2xl font-bold text-white">{profileStats.avgSleep.toFixed(1)}h</span>
                </div>
                <p className="text-gray-400 text-sm">Avg Sleep</p>
              </CardContent>
            </AnimatedCard>

            <AnimatedCard delay={450} className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="w-5 h-5 text-yellow-400 mr-2" />
                  <span className="text-2xl font-bold text-white">{profileStats.goalsAchieved}</span>
                </div>
                <p className="text-gray-400 text-sm">Goals Achieved</p>
              </CardContent>
            </AnimatedCard>
          </div>

          {/* Motivational Section */}
          <AnimatedCard delay={500} className="bg-gradient-to-r from-orange-500/10 to-red-600/10 border-orange-500/20">
            <CardContent className="p-6 text-center">
              <Zap className="w-8 h-8 text-orange-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Keep Crushing It!</h3>
              <p className="text-gray-300 text-sm">
                You're in the top {100 - Math.round(profileStats.strengthPercentile)}% of users. Your consistency is paying off!
              </p>
            </CardContent>
          </AnimatedCard>
        </div>
      </div>
    </PageTransition>
  );
};

export default Profile;
