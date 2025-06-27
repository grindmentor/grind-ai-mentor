
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileModuleWrapper } from '@/components/ui/mobile-module-wrapper';
import { Search, Filter, Plus, Zap, Heart, Target, Dumbbell, Timer, Star, Flame, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { workoutTemplates } from '@/data/workoutTemplates';
import { WorkoutSession } from '@/hooks/useWorkoutData';
import { ExerciseDetailModal } from '@/components/ai-modules/ExerciseDetailModal';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
  primary_muscles: string[];
  equipment: string;
  difficulty_level: string;
}

interface WorkoutTemplate {
  id: string;
  title: string;
  category: 'Split Programs' | 'Single Workouts' | 'Cardio';
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  focus: string[];
  exercises: Exercise[];
  color: string;
}

interface BlueprintAIProps {
  onBack: () => void;
}

const BlueprintAI: React.FC<BlueprintAIProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [workouts, setWorkouts] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    loadUserProfile();
    loadWorkouts();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadWorkouts = async () => {
    setLoading(true);
    try {
      // Load workout templates from our curated collection
      setWorkouts(workoutTemplates);
    } catch (error) {
      console.error('Error loading workouts:', error);
      toast({
        title: 'Error loading workouts',
        description: 'Failed to load workout templates.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addToWorkoutLog = async (workout: WorkoutTemplate) => {
    if (!user) return;

    try {
      const workoutSession: Omit<WorkoutSession, 'user_id'> = {
        workout_name: workout.title,
        start_time: new Date().toISOString(),
        session_date: new Date().toISOString().split('T')[0],
        exercises_data: workout.exercises.map(exercise => ({
          id: exercise.id,
          exercise_name: exercise.name,
          sets: Array.from({ length: exercise.sets }, (_, i) => ({
            id: `${exercise.id}-set-${i + 1}`,
            reps: parseInt(exercise.reps.split('-')[0]) || 10,
            weight: 0
          })),
          notes: exercise.notes || ''
        })),
        duration_minutes: parseInt(workout.duration.split(' ')[0]) || 60,
        notes: `Added from Blueprint AI - ${workout.description}`
      };

      const { error } = await supabase
        .from('workout_sessions')
        .insert([{ ...workoutSession, user_id: user.id }]);

      if (error) throw error;

      toast({
        title: 'Workout Added! 🎯',
        description: `${workout.title} has been added to your workout log.`,
      });
    } catch (error) {
      console.error('Error adding workout to log:', error);
      toast({
        title: 'Error',
        description: 'Failed to add workout to your log.',
        variant: 'destructive'
      });
    }
  };

  const getPersonalizedRecommendations = () => {
    if (!userProfile) return workouts.slice(0, 3);

    const userGoal = userProfile.goal;
    const userExperience = userProfile.experience;

    return workouts
      .filter(workout => {
        if (userGoal === 'lose_weight') return workout.category === 'Cardio' || workout.focus.includes('Fat Loss');
        if (userGoal === 'build_muscle') return workout.focus.includes('Hypertrophy');
        if (userGoal === 'improve_strength') return workout.focus.includes('Strength');
        return true;
      })
      .filter(workout => {
        if (userExperience === 'beginner') return workout.difficulty === 'Beginner';
        if (userExperience === 'intermediate') return workout.difficulty !== 'Advanced';
        return true;
      })
      .slice(0, 3);
  };

  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workout.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workout.focus.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || workout.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || workout.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Split Programs': return <Dumbbell className="w-4 h-4" />;
      case 'Single Workouts': return <Target className="w-4 h-4" />;
      case 'Cardio': return <Heart className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
      case 'Intermediate': return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
      case 'Advanced': return 'bg-rose-500/20 text-rose-300 border-rose-400/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-400/30';
    }
  };

  if (loading) {
    return (
      <MobileModuleWrapper title="Blueprint AI" onBack={onBack}>
        <div className="min-h-screen bg-gradient-to-br from-black via-blue-950/50 to-blue-900/30">
          <div className="p-6 space-y-6">
            <div className="animate-pulse space-y-6">
              <div className="h-16 bg-blue-500/10 rounded-2xl border border-blue-500/20"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-blue-500/10 rounded-2xl border border-blue-500/20"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </MobileModuleWrapper>
    );
  }

  const personalizedWorkouts = getPersonalizedRecommendations();

  return (
    <MobileModuleWrapper title="Blueprint AI" onBack={onBack}>
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-950/50 to-blue-900/30">
        <div className="p-4 sm:p-6 space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-8">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">AI-Powered Workout Blueprints</h1>
            <p className="text-blue-200/80 max-w-md mx-auto">
              Scientifically crafted workout plans tailored to your fitness goals
            </p>
          </div>

          {/* AI Recommendations */}
          {personalizedWorkouts.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Recommended for You</h2>
                  <p className="text-blue-200/70 text-sm">Based on your fitness profile</p>
                </div>
              </div>
              
              <div className="grid gap-4">
                {personalizedWorkouts.map((workout) => (
                  <Card 
                    key={`rec-${workout.id}`}
                    className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/5 backdrop-blur-sm border-blue-400/20 hover:border-blue-400/40 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-400/30">
                            {getCategoryIcon(workout.category)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-lg">{workout.title}</h3>
                            <div className="flex items-center space-x-3 text-sm text-blue-200/70 mt-1">
                              <span className="flex items-center">
                                <Timer className="w-3 h-3 mr-1" />
                                {workout.duration}
                              </span>
                              <span>{workout.exercises.length} exercises</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={getDifficultyColor(workout.difficulty)}>
                          {workout.difficulty}
                        </Badge>
                      </div>
                      
                      <p className="text-blue-100/80 text-sm mb-4 leading-relaxed">{workout.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {workout.focus.slice(0, 3).map((focus, index) => (
                          <Badge 
                            key={index}
                            variant="outline" 
                            className="border-blue-400/20 text-blue-300 bg-blue-500/5 text-xs"
                          >
                            {focus}
                          </Badge>
                        ))}
                      </div>

                      <Button
                        onClick={() => addToWorkoutLog(workout)}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 font-medium"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Workout Log
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Flame className="w-5 h-5 mr-2 text-blue-400" />
              Explore All Blueprints
            </h2>
            
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300/70 w-5 h-5" />
                <Input
                  placeholder="Search workouts, exercises, or goals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 bg-blue-950/30 border-blue-400/30 text-white placeholder:text-blue-200/50 h-14 text-base rounded-2xl focus:border-blue-400/60 transition-all"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-blue-950/30 border-blue-400/30 text-white h-12 rounded-xl">
                    <Filter className="w-4 h-4 mr-2 text-blue-300" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-blue-950/95 border-blue-400/30">
                    <SelectItem value="All">All Categories</SelectItem>
                    <SelectItem value="Split Programs">Split Programs</SelectItem>
                    <SelectItem value="Single Workouts">Single Workouts</SelectItem>
                    <SelectItem value="Cardio">Cardio</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="bg-blue-950/30 border-blue-400/30 text-white h-12 rounded-xl">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent className="bg-blue-950/95 border-blue-400/30">
                    <SelectItem value="All">All Levels</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Workout Templates Grid */}
          <div className="space-y-4">
            {filteredWorkouts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-400/20">
                  <Target className="w-10 h-10 text-blue-400/50" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No blueprints found</h3>
                <p className="text-blue-200/60">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredWorkouts.map((workout) => (
                  <Card 
                    key={workout.id}
                    className="group bg-gradient-to-br from-blue-900/20 to-slate-900/30 backdrop-blur-sm border-blue-400/20 hover:border-blue-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-400/30">
                            {getCategoryIcon(workout.category)}
                          </div>
                          <CardTitle className="text-white text-lg">{workout.title}</CardTitle>
                        </div>
                        <Badge className={getDifficultyColor(workout.difficulty)}>
                          {workout.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-blue-100/70 text-sm leading-relaxed">{workout.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {workout.focus.map((focus, index) => (
                          <Badge 
                            key={index}
                            variant="outline" 
                            className="border-blue-400/20 text-blue-300 bg-blue-500/5 text-xs"
                          >
                            {focus}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm text-blue-200/60 py-2">
                        <span className="flex items-center">
                          <Timer className="w-3 h-3 mr-1" />
                          {workout.duration}
                        </span>
                        <span>{workout.exercises.length} exercises</span>
                      </div>
                      
                      <div className="space-y-2">
                        {workout.exercises.slice(0, 2).map((exercise, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedExercise(exercise)}
                            className="w-full text-left p-3 bg-blue-500/5 rounded-lg text-sm text-blue-100/80 hover:bg-blue-500/10 transition-colors border border-blue-500/10 hover:border-blue-500/20"
                          >
                            <span className="font-medium">{exercise.name}</span>
                            <span className="text-blue-200/60 ml-2">• {exercise.sets} sets × {exercise.reps}</span>
                          </button>
                        ))}
                        {workout.exercises.length > 2 && (
                          <p className="text-xs text-blue-200/50 px-3">
                            +{workout.exercises.length - 2} more exercises
                          </p>
                        )}
                      </div>

                      <Button
                        onClick={() => addToWorkoutLog(workout)}
                        className="w-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 text-white border border-blue-400/20 hover:border-blue-400/40 font-medium transition-all"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Workout Log
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </MobileModuleWrapper>
  );
};

export default BlueprintAI;
