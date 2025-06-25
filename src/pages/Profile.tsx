
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/contexts/UserDataContext";
import { useSmartUserData } from "@/hooks/useSmartUserData";
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
  dedication: number;
  strength: number;
  recovery: number;
  consistency: number;
  totalWorkouts: number;
  daysActive: number;
  avgSleep: number;
  goalsAchieved: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userData } = useUserData();
  const { smartData, isLoading } = useSmartUserData();
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && !isLoading) {
      loadProfileStats();
    }
  }, [user, isLoading]);

  const loadProfileStats = async () => {
    if (!user) return;

    try {
      // Get workout sessions
      const { data: workoutSessions } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id);

      // Get recovery data
      const { data: recoveryData } = await supabase
        .from('recovery_data')
        .select('*')
        .eq('user_id', user.id);

      // Get habit completions
      const { data: habitCompletions } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id);

      // Calculate stats
      const totalWorkouts = workoutSessions?.length || 0;
      const daysActive = new Set(workoutSessions?.map(w => w.session_date)).size;
      const avgSleep = recoveryData?.length 
        ? recoveryData.reduce((sum, r) => sum + (r.sleep_hours || 0), 0) / recoveryData.length
        : 0;

      // Calculate percentiles and scores (simplified for demo)
      const strengthPercentile = Math.min(95, Math.max(5, totalWorkouts * 2 + (userData.experience === 'advanced' ? 30 : userData.experience === 'intermediate' ? 15 : 0)));
      const bodyFatPercentage = smartData?.bodyFatPercentage || userData.bodyFatPercentage || 15;

      // Calculate trait scores (0-100)
      const dedication = Math.min(100, (habitCompletions?.length || 0) * 5 + daysActive * 2);
      const strength = Math.min(100, strengthPercentile);
      const recovery = Math.min(100, avgSleep * 12 + (recoveryData?.length || 0) * 3);
      const consistency = Math.min(100, daysActive * 3);

      setProfileStats({
        strengthPercentile,
        bodyFatPercentage,
        dedication,
        strength,
        recovery,
        consistency,
        totalWorkouts,
        daysActive,
        avgSleep,
        goalsAchieved: Math.floor(totalWorkouts / 10)
      });
    } catch (error) {
      console.error('Error loading profile stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const radarData = profileStats ? [
    { trait: 'Dedication', value: profileStats.dedication },
    { trait: 'Strength', value: profileStats.strength },
    { trait: 'Recovery', value: profileStats.recovery },
    { trait: 'Consistency', value: profileStats.consistency },
  ] : [];

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

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <PremiumLoader variant="minimal" message="Loading your profile..." />
      </div>
    );
  }

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
              <h1 className="text-lg font-semibold">Your Profile</h1>
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
                  {profileStats.strengthPercentile}%
                </div>
                <p className="text-gray-400 text-sm">Strength Percentile</p>
                <Badge className="mt-2 bg-orange-500/20 text-orange-400 border-orange-500/30">
                  <Award className="w-3 h-3 mr-1" />
                  Top {100 - profileStats.strengthPercentile}%
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

          {/* Radar Chart */}
          <AnimatedCard delay={200} className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-center text-white">Performance Profile</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid gridType="polygon" stroke="#374151" />
                    <PolarAngleAxis 
                      dataKey="trait" 
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
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
                You're in the top {100 - profileStats.strengthPercentile}% of users. Your consistency is paying off!
              </p>
            </CardContent>
          </AnimatedCard>
        </div>
      </div>
    </PageTransition>
  );
};

export default Profile;
