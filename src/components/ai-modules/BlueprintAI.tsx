
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Dumbbell, Clock, Target, Zap, Search, Filter, Star } from 'lucide-react';
import { WorkoutDetailModal } from './WorkoutDetailModal';
import { MobileHeader } from '@/components/MobileHeader';
import { useIsMobile } from '@/hooks/use-mobile';

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

export const BlueprintAI: React.FC<BlueprintAIProps> = ({ onBack }) => {
  const isMobile = useIsMobile();
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  // Mock workout data
  const workoutTemplates: WorkoutTemplate[] = [
    {
      id: '1',
      title: 'Push Pull Legs',
      category: 'Split Programs',
      duration: '60-75 min',
      difficulty: 'Intermediate',
      description: 'A classic 3-day split focusing on push movements, pull movements, and legs. Perfect for building strength and muscle mass.',
      focus: ['Strength', 'Hypertrophy', 'Upper Body', 'Lower Body'],
      exercises: [
        {
          id: 'e1',
          name: 'Bench Press',
          sets: 4,
          reps: '6-8',
          rest: '3 min',
          primary_muscles: ['Chest', 'Triceps'],
          equipment: 'Barbell',
          difficulty_level: 'Intermediate'
        },
        {
          id: 'e2',
          name: 'Incline Dumbbell Press',
          sets: 3,
          reps: '8-10',
          rest: '2-3 min',
          primary_muscles: ['Upper Chest', 'Shoulders'],
          equipment: 'Dumbbells',
          difficulty_level: 'Intermediate'
        }
      ],
      color: 'from-blue-900/40 to-indigo-900/60'
    },
    {
      id: '2',
      title: 'Full Body Strength',
      category: 'Single Workouts',
      duration: '45-60 min',
      difficulty: 'Beginner',
      description: 'Complete full-body workout targeting all major muscle groups. Ideal for beginners or those with limited time.',
      focus: ['Strength', 'Full Body', 'Compound Movements'],
      exercises: [
        {
          id: 'e3',
          name: 'Squats',
          sets: 3,
          reps: '8-12',
          rest: '2-3 min',
          primary_muscles: ['Quadriceps', 'Glutes'],
          equipment: 'Barbell',
          difficulty_level: 'Beginner'
        }
      ],
      color: 'from-green-900/40 to-emerald-900/60'
    },
    {
      id: '3',
      title: 'HIIT Cardio Blast',
      category: 'Cardio',
      duration: '20-30 min',
      difficulty: 'Advanced',
      description: 'High-intensity interval training designed to burn fat and improve cardiovascular fitness quickly.',
      focus: ['Cardio', 'Fat Loss', 'Conditioning'],
      exercises: [
        {
          id: 'e4',
          name: 'Burpees',
          sets: 4,
          reps: '30 sec',
          rest: '30 sec',
          primary_muscles: ['Full Body'],
          equipment: 'Bodyweight',
          difficulty_level: 'Advanced'
        }
      ],
      color: 'from-red-900/40 to-rose-900/60'
    }
  ];

  const filteredWorkouts = workoutTemplates.filter(workout => {
    const matchesSearch = workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workout.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workout.focus.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || workout.category === filterCategory;
    const matchesDifficulty = filterDifficulty === 'all' || workout.difficulty === filterDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
      case 'Intermediate': return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
      case 'Advanced': return 'bg-rose-500/20 text-rose-300 border-rose-400/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-400/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Split Programs': return <Target className="w-4 h-4" />;
      case 'Single Workouts': return <Dumbbell className="w-4 h-4" />;
      case 'Cardio': return <Zap className="w-4 h-4" />;
      default: return <Dumbbell className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-950/50 to-orange-900/30">
      <MobileHeader 
        title="Blueprint AI" 
        onBack={onBack}
      />
      
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/30 backdrop-blur-sm border-orange-500/30">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500/30 to-red-500/40 rounded-xl flex items-center justify-center border border-orange-500/30">
                <Target className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <CardTitle className="text-white text-xl">Blueprint AI</CardTitle>
                <CardDescription className="text-orange-200/80">
                  Discover science-backed workout templates and training programs
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-orange-200">Search Workouts</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-4 h-4" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, focus, or muscle..."
                    className="pl-10 bg-orange-900/30 border-orange-500/50 text-white placeholder:text-orange-200/50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-orange-200">Category</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="bg-orange-900/30 border-orange-500/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-orange-900 border-orange-500">
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Split Programs">Split Programs</SelectItem>
                    <SelectItem value="Single Workouts">Single Workouts</SelectItem>
                    <SelectItem value="Cardio">Cardio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-orange-200">Difficulty</Label>
                <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                  <SelectTrigger className="bg-orange-900/30 border-orange-500/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-orange-900 border-orange-500">
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Workout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWorkouts.map((workout) => (
                <Card 
                  key={workout.id} 
                  className={`bg-gradient-to-br ${workout.color} backdrop-blur-sm border-orange-500/30 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group`}
                  onClick={() => setSelectedWorkout(workout)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <h3 className="font-semibold text-white text-sm group-hover:text-orange-100 transition-colors">
                            {workout.title}
                          </h3>
                          <div className="flex items-center space-x-2 text-xs text-orange-200/80">
                            {getCategoryIcon(workout.category)}
                            <span>{workout.category}</span>
                          </div>
                        </div>
                        <Badge className={getDifficultyColor(workout.difficulty)}>
                          {workout.difficulty}
                        </Badge>
                      </div>

                      {/* Duration */}
                      <div className="flex items-center space-x-2 text-orange-200/90">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{workout.duration}</span>
                      </div>

                      {/* Focus Areas */}
                      <div className="flex flex-wrap gap-1">
                        {workout.focus.slice(0, 3).map((focus, index) => (
                          <Badge 
                            key={index}
                            variant="outline" 
                            className="border-orange-400/30 text-orange-300 bg-orange-500/10 text-xs"
                          >
                            {focus}
                          </Badge>
                        ))}
                        {workout.focus.length > 3 && (
                          <Badge variant="outline" className="border-orange-400/30 text-orange-300 bg-orange-500/10 text-xs">
                            +{workout.focus.length - 3}
                          </Badge>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-orange-100/80 text-xs line-clamp-2">
                        {workout.description}
                      </p>

                      {/* Exercise Count */}
                      <div className="flex items-center justify-between pt-2 border-t border-orange-500/20">
                        <div className="flex items-center space-x-1 text-orange-200/80">
                          <Dumbbell className="w-3 h-3" />
                          <span className="text-xs">{workout.exercises.length} exercises</span>
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-orange-600/80 hover:bg-orange-600 text-xs h-6 px-2"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredWorkouts.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-orange-400/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-orange-200 mb-2">No workouts found</h3>
                <p className="text-orange-300/70">
                  Try adjusting your search criteria or filters
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Workout Detail Modal */}
      {selectedWorkout && (
        <WorkoutDetailModal
          workout={selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
        />
      )}
    </div>
  );
};

export default BlueprintAI;
