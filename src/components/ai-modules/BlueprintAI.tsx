import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileModuleWrapper } from '@/components/ui/mobile-module-wrapper';
import { Search, Filter, Eye, Zap, Heart, Target, Dumbbell, Timer, Star, Flame, Activity, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { expandedWorkoutTemplates } from '@/data/expandedWorkoutTemplates';
import { WorkoutDetailModal } from '@/components/ai-modules/WorkoutDetailModal';
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
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutTemplate | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  useEffect(() => {
    loadWorkouts();
  }, []);

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
      // Load expanded workout templates
      setWorkouts(expandedWorkoutTemplates);
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

  const getPersonalizedRecommendations = () => {
    if (!userProfile) return workouts.slice(0, 3);

    const userGoal = userProfile.goal;
    const userExperience = userProfile.experience;

    // Prioritize evidence-based, lower-volume workouts based on 2023-2025 research
    const evidenceBasedWorkouts = workouts.filter(workout => 
      workout.focus.includes('Evidence-Based') || 
      workout.focus.includes('Minimalist') ||
      workout.focus.includes('High-Intensity')
    );

    const filteredWorkouts = workouts
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
      });

    // Combine evidence-based workouts with user-specific ones
    const recommendations = [...evidenceBasedWorkouts.slice(0, 2), ...filteredWorkouts.slice(0, 1)];
    return recommendations.slice(0, 3);
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
        <div className="min-h-screen bg-background">
          <div className="p-6 space-y-6">
            <div className="animate-pulse space-y-6">
              <div className="h-16 bg-muted rounded-2xl border border-border"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-muted rounded-2xl border border-border"></div>
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
      <div className="min-h-screen bg-background">
        <div className="p-4 sm:p-6 space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-8">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-primary/20">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">AI-Powered Workout Blueprints</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Scientifically crafted workout plans based on 2023-2025 research
            </p>
            
            {/* Research Integration Notice */}
            <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20 max-w-lg mx-auto">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-accent-foreground font-medium text-sm">Latest Research Integration</span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Templates now incorporate 2023-2025 findings emphasizing lower-volume, high-effort training with 3-5 minute rest periods for optimal strength and hypertrophy adaptations.
              </p>
            </div>
          </div>

          {/* AI Recommendations */}
          {personalizedWorkouts.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Recommended for You</h2>
                  <p className="text-muted-foreground text-sm">Based on your fitness profile & latest research</p>
                </div>
              </div>
              
              <div className="grid gap-4">
                {personalizedWorkouts.map((workout) => (
                  <Card 
                    key={`rec-${workout.id}`}
                    className="group bg-card/50 backdrop-blur-sm border-border hover:border-primary/40 transition-all duration-300 hover:shadow-lg"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-accent/30 rounded-xl flex items-center justify-center border border-accent/50">
                            {getCategoryIcon(workout.category)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground text-lg">{workout.title}</h3>
                            <div className="flex items-center space-x-3 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center">
                                <Timer className="w-3 h-3 mr-1" />
                                {workout.duration}
                              </span>
                              <span>{workout.exercises.length} exercises</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge className={getDifficultyColor(workout.difficulty)}>
                            {workout.difficulty}
                          </Badge>
                          {workout.focus.includes('Evidence-Based') && (
                            <Badge className="bg-accent/30 text-accent-foreground border-accent/50 text-xs">
                              2023-2025 Research
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{workout.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {workout.focus.slice(0, 3).map((focus, index) => (
                          <Badge 
                            key={index}
                            variant="outline" 
                            className="border-border text-muted-foreground bg-accent/10 text-xs"
                          >
                            {focus}
                          </Badge>
                        ))}
                      </div>

                      <Button
                        onClick={() => setSelectedWorkout(workout)}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 border-0 font-medium"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Full Workout
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center">
              <Flame className="w-5 h-5 mr-2 text-primary" />
              Explore All Blueprints
            </h2>
            
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search workouts, exercises, or goals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 bg-input border-border text-foreground placeholder:text-muted-foreground h-14 text-base rounded-2xl focus:border-primary/60 transition-all"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-input border-border text-foreground h-12 rounded-xl">
                    <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="All">All Categories</SelectItem>
                    <SelectItem value="Split Programs">Split Programs</SelectItem>
                    <SelectItem value="Single Workouts">Single Workouts</SelectItem>
                    <SelectItem value="Cardio">Cardio</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="bg-input border-border text-foreground h-12 rounded-xl">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
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
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted/30 flex items-center justify-center border border-border">
                  <Target className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No blueprints found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredWorkouts.map((workout) => (
                  <Card 
                    key={workout.id}
                    className="group bg-card/50 backdrop-blur-sm border-border hover:border-primary/40 transition-all duration-300 hover:shadow-lg"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-accent/30 rounded-lg flex items-center justify-center border border-accent/50">
                            {getCategoryIcon(workout.category)}
                          </div>
                          <CardTitle className="text-card-foreground text-lg">{workout.title}</CardTitle>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge className={getDifficultyColor(workout.difficulty)}>
                            {workout.difficulty}
                          </Badge>
                          {workout.focus.includes('Evidence-Based') && (
                            <Badge className="bg-accent/30 text-accent-foreground border-accent/50 text-xs">
                              Research-Based
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground text-sm leading-relaxed">{workout.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {workout.focus.map((focus, index) => (
                          <Badge 
                            key={index}
                            variant="outline" 
                            className="border-border text-muted-foreground bg-accent/10 text-xs"
                          >
                            {focus}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground py-2">
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
                            className="w-full text-left p-3 bg-accent/10 rounded-lg text-sm text-accent-foreground hover:bg-accent/20 transition-colors border border-accent/20 hover:border-accent/40"
                          >
                            <span className="font-medium">{exercise.name}</span>
                            <span className="text-muted-foreground ml-2">• {exercise.sets} sets × {exercise.reps}</span>
                          </button>
                        ))}
                        {workout.exercises.length > 2 && (
                          <p className="text-xs text-muted-foreground px-3">
                            +{workout.exercises.length - 2} more exercises
                          </p>
                        )}
                      </div>

                      <Button
                        onClick={() => setSelectedWorkout(workout)}
                        className="w-full bg-primary/20 hover:bg-primary/30 text-primary-foreground border border-primary/20 hover:border-primary/40 font-medium transition-all"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Full Workout
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Workout Detail Modal */}
      {selectedWorkout && (
        <WorkoutDetailModal
          workout={selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
        />
      )}

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
