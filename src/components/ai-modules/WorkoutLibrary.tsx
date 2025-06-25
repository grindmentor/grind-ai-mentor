
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BarChart3, ArrowLeft, Search, Filter, Play, Target, Dumbbell, Clock, BookOpen, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface WorkoutLibraryProps {
  onBack: () => void;
}

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_groups: string[];
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  instructions: string[];
  tips?: string[];
  videoUrl?: string;
}

const WorkoutLibrary = ({ onBack }: WorkoutLibraryProps) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load sample exercises
    const sampleExercises: Exercise[] = [
      {
        id: '1',
        name: 'Push-ups',
        category: 'chest',
        muscle_groups: ['chest', 'shoulders', 'triceps'],
        equipment: 'bodyweight',
        difficulty: 'beginner',
        description: 'Classic upper body exercise targeting chest, shoulders, and triceps.',
        instructions: [
          'Start in plank position with hands shoulder-width apart',
          'Lower your body until chest nearly touches the floor',
          'Push back up to starting position',
          'Keep your body in a straight line throughout'
        ],
        tips: [
          'Keep core engaged throughout the movement',
          'Don\'t let hips sag or rise',
          'Control the descent - don\'t drop down quickly'
        ]
      },
      {
        id: '2',
        name: 'Squats',
        category: 'legs',
        muscle_groups: ['quadriceps', 'glutes', 'hamstrings'],
        equipment: 'bodyweight',
        difficulty: 'beginner',
        description: 'Fundamental lower body exercise for leg and glute strength.',
        instructions: [
          'Stand with feet shoulder-width apart',
          'Lower your body by pushing hips back and bending knees',
          'Keep chest up and weight on heels',
          'Push through heels to return to standing'
        ],
        tips: [
          'Go as low as your mobility allows',
          'Keep knees tracking over toes',
          'Maintain neutral spine throughout'
        ]
      },
      {
        id: '3',
        name: 'Deadlifts',
        category: 'back',
        muscle_groups: ['hamstrings', 'glutes', 'lower back', 'traps'],
        equipment: 'barbell',
        difficulty: 'intermediate',
        description: 'Compound movement targeting posterior chain muscles.',
        instructions: [
          'Stand with feet hip-width apart, bar over mid-foot',
          'Hinge at hips and bend knees to grip the bar',
          'Keep chest up and back straight',
          'Drive through heels to lift the bar',
          'Reverse the movement to lower the bar'
        ],
        tips: [
          'Keep the bar close to your body',
          'Lead with your hips, not your back',
          'Maintain neutral spine throughout the lift'
        ]
      },
      {
        id: '4',
        name: 'Pull-ups',
        category: 'back',
        muscle_groups: ['lats', 'rhomboids', 'biceps'],
        equipment: 'pull-up bar',
        difficulty: 'intermediate',
        description: 'Upper body pulling exercise for back and arm strength.',
        instructions: [
          'Hang from bar with hands shoulder-width apart',
          'Pull your body up until chin clears the bar',
          'Lower yourself back to starting position with control',
          'Keep core engaged throughout'
        ],
        tips: [
          'Use full range of motion',
          'Avoid swinging or kipping',
          'Focus on pulling with your back muscles'
        ]
      },
      {
        id: '5',
        name: 'Planks',
        category: 'core',
        muscle_groups: ['core', 'shoulders', 'glutes'],
        equipment: 'bodyweight',
        difficulty: 'beginner',
        description: 'Isometric core strengthening exercise.',
        instructions: [
          'Start in push-up position on forearms',
          'Keep body in straight line from head to heels',
          'Hold position while breathing normally',
          'Maintain tension in core and glutes'
        ],
        tips: [
          'Don\'t let hips sag or pike up',
          'Keep breathing steady',
          'Start with shorter holds and build up'
        ]
      }
    ];
    
    setExercises(sampleExercises);
    setIsLoading(false);
  }, []);

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.muscle_groups.some(muscle => muscle.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || exercise.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = ['all', 'chest', 'back', 'legs', 'shoulders', 'arms', 'core'];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const handleViewExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-violet-900/20 to-violet-700 text-white flex items-center justify-center animate-fade-in">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-400"></div>
          <span className="text-slate-400">Loading workout library...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-violet-900/20 to-violet-700 text-white p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={onBack} 
              className="text-slate-400 hover:text-white hover:bg-slate-800/50"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Dashboard
            </Button>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-violet-500/20 to-violet-700/40 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl shadow-violet-500/25 border border-violet-400/20">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">
                  Workout Library
                </h1>
                <p className="text-slate-400 text-lg">Comprehensive exercise database with detailed instructions</p>
              </div>
            </div>
          </div>
          
          <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 px-4 py-2">
            <Dumbbell className="w-4 h-4 mr-2" />
            {exercises.length} Exercises
          </Badge>
        </div>

        {/* Search and Filter Bar */}
        <Card className="bg-slate-900/20 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400 w-4 h-4" />
                  <Input
                    placeholder="Search exercises or muscle groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800/30 border-slate-600/50 text-white focus:border-violet-500 backdrop-blur-sm"
                  />
                </div>
              </div>
              
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 bg-slate-800/30 border border-slate-600/50 text-white rounded-lg focus:border-violet-500 backdrop-blur-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category} className="bg-slate-800">
                      {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full p-3 bg-slate-800/30 border border-slate-600/50 text-white rounded-lg focus:border-violet-500 backdrop-blur-sm"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty} className="bg-slate-800">
                      {difficulty === 'all' ? 'All Levels' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.id} className="bg-slate-900/20 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/30 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white text-lg">{exercise.name}</CardTitle>
                    <CardDescription className="text-slate-400 capitalize">
                      {exercise.category} • {exercise.equipment}
                    </CardDescription>
                  </div>
                  <Badge className={getDifficultyColor(exercise.difficulty)}>
                    {exercise.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-slate-400 text-sm">{exercise.description}</p>
                
                <div className="flex flex-wrap gap-1">
                  {exercise.muscle_groups.map((muscle) => (
                    <Badge key={muscle} className="bg-violet-600/20 text-violet-300 border-violet-500/30 text-xs">
                      {muscle}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="text-white font-medium text-sm">Instructions:</h4>
                  <ol className="text-slate-400 text-xs space-y-1">
                    {exercise.instructions.slice(0, 2).map((instruction, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-violet-400 mr-2">{index + 1}.</span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                    {exercise.instructions.length > 2 && (
                      <li className="text-violet-400 text-xs">... and {exercise.instructions.length - 2} more steps</li>
                    )}
                  </ol>
                </div>

                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:border-violet-500/50 backdrop-blur-sm"
                  onClick={() => handleViewExercise(exercise)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  View Full Exercise
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">No exercises found</h3>
            <p className="text-slate-400">Try adjusting your search terms or filters</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Exercises", value: exercises.length, icon: Dumbbell },
            { label: "Categories", value: categories.length - 1, icon: Target },
            { label: "Equipment Types", value: "12+", icon: BarChart3 },
            { label: "Difficulty Levels", value: 3, icon: Clock }
          ].map((stat, index) => (
            <Card key={index} className="bg-slate-900/20 border-slate-700/30 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <stat.icon className="w-6 h-6 text-violet-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Exercise Detail Modal */}
      <Dialog open={!!selectedExercise} onOpenChange={() => setSelectedExercise(null)}>
        <DialogContent className="max-w-2xl bg-slate-900/95 border-slate-700 text-white backdrop-blur-lg">
          {selectedExercise && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-2xl font-bold text-white">
                      {selectedExercise.name}
                    </DialogTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getDifficultyColor(selectedExercise.difficulty)}>
                        {selectedExercise.difficulty}
                      </Badge>
                      <Badge className="bg-violet-600/20 text-violet-300 border-violet-500/30">
                        {selectedExercise.equipment}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedExercise(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                <p className="text-slate-300 text-lg">{selectedExercise.description}</p>
                
                <div>
                  <h3 className="text-white font-semibold text-lg mb-3">Target Muscles</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise.muscle_groups.map((muscle) => (
                      <Badge key={muscle} className="bg-violet-600/20 text-violet-300 border-violet-500/30">
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-3">Instructions</h3>
                  <ol className="space-y-2">
                    {selectedExercise.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-violet-400 font-medium mr-3 min-w-[1.5rem]">{index + 1}.</span>
                        <span className="text-slate-300">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {selectedExercise.tips && selectedExercise.tips.length > 0 && (
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-3">Pro Tips</h3>
                    <ul className="space-y-2">
                      {selectedExercise.tips.map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-violet-400 mr-3">•</span>
                          <span className="text-slate-300">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkoutLibrary;
