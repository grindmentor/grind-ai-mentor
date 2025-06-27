
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileModuleWrapper } from '@/components/ui/mobile-module-wrapper';
import { Search, Filter, Play, Plus, Zap, Heart, Target, Dumbbell, Timer, Star } from 'lucide-react';
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
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <MobileModuleWrapper title="Blueprint AI" onBack={onBack}>
        <div className="p-6 space-y-6 bg-gradient-to-br from-blue-900/80 to-black min-h-screen">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-blue-500/20 rounded-xl"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-blue-500/20 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </MobileModuleWrapper>
    );
  }

  const personalizedWorkouts = getPersonalizedRecommendations();

  return (
    <MobileModuleWrapper title="Blueprint AI" onBack={onBack}>
      <div className="bg-gradient-to-br from-blue-900/80 to-black min-h-screen">
        <div className="p-4 sm:p-6 space-y-6">
          {/* AI Recommendations Section */}
          {personalizedWorkouts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-white">AI Recommendations</h2>
              </div>
              <div className="grid gap-3">
                {personalizedWorkouts.map((workout) => (
                  <Card 
                    key={`rec-${workout.id}`}
                    className="bg-gradient-to-r from-blue-600/30 to-blue-800/40 backdrop-blur-sm border-blue-500/30 hover:scale-[1.02] transition-all duration-200"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(workout.category)}
                          <h3 className="font-semibold text-white">{workout.title}</h3>
                        </div>
                        <Badge className={getDifficultyColor(workout.difficulty)}>
                          {workout.difficulty}
                        </Badge>
                      </div>
                      <p className="text-white/80 text-sm mb-3">{workout.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-sm text-white/70">
                          <span className="flex items-center">
                            <Timer className="w-3 h-3 mr-1" />
                            {workout.duration}
                          </span>
                          <span>{workout.exercises.length} exercises</span>
                        </div>
                        <Button
                          onClick={() => addToWorkoutLog(workout)}
                          size="sm"
                          className="bg-blue-500/30 hover:bg-blue-500/50 text-white border-0"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search workouts, exercises, or goals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-gray-900/50 border-blue-500/30 text-white placeholder:text-gray-400 h-12"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-gray-900/50 border-blue-500/30 text-white h-12">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="Split Programs">Split Programs</SelectItem>
                  <SelectItem value="Single Workouts">Single Workouts</SelectItem>
                  <SelectItem value="Cardio">Cardio</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="bg-gray-900/50 border-blue-500/30 text-white h-12">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Levels</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Workout Templates Grid */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">All Blueprints</h2>
            
            {filteredWorkouts.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No workouts found</h3>
                <p className="text-gray-400">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredWorkouts.map((workout) => (
                  <Card 
                    key={workout.id}
                    className="bg-gradient-to-r from-blue-600/20 to-blue-800/30 backdrop-blur-sm border-blue-500/30 hover:scale-[1.02] transition-all duration-200"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(workout.category)}
                          <CardTitle className="text-white text-lg">{workout.title}</CardTitle>
                        </div>
                        <Badge className={getDifficultyColor(workout.difficulty)}>
                          {workout.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-white/80 text-sm">{workout.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {workout.focus.map((focus, index) => (
                          <Badge 
                            key={index}
                            variant="outline" 
                            className="border-blue-400/30 text-blue-300 bg-blue-500/10"
                          >
                            {focus}
                          </Badge>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-white/70">
                          <span className="flex items-center">
                            <Timer className="w-3 h-3 mr-1" />
                            {workout.duration}
                          </span>
                          <span>{workout.exercises.length} exercises</span>
                        </div>
                        
                        <div className="space-y-1">
                          {workout.exercises.slice(0, 3).map((exercise, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedExercise(exercise)}
                              className="w-full text-left p-2 bg-blue-500/10 rounded text-sm text-white/80 hover:bg-blue-500/20 transition-colors border border-blue-500/20"
                            >
                              {exercise.name} - {exercise.sets} sets × {exercise.reps}
                            </button>
                          ))}
                          {workout.exercises.length > 3 && (
                            <p className="text-xs text-white/60 px-2">
                              +{workout.exercises.length - 3} more exercises
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          onClick={() => addToWorkoutLog(workout)}
                          className="flex-1 bg-blue-500/30 hover:bg-blue-500/50 text-white border-0"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add to Log
                        </Button>
                        <Button
                          variant="outline"
                          className="border-blue-400/30 text-blue-300 hover:bg-blue-500/20"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
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
