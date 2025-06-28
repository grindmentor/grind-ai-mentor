
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Calendar, 
  Trophy, 
  Target, 
  Activity, 
  Zap,
  Award,
  Star,
  Flame
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProgressData {
  workoutStreak: number;
  totalWorkouts: number;
  weightLifted: number;
  exercisesCompleted: number;
  consistencyScore: number;
  strengthGains: number;
  enduranceGains: number;
  recoveryScore: number;
}

interface ProgressLevel {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  icon: React.ComponentType<any>;
}

const progressLevels: ProgressLevel[] = [
  { level: 1, title: "Beginner", minPoints: 0, maxPoints: 99, color: "bg-gray-500", icon: Target },
  { level: 2, title: "Novice", minPoints: 100, maxPoints: 299, color: "bg-blue-500", icon: Activity },
  { level: 3, title: "Intermediate", minPoints: 300, maxPoints: 699, color: "bg-green-500", icon: Zap },
  { level: 4, title: "Advanced", minPoints: 700, maxPoints: 1499, color: "bg-purple-500", icon: Award },
  { level: 5, title: "Expert", minPoints: 1500, maxPoints: 2999, color: "bg-orange-500", icon: Star },
  { level: 6, title: "Master", minPoints: 3000, maxPoints: 5999, color: "bg-red-500", icon: Trophy },
  { level: 7, title: "Legend", minPoints: 6000, maxPoints: 99999, color: "bg-gradient-to-r from-yellow-400 to-orange-500", icon: Flame }
];

const ProgressHub: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<ProgressData>({
    workoutStreak: 0,
    totalWorkouts: 0,
    weightLifted: 0,
    exercisesCompleted: 0,
    consistencyScore: 0,
    strengthGains: 0,
    enduranceGains: 0,
    recoveryScore: 0
  });

  useEffect(() => {
    if (user) {
      loadProgressData();
    }
  }, [user]);

  const loadProgressData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load workout sessions for comprehensive analysis
      const { data: workoutSessions, error: workoutError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('session_date', { ascending: false })
        .limit(100);

      if (workoutError) throw workoutError;

      // Load recovery data
      const { data: recoveryData, error: recoveryError } = await supabase
        .from('recovery_data')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_date', { ascending: false })
        .limit(30);

      if (recoveryError) throw recoveryError;

      // Calculate advanced metrics
      const calculatedData = calculateAdvancedProgress(workoutSessions || [], recoveryData || []);
      setProgressData(calculatedData);

    } catch (error) {
      console.error('Error loading progress data:', error);
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAdvancedProgress = (workouts: any[], recovery: any[]): ProgressData => {
    const totalWorkouts = workouts.length;
    
    // Calculate workout streak (much harder to maintain)
    let workoutStreak = 0;
    const today = new Date();
    const workoutDates = workouts.map(w => new Date(w.session_date)).sort((a, b) => b.getTime() - a.getTime());
    
    for (let i = 0; i < workoutDates.length; i++) {
      const daysDiff = Math.floor((today.getTime() - workoutDates[i].getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff <= i + 1) { // Must workout almost every day for streak
        workoutStreak++;
      } else {
        break;
      }
    }

    // Calculate total weight lifted with diminishing returns
    const weightLifted = workouts.reduce((total, workout) => {
      if (workout.exercises_data) {
        const sessionWeight = workout.exercises_data.reduce((sessionTotal: number, exercise: any) => {
          return sessionTotal + (exercise.sets || []).reduce((setTotal: number, set: any) => {
            return setTotal + (set.weight || 0) * (set.reps || 0);
          }, 0);
        }, 0);
        return total + sessionWeight;
      }
      return total;
    }, 0);

    // Count unique exercises (bonus for variety)
    const uniqueExercises = new Set();
    workouts.forEach(workout => {
      if (workout.exercises_data) {
        workout.exercises_data.forEach((exercise: any) => {
          uniqueExercises.add(exercise.exercise_name);
        });
      }
    });

    // Calculate consistency score (very strict)
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const recentWorkouts = workouts.filter(w => new Date(w.session_date) >= last30Days);
    const consistencyScore = Math.min((recentWorkouts.length / 20) * 100, 100); // Need 20 workouts in 30 days for 100%

    // Calculate strength gains (progressive overload tracking)
    const strengthGains = calculateStrengthGains(workouts);
    
    // Calculate endurance gains (volume progression)
    const enduranceGains = calculateEnduranceGains(workouts);

    // Calculate recovery score from recovery data
    const recoveryScore = calculateRecoveryScore(recovery);

    return {
      workoutStreak: Math.min(workoutStreak, 365), // Cap at 1 year
      totalWorkouts,
      weightLifted: Math.round(weightLifted),
      exercisesCompleted: uniqueExercises.size,
      consistencyScore: Math.round(consistencyScore),
      strengthGains: Math.round(strengthGains),
      enduranceGains: Math.round(enduranceGains),
      recoveryScore: Math.round(recoveryScore)
    };
  };

  const calculateStrengthGains = (workouts: any[]): number => {
    // Track progression over time - very strict requirements
    const exerciseProgress: { [key: string]: number[] } = {};
    
    workouts.reverse().forEach(workout => {
      if (!workout.exercises_data) return;
      
      workout.exercises_data.forEach((exercise: any) => {
        const exerciseName = exercise.exercise_name;
        if (!exerciseProgress[exerciseName]) {
          exerciseProgress[exerciseName] = [];
        }
        
        const maxWeight = Math.max(...(exercise.sets || []).map((set: any) => set.weight || 0));
        if (maxWeight > 0) {
          exerciseProgress[exerciseName].push(maxWeight);
        }
      });
    });

    let totalGainScore = 0;
    let exerciseCount = 0;

    Object.values(exerciseProgress).forEach(weights => {
      if (weights.length >= 3) { // Need at least 3 sessions
        const firstWeight = weights[0];
        const lastWeight = weights[weights.length - 1];
        const improvement = ((lastWeight - firstWeight) / firstWeight) * 100;
        totalGainScore += Math.min(improvement, 50); // Cap individual exercise gains
        exerciseCount++;
      }
    });

    return exerciseCount > 0 ? Math.min(totalGainScore / exerciseCount, 100) : 0;
  };

  const calculateEnduranceGains = (workouts: any[]): number => {
    if (workouts.length < 5) return 0;

    const first5Workouts = workouts.slice(-5);
    const last5Workouts = workouts.slice(0, 5);

    const calculateVolume = (workoutSet: any[]) => {
      return workoutSet.reduce((total, workout) => {
        if (!workout.exercises_data) return total;
        return total + workout.exercises_data.reduce((sessionTotal: number, exercise: any) => {
          return sessionTotal + (exercise.sets || []).reduce((setTotal: number, set: any) => {
            return setTotal + (set.reps || 0);
          }, 0);
        }, 0);
      }, 0);
    };

    const firstVolume = calculateVolume(first5Workouts);
    const lastVolume = calculateVolume(last5Workouts);

    if (firstVolume === 0) return 0;
    return Math.min(((lastVolume - firstVolume) / firstVolume) * 100, 100);
  };

  const calculateRecoveryScore = (recovery: any[]): number => {
    if (recovery.length === 0) return 0;

    const avgSleep = recovery.reduce((sum, r) => sum + (r.sleep_hours || 0), 0) / recovery.length;
    const avgStress = recovery.reduce((sum, r) => sum + (r.stress_level || 5), 0) / recovery.length;
    const avgEnergy = recovery.reduce((sum, r) => sum + (r.energy_level || 5), 0) / recovery.length;

    // Very strict recovery scoring
    const sleepScore = Math.min((avgSleep / 8) * 35, 35); // Need 8+ hours for full points
    const stressScore = Math.max(0, 35 - (avgStress - 1) * 7); // Lower stress = higher score
    const energyScore = ((avgEnergy - 1) / 9) * 30; // Energy scale 1-10

    return Math.min(sleepScore + stressScore + energyScore, 100);
  };

  // Calculate total progress points with exponential difficulty
  const calculateTotalPoints = (): number => {
    const weights = {
      workoutStreak: progressData.workoutStreak * 5, // 5 points per day streak
      totalWorkouts: progressData.totalWorkouts * 3, // 3 points per workout
      weightLifted: Math.floor(progressData.weightLifted / 1000) * 2, // 2 points per 1000 lbs
      exercisesCompleted: progressData.exercisesCompleted * 10, // 10 points per unique exercise
      consistencyScore: Math.floor(progressData.consistencyScore / 10) * 15, // 15 points per 10% consistency
      strengthGains: Math.floor(progressData.strengthGains / 10) * 20, // 20 points per 10% strength gain
      enduranceGains: Math.floor(progressData.enduranceGains / 10) * 15, // 15 points per 10% endurance gain
      recoveryScore: Math.floor(progressData.recoveryScore / 10) * 10 // 10 points per 10% recovery score
    };

    return Object.values(weights).reduce((sum, points) => sum + points, 0);
  };

  const totalPoints = calculateTotalPoints();
  const currentLevel = progressLevels.find(level => 
    totalPoints >= level.minPoints && totalPoints <= level.maxPoints
  ) || progressLevels[0];

  const progressToNextLevel = currentLevel.level < progressLevels.length 
    ? ((totalPoints - currentLevel.minPoints) / (currentLevel.maxPoints - currentLevel.minPoints)) * 100
    : 100;

  if (loading) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="h-32 bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Level Progress Card */}
      <Card className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-xl ${currentLevel.color} flex items-center justify-center`}>
                <currentLevel.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-xl">Level {currentLevel.level}: {currentLevel.title}</CardTitle>
                <p className="text-gray-400">{totalPoints.toLocaleString()} Total Points</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-orange-400 border-orange-400/30">
              {Math.round(progressToNextLevel)}% to next level
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progressToNextLevel} className="h-3" />
          {currentLevel.level < progressLevels.length && (
            <p className="text-sm text-gray-400 mt-2">
              {(progressLevels[currentLevel.level].minPoints - totalPoints).toLocaleString()} points to {progressLevels[currentLevel.level].title}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Detailed Stats */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="consistency">Consistency</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 text-center">
                <Calendar className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{progressData.workoutStreak}</div>
                <div className="text-sm text-gray-400">Day Streak</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 text-center">
                <Trophy className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{progressData.totalWorkouts}</div>
                <div className="text-sm text-gray-400">Total Workouts</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 text-center">
                <Activity className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{progressData.exercisesCompleted}</div>
                <div className="text-sm text-gray-400">Exercises</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{(progressData.weightLifted / 1000).toFixed(1)}k</div>
                <div className="text-sm text-gray-400">lbs Lifted</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                  Strength Gains
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{progressData.strengthGains}%</span>
                  </div>
                  <Progress value={progressData.strengthGains} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-400" />
                  Endurance Gains
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{progressData.enduranceGains}%</span>
                  </div>
                  <Progress value={progressData.enduranceGains} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="consistency" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-400" />
                  Consistency Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Last 30 Days</span>
                    <span className="text-white">{progressData.consistencyScore}%</span>
                  </div>
                  <Progress value={progressData.consistencyScore} className="h-2" />
                  <p className="text-xs text-gray-500">Need 20 workouts/month for 100%</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Award className="w-5 h-5 mr-2 text-purple-400" />
                  Recovery Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Overall</span>
                    <span className="text-white">{progressData.recoveryScore}%</span>
                  </div>
                  <Progress value={progressData.recoveryScore} className="h-2" />
                  <p className="text-xs text-gray-500">Sleep, stress, and energy levels</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center">
        <Button 
          onClick={loadProgressData}
          variant="outline"
          className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
        >
          Refresh Progress
        </Button>
      </div>
    </div>
  );
};

export default ProgressHub;
